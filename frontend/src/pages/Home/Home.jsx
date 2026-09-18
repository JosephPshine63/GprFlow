import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, AlertCircle, TrendingDown, TrendingUp } from "lucide-react";
import {
  fetchCoinDetails,
  fetchCoinList,
  getTop50CoinList,
} from "@/Redux/Coin/Action";
import { getUserAssets } from "@/Redux/Assets/Action";
import { getUserWallet } from "@/Redux/Wallet/Action";
import { addItemToWatchlist, getUserWatchlist } from "@/Redux/Watchlist/Action";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CoinLogo from "@/components/custome/CoinLogo";
import Chip from "@/components/custome/Chip";
import PriceChange from "@/components/custome/PriceChange";
import { formatCurrency, formatPercent } from "@/Util/format";
import { portfolioSummary } from "@/Util/portfolio";
import StockChart from "../StockDetails/StockChart";
import MarketTable from "./MarketTable";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("all");
  const [moversTab, setMoversTab] = useState("gainers");

  const coin = useSelector((store) => store.coin);
  const wallet = useSelector((store) => store.wallet);
  const asset = useSelector((store) => store.asset);
  const watchlist = useSelector((store) => store.watchlist);
  const user = useSelector((store) => store.auth.user);

  useEffect(() => {
    dispatch(getTop50CoinList());
    dispatch(fetchCoinDetails({ coinId: "bitcoin" }));
    dispatch(getUserWallet());
    dispatch(getUserAssets());
    dispatch(getUserWatchlist());
  }, [dispatch]);

  useEffect(() => {
    if (category === "all") dispatch(fetchCoinList(page));
  }, [dispatch, category, page]);

  const coins = category === "all" ? coin.coinList : coin.top50;

  const summary = useMemo(
    () => portfolioSummary(asset.userAssets, wallet.userWallet?.balance),
    [asset.userAssets, wallet.userWallet?.balance]
  );

  const movers = useMemo(() => {
    const pool = (coin.top50.length ? coin.top50 : coin.coinList).filter(
      (c) => typeof c.price_change_percentage_24h === "number"
    );
    const sorted = [...pool].sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    );
    return moversTab === "gainers"
      ? sorted.slice(0, 5)
      : sorted.slice(-5).reverse();
  }, [coin.top50, coin.coinList, moversTab]);

  const hydrating = !wallet.userWallet?.id;
  const firstName = (user?.fullName || "").split(" ")[0];
  const btc = coin.coinDetails?.market_data;
  const up = summary.change24h >= 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          {firstName ? `Ciao, ${firstName}` : "Dashboard"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Panoramica del tuo portafoglio e dei mercati.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="relative overflow-hidden rounded-2xl bg-brand p-6 text-white">
            <p className="text-sm font-medium text-white/80">Saldo totale</p>
            {hydrating ? (
              <Skeleton className="mt-2 h-10 w-56 bg-white/20" />
            ) : (
              <p className="mt-1 text-4xl font-bold tabular-nums md:text-5xl">
                {formatCurrency(summary.total)}
              </p>
            )}
            {!hydrating && (
              <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-medium tabular-nums">
                {up ? (
                  <TrendingUp className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <TrendingDown className="h-4 w-4" strokeWidth={1.75} />
                )}
                {formatCurrency(summary.change24h)} ({formatPercent(summary.changePct)})
                <span className="text-white/70">ultime 24h</span>
              </p>
            )}

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-white/70">Disponibile</p>
                <p className="font-semibold tabular-nums">
                  {hydrating ? "-" : formatCurrency(Number(wallet.userWallet.balance))}
                </p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-xs text-white/70">Investito</p>
                <p className="font-semibold tabular-nums">
                  {hydrating ? "-" : formatCurrency(summary.invested)}
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                onClick={() => navigate("/wallet")}
                className="rounded-xl bg-white text-[#2F3195] hover:bg-white/90"
              >
                Deposita
              </Button>
              <Button
                onClick={() => navigate("/portfolio")}
                variant="ghost"
                className="rounded-xl text-white hover:bg-white/15 hover:text-white"
              >
                Vedi portfolio
              </Button>
            </div>
          </section>

          <section className="surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CoinLogo
                  src={coin.coinDetails?.image?.large}
                  symbol="btc"
                  className="h-10 w-10"
                />
                <div className="leading-tight">
                  <p className="font-semibold">Bitcoin</p>
                  <p className="text-xs text-muted-foreground">BTC</p>
                </div>
              </div>
              <div className="text-right leading-tight">
                <p className="text-lg font-semibold tabular-nums">
                  {formatCurrency(btc?.current_price?.usd)}
                </p>
                <PriceChange value={btc?.price_change_percentage_24h} />
              </div>
            </div>
            <StockChart coinId="bitcoin" height={300} />
          </section>
        </div>

        <section className="surface h-fit p-5">
          <h2 className="text-lg font-bold">Movers 24h</h2>
          <div className="mt-3 flex gap-2">
            <Chip active={moversTab === "gainers"} onClick={() => setMoversTab("gainers")}>
              In rialzo
            </Chip>
            <Chip active={moversTab === "losers"} onClick={() => setMoversTab("losers")}>
              In ribasso
            </Chip>
          </div>
          <ul className="mt-4 divide-y">
            {movers.length === 0 &&
              Array.from({ length: 5 }).map((_, i) => (
                <li key={i} className="py-3">
                  <Skeleton className="h-9 w-full rounded-lg" />
                </li>
              ))}
            {movers.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/market/${item.id}`)}
                  className="flex w-full items-center justify-between gap-3 py-3 text-left"
                >
                  <span className="flex items-center gap-3">
                    <CoinLogo src={item.image} symbol={item.symbol} />
                    <span className="leading-tight">
                      <span className="block text-sm font-medium">{item.name}</span>
                      <span className="block text-xs tabular-nums text-muted-foreground">
                        {formatCurrency(item.current_price)}
                      </span>
                    </span>
                  </span>
                  <PriceChange value={item.price_change_percentage_24h} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-5 pb-3">
          <h2 className="text-lg font-bold">Mercati</h2>
          <div className="flex gap-2">
            <Chip active={category === "all"} onClick={() => setCategory("all")}>
              Tutti
            </Chip>
            <Chip active={category === "top50"} onClick={() => setCategory("top50")}>
              Top 50
            </Chip>
          </div>
        </div>

        {!coin.loading && coins.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-16 text-center">
            <AlertCircle className="h-10 w-10 animate-soft-pulse text-primary" strokeWidth={1.5} />
            <p className="font-semibold">Dati di mercato non disponibili</p>
            <p className="text-sm text-muted-foreground">
              Riprova tra qualche istante.
            </p>
          </div>
        ) : (
          <MarketTable
            coins={coins}
            loading={coin.loading}
            favorites={watchlist.items}
            onToggleFavorite={(id) => dispatch(addItemToWatchlist(id))}
          />
        )}

        {category === "all" && (
          <div className="flex items-center justify-between border-t px-5 py-3">
            <Button
              variant="ghost"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="mr-1 h-4 w-4" strokeWidth={1.75} />
              Precedente
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              Pagina {page}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setPage((p) => p + 1)}>
              Successiva
              <ChevronRight className="ml-1 h-4 w-4" strokeWidth={1.75} />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
