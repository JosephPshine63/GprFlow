/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { cssColor, useIsDark } from "@/lib/theme";
import { formatCompact, formatSignedCurrency } from "@/Util/format";
import { assetPnl } from "@/Util/portfolio";
import { baseOptions } from "./chartOptions";

const AssetPnlChart = ({ assets }) => {
  const { t, i18n } = useTranslation();
  const dark = useIsDark();

  const rows = useMemo(
    () =>
      assets
        .map((a) => ({ label: a.coin.symbol.toUpperCase(), value: assetPnl(a)?.value }))
        .filter((r) => typeof r.value === "number")
        .sort((a, b) => b.value - a.value),
    [assets]
  );

  const options = useMemo(() => {
    const base = baseOptions(dark);
    const up = cssColor("up");
    const down = cssColor("down");
    return {
      ...base,
      chart: { ...base.chart, type: "bar" },
      colors: rows.map((r) => (r.value >= 0 ? up : down)),
      legend: { show: false },
      plotOptions: { bar: { horizontal: true, distributed: true, borderRadius: 4, barHeight: "60%" } },
      xaxis: {
        categories: rows.map((r) => r.label),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: cssColor("muted-foreground") },
          formatter: (v) => formatCompact(Number(v)),
        },
      },
      yaxis: { labels: { style: { colors: cssColor("muted-foreground") } } },
      tooltip: { ...base.tooltip, y: { formatter: (v) => formatSignedCurrency(v) } },
    };
  }, [rows, dark]);

  return (
    <ReactApexChart
      key={i18n.language}
      options={options}
      series={[{ name: t("stats.unrealizedPnl"), data: rows.map((r) => r.value) }]}
      type="bar"
      height={Math.max(160, 48 + rows.length * 36)}
    />
  );
};

export default AssetPnlChart;
