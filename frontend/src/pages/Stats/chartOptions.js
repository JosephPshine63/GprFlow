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

// Options for the bucketed time series returned by /api/wallet/stats.
export const timeSeriesOptions = (dark, series, bucket) => {
  const base = baseOptions(dark);
  return {
    ...base,
    xaxis: {
      type: "category",
      categories: series.map((p) => p.date),
      tickAmount: Math.min(series.length, 6),
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: {
        rotate: 0,
        hideOverlappingLabels: true,
        style: { colors: cssColor("muted-foreground") },
        formatter: (v) => formatBucketLabel(v, bucket),
      },
    },
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
