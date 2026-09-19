const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const usdSmall = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 6,
});

const compact = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 });

const isNum = (v) => typeof v === "number" && Number.isFinite(v);

// Sub-dollar prices need more decimals to stay meaningful.
export const formatCurrency = (v) => {
  if (!isNum(v)) return "-";
  return Math.abs(v) > 0 && Math.abs(v) < 1 ? usdSmall.format(v) : usd.format(v);
};

export const formatSignedCurrency = (v) => {
  if (!isNum(v)) return "-";
  return `${v > 0 ? "+" : ""}${formatCurrency(v)}`;
};

export const formatCompact = (v) => (isNum(v) ? compact.format(v) : "-");

export const formatNumber = (v) => (isNum(v) ? number.format(v) : "-");

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

// LocalDate strings ("2026-09-19") must not shift day with the viewer's timezone.
export const formatDate = (v) => {
  if (!v) return "-";
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("it-IT", {
    dateStyle: "medium",
    ...(typeof v === "string" && dateOnly.test(v) ? { timeZone: "UTC" } : {}),
  });
};

export const formatDateTime = (v) => {
  if (!v) return "-";
  const date = new Date(v);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
};

export const formatPercent = (v) => {
  if (!isNum(v)) return "-";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
};
