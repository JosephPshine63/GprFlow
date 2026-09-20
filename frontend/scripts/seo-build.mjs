// Runs after `vite build`. The app is a SPA, so crawlers and link previews would only ever see an
// empty <div id="root">. This writes dist/landing/<lang>.html: dist/index.html with the head tags
// (title, description, canonical, hreflang, Open Graph, JSON-LD) and a static copy of the landing
// page for that language. nginx serves them on / and /<lang>; React replaces the snapshot on mount.
// Copy comes from the landing.* keys of the locale files, the same ones pages/Landing/Landing.jsx uses.
import fs from "node:fs";
import path from "node:path";
import { LANGUAGES, SOURCE, loadLocale } from "./i18n/catalog.mjs";

const SITE = "https://gprflow.trade";
const DIST = path.resolve("dist");
const OUT = path.join(DIST, "landing");

const LABELS = { en: "English", it: "Italiano", fr: "Français", de: "Deutsch", es: "Español" };
const OG_LOCALES = { en: "en_US", it: "it_IT", fr: "fr_FR", de: "de_DE", es: "es_ES" };
const FEATURES = ["markets", "trading", "portfolio", "wallet", "assistant", "security"];
const STEPS = ["signup", "topup", "trade"];

const KEYS = [
  "landing.metaTitle",
  "landing.metaDescription",
  "landing.h1",
  "landing.subtitle",
  "landing.ctaSignup",
  "landing.ctaSignin",
  "landing.languages",
  "landing.featuresTitle",
  "landing.stepsTitle",
  "landing.demoTitle",
  "landing.demoBody",
  ...FEATURES.flatMap((key) => [`landing.features.${key}.title`, `landing.features.${key}.body`]),
  ...STEPS.flatMap((key) => [`landing.steps.${key}.title`, `landing.steps.${key}.body`]),
];

const pathFor = (code) => (code === SOURCE ? "/" : `/${code}`);
const urlFor = (code) => `${SITE}${pathFor(code)}`;

const esc = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const fail = (message) => {
  console.error(`seo-build: ${message}`);
  process.exit(1);
};

const replaceOnce = (html, pattern, replacement, what) => {
  if (!pattern.test(html)) fail(`${what} not found in dist/index.html`);
  return html.replace(pattern, () => replacement);
};

const snapshot = (t, code) => `<div id="seo-snapshot" class="min-h-screen bg-background text-foreground">
<header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
<a href="${pathFor(code)}" class="flex items-center gap-3"><span class="font-heading text-xl font-bold">GprFlow</span></a>
<a href="/signin" class="btn-brand ml-2 h-10 px-4">${esc(t("landing.ctaSignin"))}</a>
</header>
<main>
<section class="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center md:pt-20">
<h1 class="font-heading text-4xl font-bold leading-tight md:text-6xl">${esc(t("landing.h1"))}</h1>
<p class="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">${esc(t("landing.subtitle"))}</p>
<div class="mt-8 flex flex-wrap justify-center gap-3">
<a href="/signup" class="btn-brand h-12 px-8 text-base">${esc(t("landing.ctaSignup"))}</a>
<a href="/signin" class="inline-flex h-12 items-center justify-center rounded-xl border px-8 text-base font-semibold hover:bg-accent">${esc(t("landing.ctaSignin"))}</a>
</div>
</section>
<section class="mx-auto max-w-6xl px-6 py-12">
<h2 class="text-center font-heading text-3xl font-bold">${esc(t("landing.featuresTitle"))}</h2>
<div class="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
${FEATURES.map(
  (key) => `<article class="surface p-6"><h3 class="text-lg font-semibold">${esc(t(`landing.features.${key}.title`))}</h3><p class="mt-2 text-sm text-muted-foreground">${esc(t(`landing.features.${key}.body`))}</p></article>`
).join("\n")}
</div>
</section>
<section class="mx-auto max-w-6xl px-6 py-12">
<h2 class="text-center font-heading text-3xl font-bold">${esc(t("landing.stepsTitle"))}</h2>
<ol class="mt-8 grid gap-4 md:grid-cols-3">
${STEPS.map(
  (key, index) => `<li class="surface p-6"><span class="font-heading text-3xl font-bold text-gradient">${index + 1}</span><h3 class="mt-3 text-lg font-semibold">${esc(t(`landing.steps.${key}.title`))}</h3><p class="mt-2 text-sm text-muted-foreground">${esc(t(`landing.steps.${key}.body`))}</p></li>`
).join("\n")}
</ol>
</section>
<section class="mx-auto max-w-3xl px-6 py-12">
<div class="surface-glass p-6 text-center"><h2 class="text-xl font-semibold">${esc(t("landing.demoTitle"))}</h2><p class="mt-2 text-sm text-muted-foreground">${esc(t("landing.demoBody"))}</p></div>
</section>
</main>
<footer class="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-muted-foreground">
<nav aria-label="${esc(t("landing.languages"))}" class="flex flex-wrap justify-center gap-x-5 gap-y-2">
${LANGUAGES.map((next) => `<a href="${pathFor(next)}" hreflang="${next}" lang="${next}" class="hover:text-foreground hover:underline">${LABELS[next]}</a>`).join("\n")}
</nav>
<p class="mt-6">gprflow.trade</p>
</footer>
</div>`;

