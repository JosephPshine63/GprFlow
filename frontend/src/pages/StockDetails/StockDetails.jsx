/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeftRight, SearchX, Star } from "lucide-react";
import { fetchCoinDetails } from "@/Redux/Coin/Action";
import { addItemToWatchlist, getUserWatchlist } from "@/Redux/Watchlist/Action";
import { getUserWallet } from "@/Redux/Wallet/Action";
import { existInWatchlist } from "@/Util/existInWatchlist";
import { formatCompact, formatCurrency, formatNumber } from "@/Util/format";
import CoinLogo from "@/components/custome/CoinLogo";
import PriceChange from "@/components/custome/PriceChange";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import StockChart from "./StockChart";
import TradingForm from "./TradingForm";

const Stat = ({ label, value }) => (
  <div className="surface p-4">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 truncate text-base font-semibold tabular-nums">{value}</dd>
  </div>
);

const StatsGrid = ({ market }) => {
  const stats = [
    ["Capitalizzazione", formatCompact(market.market_cap?.usd)],
    ["Volume 24h", formatCompact(market.total_volume?.usd)],
    ["Massimo 24h", formatCurrency(market.high_24h?.usd)],
    ["Minimo 24h", formatCurrency(market.low_24h?.usd)],
    ["Massimo storico", formatCurrency(market.ath?.usd)],
    ["Variazione 7g", <PriceChange key="7d" value={market.price_change_percentage_7d} />],
    ["Variazione 30g", <PriceChange key="30d" value={market.price_change_percentage_30d} />],
    ["Offerta circolante", formatNumber(market.circulating_supply)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map(([label, value]) => (
        <Stat key={label} label={label} value={value} />
      ))}
    </dl>
  );
};

const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-7 w-56" />
      </div>
    </div>
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Skeleton className="h-[26rem] rounded-2xl" />
      <Skeleton className="hidden h-[26rem] rounded-2xl lg:block" />
    </div>
  </div>
);

const StockDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const details = useSelector((store) => store.coin.coinDetails);
  const watchlistItems = useSelector((store) => store.watchlist.items);
  const [settled, setSettled] = useState(false);
  const [tradeOpen, setTradeOpen] = useState(false);

  useEffect(() => {
    setSettled(false);
    dispatch(fetchCoinDetails({ coinId: id })).finally(() => setSettled(true));
  }, [dispatch, id]);

  useEffect(() => {
    dispatch(getUserWatchlist());
    dispatch(getUserWallet());
  }, [dispatch]);

  // coinDetails is shared state and may still hold the previously visited coin
  const current = details?.id === id ? details : null;

  if (!current) {
    if (!settled) return <PageSkeleton />;
    return (
      <div className="surface mx-auto mt-10 flex max-w-md flex-col items-center gap-3 p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-white">
          <SearchX className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <h1 className="text-xl font-bold">Moneta non disponibile</h1>
        <p className="text-sm text-muted-foreground">
          Non è stato possibile caricare i dati di questa moneta. Riprova tra
          qualche istante.
        </p>
        <button
          type="button"
          className="btn-brand mt-2"
          onClick={() => {
            setSettled(false);
            dispatch(fetchCoinDetails({ coinId: id })).finally(() =>
              setSettled(true)
            );
          }}
        >
          Riprova
        </button>
      </div>
    );
  }

  const market = current.market_data ?? {};
  const favorite = existInWatchlist(watchlistItems, current);

  return (
    <div className="space-y-6 animate-slide-in">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <CoinLogo
            src={current.image?.large}
            symbol={current.symbol}
            className="h-12 w-12"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{current.name}</h1>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold uppercase text-muted-foreground">
                {current.symbol}
              </span>
              {current.market_cap_rank && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  #{current.market_cap_rank}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3">
              <p className="text-3xl font-bold tabular-nums">
                {formatCurrency(market.current_price?.usd)}
              </p>
              <PriceChange value={market.price_change_percentage_24h} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch(addItemToWatchlist(current.id))}
            aria-pressed={favorite}
            aria-label={
              favorite
                ? `Rimuovi ${current.name} dalla watchlist`
                : `Aggiungi ${current.name} alla watchlist`
            }
            className="flex h-11 w-11 items-center justify-center rounded-xl border text-muted-foreground transition-colors hover:text-warning"
          >
            <Star
              className={cn("h-5 w-5", favorite && "fill-warning text-warning")}
              strokeWidth={1.75}
            />
          </button>
          <button
            type="button"
            onClick={() => setTradeOpen(true)}
            className="btn-brand h-11 px-5 lg:hidden"
          >
            <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
            Fai trading
          </button>
        </div>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
        <section className="surface p-4 md:p-5">
          <StockChart coinId={current.id} />
        </section>

        <aside className="surface hidden p-5 lg:block">
          <h2 className="mb-4 text-lg font-semibold">Ordine</h2>
          <TradingForm />
        </aside>
      </div>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="mb-3 text-lg font-semibold">
          Statistiche
        </h2>
        <StatsGrid market={market} />
      </section>

      <Sheet open={tradeOpen} onOpenChange={setTradeOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-2xl lg:hidden"
        >
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Ordine {current.symbol?.toUpperCase()}</SheetTitle>
            <SheetDescription>
              Acquista o vendi a prezzo di mercato.
            </SheetDescription>
          </SheetHeader>
          {tradeOpen && <TradingForm />}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StockDetails;
