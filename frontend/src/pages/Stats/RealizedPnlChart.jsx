/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { cssColor, useIsDark } from "@/lib/theme";
import { formatSignedCurrency } from "@/Util/format";
import { timeSeriesOptions } from "./chartOptions";

const RealizedPnlChart = ({ series, bucket }) => {
  const { t, i18n } = useTranslation();
  const dark = useIsDark();

  // Running total for display only; the per-bucket values come rounded from the backend.
  const cumulative = useMemo(() => {
    let total = 0;
    return series.map((p) => {
      total += p.realizedPnl;
      return Math.round(total * 100) / 100;
    });
  }, [series]);

  const positive = (cumulative[cumulative.length - 1] ?? 0) >= 0;

  const options = useMemo(() => {
    const base = timeSeriesOptions(dark, series, bucket);
    return {
      ...base,
      chart: { ...base.chart, type: "area" },
      colors: [cssColor(positive ? "up" : "down")],
      stroke: { width: 2, curve: "smooth" },
      markers: { size: 0 },
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0, stops: [0, 100] },
      },
      tooltip: { ...base.tooltip, y: { formatter: (v) => formatSignedCurrency(Number(v)) } },
    };
  }, [dark, series, bucket, positive]);

  return (
    <ReactApexChart
      key={i18n.language}
      options={options}
      series={[{ name: t("stats.realizedPnl"), data: cumulative }]}
      type="area"
      height={280}
    />
  );
};

export default RealizedPnlChart;
