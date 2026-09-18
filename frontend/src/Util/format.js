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

export const formatCompact = (v) => (isNum(v) ? compact.format(v) : "-");

export const formatNumber = (v) => (isNum(v) ? number.format(v) : "-");

export const formatPercent = (v) => {
  if (!isNum(v)) return "-";
  return `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`;
};
