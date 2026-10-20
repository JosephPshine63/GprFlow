/* eslint-disable react/prop-types */
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import ReactApexChart from "react-apexcharts";
import { cssColor, useIsDark } from "@/lib/theme";
import { timeSeriesOptions } from "./chartOptions";

const WalletFlowChart = ({ series, bucket }) => {
  const { t, i18n } = useTranslation();
  const dark = useIsDark();

  const options = useMemo(() => {
    const base = timeSeriesOptions(dark, series, bucket);
    return {
      ...base,
      chart: { ...base.chart, type: "bar" },
      colors: [cssColor("chart-2"), cssColor("chart-3"), cssColor("chart-4")],
      plotOptions: { bar: { borderRadius: 3, columnWidth: "70%" } },
    };
  }, [dark, series, bucket]);

  return (
    <ReactApexChart
      key={i18n.language}
      options={options}
      series={[
        { name: t("stats.deposits"), data: series.map((p) => p.deposits) },
        { name: t("stats.withdrawals"), data: series.map((p) => p.withdrawals) },
        { name: t("stats.transfersOut"), data: series.map((p) => p.transfersOut) },
      ]}
      type="bar"
      height={280}
    />
  );
};

export default WalletFlowChart;
