// Fills src/i18n/locales/<lang>.json from en.json with the DeepL API.
//
//   npm run i18n:translate                 translate whatever is new or changed, all languages
//   npm run i18n:translate -- --lang fr,de only those languages
//   npm run i18n:translate -- --dry-run    count the characters that would be sent, no requests
//   npm run i18n:translate -- --force      redo every key
//   npm run i18n:translate -- --adopt it   trust the existing file as up to date (no requests)
//
// Needs DEEPL_API_KEY (frontend/.env or the environment). Translations that a person fixed by
// hand go in src/i18n/overrides/<lang>.json and always win over DeepL.
import crypto from "node:crypto";
import fs from "node:fs";
import {
  LANGUAGES,
  LOCK_FILE,
  SOURCE,
  loadLocale,
  loadOverrides,
  placeholders,
  readJson,
  writeLocale,
} from "./i18n/catalog.mjs";

try {
  process.loadEnvFile(".env");
} catch {
  // no .env: the key may come from the environment
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

// Terms DeepL must leave alone.
const PROTECTED = ["GprFlow", "Stripe", "SWIFT/BIC", "IBAN", "IFSC", "BSB", "USD", "2FA", "CVC", "Bitcoin", "ETH"];
const TARGET = { it: "IT", fr: "FR", de: "DE", es: "ES" };
const BATCH = 40;

const hash = (text) => crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);

const escapeXml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unescapeXml = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

// {{var}} and protected terms become <x>..</x>, which DeepL is told to ignore.
const protect = (text) => {
  let out = escapeXml(text).replace(/{{\s*([\w.]+)\s*}}/g, "<x>{{$1}}</x>");
  for (const term of PROTECTED) {
    const pattern = new RegExp(`(?<![\\w>/])${term.replace(/[/.]/g, "\\$&")}(?![\\w<])`, "g");
    out = out.replace(pattern, `<x>${term}</x>`);
  }
  return out;
};
const restore = (text) => unescapeXml(text.replace(/<\/?x>/g, ""));

const key = process.env.DEEPL_API_KEY;
const endpoint = key?.endsWith(":fx")
  ? "https://api-free.deepl.com/v2/translate"
  : "https://api.deepl.com/v2/translate";

const translateBatch = async (texts, lang) => {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        text: texts.map(protect),
        source_lang: SOURCE.toUpperCase(),
        target_lang: TARGET[lang],
        formality: "prefer_more",
        tag_handling: "xml",
        ignore_tags: ["x"],
      }),
    });
    if (res.ok) return (await res.json()).translations.map((t) => restore(t.text));
    if (res.status === 456) throw new Error("DeepL quota exceeded, try again next month or upgrade the plan");
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await new Promise((r) => setTimeout(r, 1500 * attempt));
      continue;
    }
    throw new Error(`DeepL answered ${res.status}: ${await res.text()}`);
  }
};

const source = loadLocale(SOURCE);
const lock = readJson(LOCK_FILE);
const requested = option("lang")?.split(",") ?? LANGUAGES.filter((l) => l !== SOURCE);
const adopt = option("adopt");

if (adopt) {
  const existing = loadLocale(adopt);
  lock[adopt] = {};
  for (const k of Object.keys(source)) if (k in existing) lock[adopt][k] = hash(source[k]);
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2) + "\n");
  console.log(`${adopt}: ${Object.keys(lock[adopt]).length} keys marked as up to date`);
  process.exit(0);
}

if (!flag("dry-run") && !key) {
  console.error("DEEPL_API_KEY is not set (put it in frontend/.env)");
  process.exit(1);
}

let total = 0;
for (const lang of requested) {
  if (!TARGET[lang]) {
    console.error(`unsupported language: ${lang}`);
    process.exit(1);
  }
  const current = loadLocale(lang);
  const overrides = loadOverrides(lang);
  lock[lang] ??= {};

  const result = {};
  const pending = [];
  for (const [k, text] of Object.entries(source)) {
    if (k in overrides) {
      result[k] = overrides[k];
    } else if (!flag("force") && k in current && lock[lang][k] === hash(text)) {
      result[k] = current[k];
    } else {
      pending.push(k);
    }
  }

  const chars = pending.reduce((sum, k) => sum + source[k].length, 0);
  total += chars;
  console.log(`${lang}: ${pending.length} to translate (${chars} characters)`);
  if (flag("dry-run") || pending.length === 0) {
    if (pending.length === 0) writeLocale(lang, result);
    continue;
  }

  for (let i = 0; i < pending.length; i += BATCH) {
    const slice = pending.slice(i, i + BATCH);
    const translated = await translateBatch(slice.map((k) => source[k]), lang);
    slice.forEach((k, n) => {
      if (placeholders(source[k]).join() !== placeholders(translated[n]).join()) {
        console.warn(`  skipped "${k}": DeepL changed the placeholders`);
        return;
      }
      result[k] = translated[n];
      lock[lang][k] = hash(source[k]);
    });
  }

  // keep the source key order and drop keys that no longer exist
  const ordered = Object.fromEntries(Object.keys(source).filter((k) => k in result).map((k) => [k, result[k]]));
  writeLocale(lang, ordered);
  lock[lang] = Object.fromEntries(Object.entries(lock[lang]).filter(([k]) => k in source));
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 2) + "\n");
}
console.log(`${flag("dry-run") ? "would send" : "sent"} ${total} characters`);
