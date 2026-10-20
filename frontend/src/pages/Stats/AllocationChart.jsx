/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { cssColor, useIsDark } from "@/lib/theme";
import { formatCurrency } from "@/Util/format";
import { CATEGORY_COLORS, baseOptions } from "./chartOptions";

const MAX_SLICES = 5;

const AllocationChart = ({ assets }) => {
  const { t, i18n } = useTranslation();
  const dark = useIsDark();

  // Largest holdings get their own slice, the long tail is merged into "Other".
  const slices = useMemo(() => {
    const rows = assets
      .map((a) => ({ label: a.coin.symbol.toUpperCase(), value: a.quantity * a.coin.current_price }))
      .filter((r) => r.value > 0)
      .sort((a, b) => b.value - a.value);
    if (rows.length <= MAX_SLICES + 1) return rows;
    const rest = rows.slice(MAX_SLICES).reduce((sum, r) => sum + r.value, 0);
    return [...rows.slice(0, MAX_SLICES), { label: t("stats.other"), value: rest }];
  }, [assets, t]);

  const options = useMemo(() => {
    const base = baseOptions(dark);
    return {
      ...base,
      labels: slices.map((s) => s.label),
      colors: CATEGORY_COLORS.slice(0, slices.length).map(cssColor),
      stroke: { width: 2, colors: [cssColor("card")] },
      tooltip: { ...base.tooltip, y: { formatter: (v) => formatCurrency(v) } },
      plotOptions: {
        pie: {
          donut: {
            size: "68%",
            labels: {
              show: true,
              value: { color: cssColor("foreground"), formatter: (v) => formatCurrency(Number(v)) },
              name: { color: cssColor("muted-foreground") },
              total: {
                show: true,
                label: t("stats.total"),
                color: cssColor("muted-foreground"),
                formatter: (w) =>
                  formatCurrency(w.globals.seriesTotals.reduce((sum, v) => sum + v, 0)),
              },
            },
          },
        },
      },
    };
  }, [slices, dark, t]);

  return (
    <ReactApexChart
      key={i18n.language}
      options={options}
      series={slices.map((s) => s.value)}
      type="donut"
      height={300}
    />
  );
};

export default AllocationChart;
