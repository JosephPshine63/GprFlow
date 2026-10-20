import { cssColor } from "@/lib/theme";
import { formatBucketLabel, formatCompact, formatCurrency } from "@/Util/format";

export const CATEGORY_COLORS = ["chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6"];

// Shared look for every stats chart; colors are read at call time, so callers
// must rebuild options when the theme flips (useIsDark).
export const baseOptions = (dark) => ({
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    background: "transparent",
    fontFamily: "Inter, system-ui, sans-serif",
  },
  dataLabels: { enabled: false },
  grid: { borderColor: cssColor("border"), strokeDashArray: 4 },
  legend: {
    position: "bottom",
    labels: { colors: cssColor("muted-foreground") },
    markers: { strokeWidth: 0 },
  },
  tooltip: { theme: dark ? "dark" : "light" },
});

// Apex ignores tickAmount and hideOverlappingLabels on category axes, so the
// labels are thinned here: one every `step` buckets, at most `max` of them.
const sparseLabels = (series, bucket, max) => {
  const step = Math.max(1, Math.ceil(series.length / max));
  const index = new Map(series.map((p, i) => [p.date, i]));
  return (v) => (index.get(v) % step === 0 ? formatBucketLabel(v, bucket) : "");
};

// Options for the bucketed time series returned by /api/wallet/stats.
export const timeSeriesOptions = (dark, series, bucket) => {
  const base = baseOptions(dark);
  return {
    ...base,
    xaxis: {
      type: "category",
      categories: series.map((p) => p.date),
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        rotate: 0,
        style: { colors: cssColor("muted-foreground") },
        formatter: sparseLabels(series, bucket, 8),
      },
    },
    responsive: [
      {
        breakpoint: 640,
        options: { xaxis: { labels: { formatter: sparseLabels(series, bucket, 4) } } },
      },
    ],
    yaxis: {
      labels: {
        style: { colors: cssColor("muted-foreground") },
        formatter: (v) => formatCompact(Number(v)),
      },
    },
    tooltip: {
      ...base.tooltip,
      x: { formatter: (_, { dataPointIndex }) => formatBucketLabel(series[dataPointIndex]?.date, bucket) },
      y: { formatter: (v) => formatCurrency(Number(v)) },
    },
  };
};
