/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BarChart3, PieChart } from "lucide-react";
import { getUserAssets } from "@/Redux/Assets/Action";
import { getStats } from "@/Redux/Stats/Action";
import { Skeleton } from "@/components/ui/skeleton";
import Chip from "@/components/custome/Chip";
import EmptyState from "@/components/custome/EmptyState";
import Pnl from "@/components/custome/Pnl";
import { formatCurrency, formatNumber } from "@/Util/format";
import { portfolioSummary } from "@/Util/portfolio";
import AllocationChart from "./AllocationChart";
import AssetPnlChart from "./AssetPnlChart";
import TradingVolumeChart from "./TradingVolumeChart";
import WalletFlowChart from "./WalletFlowChart";
import RealizedPnlChart from "./RealizedPnlChart";

const PERIODS = ["7d", "30d", "90d", "all"];

const Stat = ({ label, hint, loading, children }) => (
  <div className="surface min-w-0 p-4">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <div className="mt-1 truncate text-xl font-semibold tabular-nums md:text-2xl">
      {loading ? <Skeleton className="h-8 w-24" /> : children}
    </div>
    {hint && !loading && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const Panel = ({ title, subtitle, className, children }) => (
  <section className={`surface min-w-0 p-4 md:p-5 ${className ?? ""}`}>
    <h2 className="text-sm font-semibold">{title}</h2>
    {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    <div className="mt-3">{children}</div>
  </section>
);

const ChartSkeleton = () => <Skeleton className="h-[280px] w-full rounded-xl" />;

const Stats = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [period, setPeriod] = useState("30d");
  const { userAssets, loading: assetsLoading } = useSelector((store) => store.asset);
  const { data: stats, loading: statsLoading, error: statsError } = useSelector(
    (store) => store.stats
  );

  useEffect(() => {
    dispatch(getUserAssets());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getStats(period));
  }, [dispatch, period]);

  // Same rule as Portfolio: an asset whose coin lookup failed can't be priced.
  const assets = useMemo(() => (userAssets ?? []).filter((a) => a?.coin), [userAssets]);
  const summary = useMemo(() => portfolioSummary(assets), [assets]);
  const assetsHydrating = assetsLoading && assets.length === 0;
  // Data for another period is hidden while the selected one loads.
  const current = stats?.period === period ? stats : null;
  const statsHydrating = statsLoading && !current;
  const series = current?.series ?? [];
  const periodLabel = t(`stats.periods.${period}`);

  const hasTrades = series.some((p) => p.buyVolume || p.sellVolume);
  const hasFlows = series.some((p) => p.deposits || p.withdrawals || p.transfersOut);
  const hasRealized = series.some((p) => p.realizedPnl);

  const quietPeriod = (
    <EmptyState
      icon={BarChart3}
      title={t("stats.noActivityTitle")}
      description={t("stats.noActivityBody")}
      className="py-8"
    />
  );

  const noAssets = (
    <EmptyState
      icon={PieChart}
      title={t("portfolio.emptyTitle")}
      description={t("portfolio.emptyBody")}
      className="py-8"
    >
      <button type="button" onClick={() => navigate("/")} className="btn-brand h-11">
        {t("portfolio.explore")}
      </button>
    </EmptyState>
  );

  const timeChart = (has, chart) => {
    if (statsHydrating) return <ChartSkeleton />;
    if (!current) return null;
    return has ? chart : quietPeriod;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">{t("stats.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("stats.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("stats.period")}>
          {PERIODS.map((p) => (
            <Chip key={p} active={period === p} onClick={() => setPeriod(p)}>
              {t(`stats.periods.${p}`)}
            </Chip>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label={t("stats.portfolioValue")} loading={assetsHydrating}>
          {formatCurrency(summary.invested)}
        </Stat>
        <Stat label={t("stats.balance")} loading={statsHydrating}>
          {formatCurrency(current?.balance)}
        </Stat>
        <Stat label={t("stats.unrealizedPnl")} loading={assetsHydrating}>
          <Pnl
            pnl={
              assets.length
                ? {
                    value: summary.pnl,
                    pct:
                      summary.invested - summary.pnl > 0
                        ? (summary.pnl / (summary.invested - summary.pnl)) * 100
                        : 0,
                  }
                : null
            }
          />
        </Stat>
        <Stat label={t("stats.realizedPnl")} hint={periodLabel} loading={statsHydrating}>
          <Pnl pnl={current ? { value: current.realizedPnl } : null} showPct={false} />
        </Stat>
        <div className="col-span-2 lg:col-span-1">
          <Stat
            label={t("stats.trades")}
            hint={
              current
                ? t("stats.tradesSplit", { buys: current.buyCount, sells: current.sellCount })
                : periodLabel
            }
            loading={statsHydrating}
          >
            {formatNumber(current?.tradeCount)}
          </Stat>
        </div>
      </div>

      {statsError && !current && (
        <div className="surface">
          <EmptyState icon={BarChart3} title={t("stats.loadFailed")} description={statsError}>
            <button
              type="button"
              onClick={() => dispatch(getStats(period))}
              className="btn-brand h-11"
            >
              {t("portfolio.retry")}
            </button>
          </EmptyState>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title={t("stats.allocation")} subtitle={t("stats.allocationHint")}>
          {assetsHydrating ? <ChartSkeleton /> : assets.length ? <AllocationChart assets={assets} /> : noAssets}
        </Panel>
        <Panel title={t("stats.pnlByAsset")} subtitle={t("stats.pnlByAssetHint")}>
          {assetsHydrating ? <ChartSkeleton /> : assets.length ? <AssetPnlChart assets={assets} /> : noAssets}
        </Panel>
        <Panel title={t("stats.tradingVolume")} subtitle={periodLabel}>
          {timeChart(hasTrades, <TradingVolumeChart series={series} bucket={current?.bucket} />)}
        </Panel>
        <Panel title={t("stats.walletFlows")} subtitle={periodLabel}>
          {timeChart(hasFlows, <WalletFlowChart series={series} bucket={current?.bucket} />)}
        </Panel>
        <Panel
          title={t("stats.realizedPnlOverTime")}
          subtitle={t("stats.realizedPnlHint")}
          className="lg:col-span-2"
        >
          {timeChart(hasRealized, <RealizedPnlChart series={series} bucket={current?.bucket} />)}
        </Panel>
      </div>
    </div>
  );
};

export default Stats;
