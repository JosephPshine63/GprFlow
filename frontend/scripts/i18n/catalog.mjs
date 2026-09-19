import fs from "node:fs";
import path from "node:path";

export const LOCALES_DIR = path.resolve("src/i18n/locales");
export const OVERRIDES_DIR = path.resolve("src/i18n/overrides");
export const LOCK_FILE = path.resolve("src/i18n/translations.lock.json");
export const SOURCE = "en";
export const LANGUAGES = ["en", "it", "fr", "de", "es"];

export const readJson = (file, fallback = {}) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return fallback;
    throw error;
  }
};

export const flatten = (tree, prefix = "", out = {}) => {
  for (const [key, value] of Object.entries(tree)) {
    const full = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object") flatten(value, full, out);
    else out[full] = value;
  }
  return out;
};

export const unflatten = (flat) => {
  const tree = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split(".");
    let node = tree;
    for (const part of parts.slice(0, -1)) node = node[part] ??= {};
    node[parts.at(-1)] = value;
  }
  return tree;
};

export const loadLocale = (lang) => flatten(readJson(path.join(LOCALES_DIR, `${lang}.json`)));

export const writeLocale = (lang, flat) =>
  fs.writeFileSync(
    path.join(LOCALES_DIR, `${lang}.json`),
    JSON.stringify(unflatten(flat), null, 2) + "\n"
  );

export const loadOverrides = (lang) => flatten(readJson(path.join(OVERRIDES_DIR, `${lang}.json`)));

export const placeholders = (text) => [...String(text).matchAll(/{{\s*[\w.]+\s*}}/g)].map((m) => m[0]).sort();
