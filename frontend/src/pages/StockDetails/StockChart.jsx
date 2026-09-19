/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarketChart } from "@/Redux/Coin/Action";
import { formatDateTime, formatGrouped } from "@/Util/format";
import { Skeleton } from "@/components/ui/skeleton";
import { cssColor, useIsDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ranges = [1, 7, 30, 90, 180, 365];

const StockChart = ({ coinId, height = 380 }) => {
  const { t, i18n } = useTranslation();
  const [range, setRange] = useState(ranges[0]);
  const marketChart = useSelector((store) => store.coin.marketChart);
  const dispatch = useDispatch();
  const dark = useIsDark();

  useEffect(() => {
    if (coinId) {
      dispatch(fetchMarketChart({ coinId, days: range }));
    }
  }, [dispatch, coinId, range]);

  const data = marketChart.data;
  const rising =
    data.length > 1 ? data[data.length - 1][1] >= data[0][1] : true;

  // dark is a dependency so the palette is re-read after a theme switch
  const options = useMemo(() => {
    const line = cssColor(rising ? "up" : "down");
    return {
      chart: {
        id: "area-datetime",
        type: "area",
        toolbar: { show: false },
        zoom: { enabled: false },
        background: "transparent",
        fontFamily: "Inter, system-ui, sans-serif",
      },
      dataLabels: { enabled: false },
      stroke: { width: 2, curve: "smooth" },
      colors: [line],
      xaxis: {
        type: "datetime",
        tickAmount: 6,
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { style: { colors: cssColor("muted-foreground") } },
      },
      yaxis: {
        labels: {
          style: { colors: cssColor("muted-foreground") },
          formatter: (v) => `$${formatGrouped(Number(v))}`,
        },
      },
      markers: { size: 0 },
      tooltip: { theme: dark ? "dark" : "light", x: { formatter: (ts) => formatDateTime(ts) } },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0,
          stops: [0, 100],
        },
      },
      grid: {
        borderColor: cssColor("border"),
        strokeDashArray: 4,
      },
    };
  }, [rising, dark]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label={t("chart.range")}>
        {ranges.map((days) => (
          <button
            key={days}
            type="button"
            onClick={() => setRange(days)}
            aria-pressed={range === days}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              range === days
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            )}
          >
            {t(`chart.ranges.${days}`)}
          </button>
        ))}
      </div>
      {marketChart.loading ? (
        <Skeleton className="w-full rounded-xl" style={{ height }} />
      ) : (
        <ReactApexChart
          key={i18n.language}
          options={options}
          series={[{ name: t("chart.price"), data }]}
          type="area"
          height={height}
        />
      )}
    </div>
  );
};

export default StockChart;
