/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { PieChart } from "lucide-react";
import { getUserAssets } from "@/Redux/Assets/Action";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Chip from "@/components/custome/Chip";
import CoinLogo from "@/components/custome/CoinLogo";
import EmptyState from "@/components/custome/EmptyState";
import PriceChange from "@/components/custome/PriceChange";
import Pnl from "@/components/custome/Pnl";
import { formatCurrency, formatNumber } from "@/Util/format";
import { assetPnl, portfolioSummary } from "@/Util/portfolio";
import TradingHistory from "./TradingHistory";

const Stat = ({ label, children }) => (
  <div className="surface p-4">
    <p className="text-xs font-medium text-muted-foreground">{label}</p>
    <div className="mt-1 text-xl font-semibold tabular-nums md:text-2xl">{children}</div>
  </div>
);

const AssetCell = ({ coin }) => (
  <div className="flex items-center gap-3">
    <CoinLogo src={coin.image} symbol={coin.symbol} />
    <div className="min-w-0">
      <Link
        to={`/market/${coin.id}`}
        onClick={(e) => e.stopPropagation()}
        className="block truncate font-medium hover:underline"
      >
        {coin.name}
      </Link>
      <span className="text-xs uppercase text-muted-foreground">{coin.symbol}</span>
    </div>
  </div>
);

const Portfolio = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [tab, setTab] = useState("assets");
  const { userAssets, loading, error } = useSelector((store) => store.asset);

  useEffect(() => {
    dispatch(getUserAssets());
  }, [dispatch]);

  // An asset whose coin lookup failed can't be priced, so it stays out of the table.
  const assets = useMemo(() => (userAssets ?? []).filter((a) => a?.coin), [userAssets]);
  const summary = useMemo(() => portfolioSummary(assets), [assets]);
  const hydrating = loading && assets.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{t("portfolio.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("portfolio.subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Stat label={t("portfolio.assetValue")}>
          {hydrating ? <Skeleton className="h-8 w-28" /> : formatCurrency(summary.invested)}
        </Stat>
        <Stat label={t("portfolio.pnl")}>
          {hydrating ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <Pnl
              pnl={
                assets.length
                  ? {
                      value: summary.pnl,
                      pct: summary.invested - summary.pnl > 0
                        ? (summary.pnl / (summary.invested - summary.pnl)) * 100
                        : 0,
                    }
                  : null
              }
              showPct={false}
            />
          )}
        </Stat>
        <div className="col-span-2 md:col-span-1">
          <Stat label={t("portfolio.assetsOwned")}>
            {hydrating ? <Skeleton className="h-8 w-12" /> : assets.length}
          </Stat>
        </div>
      </div>

      <div className="flex gap-2" role="group" aria-label={t("portfolio.section")}>
        <Chip active={tab === "assets"} onClick={() => setTab("assets")}>
          {t("portfolio.tabAssets")}
        </Chip>
        <Chip active={tab === "history"} onClick={() => setTab("history")}>
          {t("portfolio.tabHistory")}
        </Chip>
      </div>

      {tab === "history" ? (
        <TradingHistory />
      ) : hydrating ? (
        <div className="surface space-y-3 p-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : error && assets.length === 0 ? (
        <div className="surface">
          <EmptyState icon={PieChart} title={t("portfolio.loadFailed")} description={error}>
            <button
              type="button"
              onClick={() => dispatch(getUserAssets())}
              className="btn-brand h-11"
            >
              {t("portfolio.retry")}
            </button>
          </EmptyState>
        </div>
      ) : assets.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={PieChart}
            title={t("portfolio.emptyTitle")}
            description={t("portfolio.emptyBody")}
          >
            <button type="button" onClick={() => navigate("/")} className="btn-brand h-11">
              {t("portfolio.explore")}
            </button>
          </EmptyState>
        </div>
      ) : (
        <>
          <div className="surface hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("portfolio.asset")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.price")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.quantity")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.change24h")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.pnl")}</TableHead>
                  <TableHead className="text-right">{t("portfolio.value")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((item) => (
                  <TableRow
                    key={item.id}
                    onClick={() => navigate(`/market/${item.coin.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell>
                      <AssetCell coin={item.coin} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.coin.current_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(item.quantity)}
                    </TableCell>
                    <TableCell className="text-right">
                      <PriceChange value={item.coin.price_change_percentage_24h} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Pnl pnl={assetPnl(item)} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(item.coin.current_price * item.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {assets.map((item) => (
              <li
                key={item.id}
                onClick={() => navigate(`/market/${item.coin.id}`)}
                className="surface cursor-pointer p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <AssetCell coin={item.coin} />
                  <PriceChange value={item.coin.price_change_percentage_24h} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <dt className="text-muted-foreground">{t("portfolio.price")}</dt>
                  <dd className="text-right tabular-nums">
                    {formatCurrency(item.coin.current_price)}
                  </dd>
                  <dt className="text-muted-foreground">{t("portfolio.quantity")}</dt>
                  <dd className="text-right tabular-nums">{formatNumber(item.quantity)}</dd>
                  <dt className="text-muted-foreground">{t("portfolio.pnl")}</dt>
                  <dd className="text-right">
                    <Pnl pnl={assetPnl(item)} />
                  </dd>
                  <dt className="text-muted-foreground">{t("portfolio.value")}</dt>
                  <dd className="text-right font-medium tabular-nums">
                    {formatCurrency(item.coin.current_price * item.quantity)}
                  </dd>
                </dl>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Portfolio;
