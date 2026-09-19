/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { useDispatch, useSelector } from "react-redux";
import { fetchMarketChart } from "@/Redux/Coin/Action";
import { Skeleton } from "@/components/ui/skeleton";
import { cssColor, useIsDark } from "@/lib/theme";
import { cn } from "@/lib/utils";

const ranges = [
  { label: "1G", value: 1 },
  { label: "1S", value: 7 },
  { label: "1M", value: 30 },
  { label: "3M", value: 90 },
  { label: "6M", value: 180 },
  { label: "1A", value: 365 },
];

const StockChart = ({ coinId, height = 380 }) => {
  const [range, setRange] = useState(ranges[0]);
  const marketChart = useSelector((store) => store.coin.marketChart);
  const dispatch = useDispatch();
  const dark = useIsDark();

  useEffect(() => {
    if (coinId) {
      dispatch(fetchMarketChart({ coinId, days: range.value }));
    }
  }, [dispatch, coinId, range.value]);

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
          formatter: (v) => `$${Number(v).toLocaleString("en-US")}`,
        },
      },
      markers: { size: 0 },
      tooltip: { theme: dark ? "dark" : "light", x: { format: "dd MMM HH:mm" } },
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
      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label="Intervallo">
        {ranges.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => setRange(item)}
            aria-pressed={range.value === item.value}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
              range.value === item.value
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
      {marketChart.loading ? (
        <Skeleton className="w-full rounded-xl" style={{ height }} />
      ) : (
        <ReactApexChart
          options={options}
          series={[{ name: "Prezzo", data }]}
          type="area"
          height={height}
        />
      )}
    </div>
  );
};

export default StockChart;