const headTags = (t, code) => {
  const title = t("landing.metaTitle");
  const description = t("landing.metaDescription");
  const url = urlFor(code);
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "GprFlow",
    url,
    description,
    inLanguage: code,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  }).replace(/</g, "\\u003c");

  return [
    `<link rel="canonical" href="${url}" />`,
    ...LANGUAGES.map((next) => `<link rel="alternate" hreflang="${next}" href="${urlFor(next)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${urlFor(SOURCE)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(description)}" />`,
    `<meta property="og:image" content="${SITE}/brand/og-image.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="${OG_LOCALES[code]}" />`,
    ...LANGUAGES.filter((next) => next !== code).map(
      (next) => `<meta property="og:locale:alternate" content="${OG_LOCALES[next]}" />`
    ),
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(description)}" />`,
    `<meta name="twitter:image" content="${SITE}/brand/og-image.png" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ]
    .map((tag) => `    ${tag}`)
    .join("\n");
};

const indexFile = path.join(DIST, "index.html");
if (!fs.existsSync(indexFile)) fail("dist/index.html is missing, run vite build first");
const template = fs.readFileSync(indexFile, "utf8");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const code of LANGUAGES) {
  const strings = loadLocale(code);
  const missing = KEYS.filter((key) => typeof strings[key] !== "string" || strings[key] === "");
  if (missing.length) fail(`${code}.json is missing ${missing.join(", ")} (run npm run i18n:translate)`);
  const t = (key) => strings[key];

  let html = template;
  html = replaceOnce(html, /<html lang="[^"]*"/, `<html lang="${code}"`, "<html lang>");
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(t("landing.metaTitle"))}</title>`, "<title>");
  html = replaceOnce(
    html,
    /<meta name="description"[^>]*>/,
    `<meta name="description" content="${esc(t("landing.metaDescription"))}" />`,
    "meta description"
  );
  html = replaceOnce(html, /<meta name="robots"[^>]*>/, `<meta name="robots" content="index, follow" />`, "meta robots");
  html = replaceOnce(html, /<\/head>/, `${headTags(t, code)}\n  </head>`, "</head>");
  html = replaceOnce(html, /<div id="root"><\/div>/, `<div id="root">${snapshot(t, code)}</div>`, "#root");

  fs.writeFileSync(path.join(OUT, `${code}.html`), html);
}

console.log(`seo-build: wrote ${LANGUAGES.length} landing pages to dist/landing`);
