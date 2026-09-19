import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";

export const STORAGE_KEY = "gprflowLang";
export const DEFAULT_LANGUAGE = "en";

// `locale` feeds Intl (numbers, dates); English is bundled as the fallback, the rest load on demand.
export const LANGUAGES = [
  { code: "en", label: "English", locale: "en-US" },
  { code: "it", label: "Italiano", locale: "it-IT" },
  { code: "fr", label: "Français", locale: "fr-FR" },
  { code: "de", label: "Deutsch", locale: "de-DE" },
  { code: "es", label: "Español", locale: "es-ES" },
];

const CODES = LANGUAGES.map((l) => l.code);

const loaders = {
  it: () => import("./locales/it.json"),
  fr: () => import("./locales/fr.json"),
  de: () => import("./locales/de.json"),
  es: () => import("./locales/es.json"),
};

const loadBundle = async (code) => {
  if (!loaders[code] || i18n.hasResourceBundle(code, "translation")) return;
  const module = await loaders[code]();
  i18n.addResourceBundle(code, "translation", module.default, true, true);
};

const syncDocument = (code) => {
  document.documentElement.lang = code;
};

export const currentLocale = () =>
  LANGUAGES.find((l) => l.code === i18n.language)?.locale ?? "en-US";

export const setLanguage = async (code) => {
  if (!CODES.includes(code)) return;
  await loadBundle(code);
  await i18n.changeLanguage(code);
};

export const initI18n = async () => {
  await i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en } },
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: CODES,
      nonExplicitSupportedLngs: false,
      load: "languageOnly",
      interpolation: { escapeValue: false },
      returnNull: false,
      detection: {
        order: ["localStorage", "navigator"],
        lookupLocalStorage: STORAGE_KEY,
        caches: ["localStorage"],
        convertDetectedLanguage: (lng) => lng.split("-")[0],
      },
    });

  await loadBundle(i18n.language);
  syncDocument(i18n.language);
  i18n.on("languageChanged", syncDocument);
};

export default i18n;
