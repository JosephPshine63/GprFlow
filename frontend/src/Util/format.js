import { currentLocale } from "@/i18n";

// The platform is USD-only; the language only changes separators, symbol placement and date style.
const cache = new Map();

const formatter = (kind, options) => {
  const locale = currentLocale();
  const key = `${locale}:${kind}`;
  if (!cache.has(key)) cache.set(key, new Intl.NumberFormat(locale, options));
  return cache.get(key);
};

const currency = { style: "currency", currency: "USD" };
const usd = () => formatter("usd", currency);
const usdSmall = () => formatter("usdSmall", { ...currency, maximumFractionDigits: 6 });
const compact = () =>
  formatter("compact", { ...currency, notation: "compact", maximumFractionDigits: 2 });
const number = () => formatter("number", { maximumFractionDigits: 8 });
const percent = () =>
  formatter("percent", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

// Sub-dollar prices need more decimals to stay meaningful.
export const formatCurrency = (v) => {
  if (!isNum(v)) return "-";
  return Math.abs(v) > 0 && Math.abs(v) < 1 ? usdSmall().format(v) : usd().format(v);
};

export const formatSignedCurrency = (v) => {
  if (!isNum(v)) return "-";
  return `${v > 0 ? "+" : ""}${formatCurrency(v)}`;
};

export const formatCompact = (v) => (isNum(v) ? compact().format(v) : "-");

export const formatNumber = (v) => (isNum(v) ? number().format(v) : "-");

// Plain grouped number with no currency, for chart axes and tooltips.
export const formatGrouped = (v) => (isNum(v) ? formatter("grouped", {}).format(v) : "-");

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

// LocalDate strings ("2026-09-19") must not shift day with the viewer's timezone.
export const formatDate = (v) => {
  if (!v) return "-";
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(currentLocale(), {
    dateStyle: "medium",
    ...(typeof v === "string" && dateOnly.test(v) ? { timeZone: "UTC" } : {}),
  });
};

export const formatDateTime = (v) => {
  if (!v) return "-";
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(currentLocale(), { dateStyle: "medium", timeStyle: "short" });
};

export const formatPercent = (v) => {
  if (!isNum(v)) return "-";
  return `${v >= 0 ? "+" : ""}${percent().format(v)}%`;
};
