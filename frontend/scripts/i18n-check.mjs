// Verifies the locale catalogs against the source: keys used in code exist, no dead keys,
// no stale keys in translations, placeholders match. Missing translations only warn (English
// is the fallback) unless --strict is passed.
import fs from "node:fs";
import path from "node:path";
import { LANGUAGES, SOURCE, loadLocale, placeholders } from "./i18n/catalog.mjs";

const strict = process.argv.includes("--strict");
const PLURAL = /_(zero|one|two|few|many|other)$/;
const base = (key) => key.replace(PLURAL, "");

const walk = (dir, out = []) => {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!["ui", "locales", "overrides"].includes(name)) walk(full, out);
    } else if (/\.(jsx?|html)$/.test(name)) out.push(full);
  }
  return out;
};

const source = loadLocale(SOURCE);
const keys = new Set(Object.keys(source).map(base));
const errors = [];
const warnings = [];

const used = new Set();
const prefixes = [];
const called = [];
for (const file of walk("src")) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/\bt\(\s*(["'`])([^"'`]+)\1/g)) {
    const [, , key] = m;
    if (key.includes("${")) prefixes.push(key.slice(0, key.indexOf("${")));
    else {
      called.push([file, key]);
      used.add(key);
    }
  }
  // keys held in data (nav items, schema messages, ...) are plain string literals
  for (const m of text.matchAll(/["'`]([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9_]+)+)["'`]/g)) {
    if (keys.has(m[1])) used.add(m[1]);
  }
}

for (const [file, key] of called) {
  if (!keys.has(key) && key.includes(".")) errors.push(`${file}: missing key "${key}" in ${SOURCE}.json`);
}
for (const key of keys) {
  if (!used.has(key) && !prefixes.some((p) => key.startsWith(p))) errors.push(`unused key "${key}"`);
}

for (const lang of LANGUAGES.filter((l) => l !== SOURCE)) {
  const locale = loadLocale(lang);
  let missing = 0;
  for (const key of Object.keys(source)) {
    if (!(key in locale)) {
      missing++;
      continue;
    }
    const a = placeholders(source[key]).join();
    const b = placeholders(locale[key]).join();
    if (a !== b) errors.push(`${lang}: placeholders differ for "${key}" ("${source[key]}" vs "${locale[key]}")`);
  }
  for (const key of Object.keys(locale)) {
    if (!(key in source)) errors.push(`${lang}: stale key "${key}"`);
  }
  if (missing) warnings.push(`${lang}: ${missing} of ${Object.keys(source).length} keys not translated yet`);
}

warnings.forEach((w) => console.warn(`warning: ${w}`));
errors.forEach((e) => console.error(`error: ${e}`));
if (errors.length || (strict && warnings.length)) process.exit(1);
console.log(`i18n ok (${keys.size} keys)`);
