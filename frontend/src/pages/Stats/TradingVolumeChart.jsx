/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { cssColor, useIsDark } from "@/lib/theme";
import { timeSeriesOptions } from "./chartOptions";

const TradingVolumeChart = ({ series, bucket }) => {
  const { t, i18n } = useTranslation();
  const dark = useIsDark();

  const options = useMemo(() => {
    const base = timeSeriesOptions(dark, series, bucket);
    return {
      ...base,
      chart: { ...base.chart, type: "bar", stacked: true },
      colors: [cssColor("chart-1"), cssColor("chart-3")],
      plotOptions: { bar: { borderRadius: 3, columnWidth: "60%" } },
    };
  }, [dark, series, bucket]);

  return (
    <ReactApexChart
      key={i18n.language}
      options={options}
      series={[
        { name: t("stats.buys"), data: series.map((p) => p.buyVolume) },
        { name: t("stats.sells"), data: series.map((p) => p.sellVolume) },
      ]}
      type="bar"
      height={280}
    />
  );
};

export default TradingVolumeChart;
