/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, BookmarkMinus } from "lucide-react";
import { addItemToWatchlist, getUserWatchlist } from "@/Redux/Watchlist/Action";
import { Skeleton } from "@/components/ui/skeleton";
import CoinLogo from "@/components/custome/CoinLogo";
import EmptyState from "@/components/custome/EmptyState";
import PriceChange from "@/components/custome/PriceChange";
import { formatCompact, formatCurrency } from "@/Util/format";

// The name link stretches over the card, so the remove button has to sit above it.
const WatchCard = ({ coin, onRemove }) => {
  const { t } = useTranslation();
  return (
  <div className="surface relative p-4 transition-colors hover:bg-primary/5">
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <CoinLogo src={coin.image} symbol={coin.symbol} className="h-10 w-10" />
        <div className="min-w-0">
          <Link
            to={`/market/${coin.id}`}
            className="block truncate font-medium after:absolute after:inset-0"
          >
            {coin.name}
          </Link>
          <span className="text-xs uppercase text-muted-foreground">{coin.symbol}</span>
        </div>
      </div>
      <button
        type="button"
        aria-label={t("watchlist.remove", { name: coin.name })}
        onClick={() => onRemove(coin.id)}
        className="relative z-10 rounded-full p-2 text-muted-foreground transition-colors hover:bg-down/10 hover:text-down"
      >
        <BookmarkMinus className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>

    <div className="mt-4 flex items-end justify-between gap-2">
      <p className="text-xl font-semibold tabular-nums">{formatCurrency(coin.current_price)}</p>
      <PriceChange value={coin.price_change_percentage_24h} />
    </div>

    <dl className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-xs">
      <div>
        <dt className="text-muted-foreground">{t("market.volume")}</dt>
        <dd className="mt-0.5 font-medium tabular-nums">{formatCompact(coin.total_volume)}</dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("market.marketCap")}</dt>
        <dd className="mt-0.5 font-medium tabular-nums">{formatCompact(coin.market_cap)}</dd>
      </div>
    </dl>
  </div>
  );
};

const Watchlist = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((store) => store.watchlist);

  useEffect(() => {
    dispatch(getUserWatchlist());
  }, [dispatch]);

  const coins = (items ?? []).filter((c) => c?.id);
  const hydrating = loading && coins.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{t("watchlist.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("watchlist.subtitle")}</p>
      </div>

      {hydrating ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : error && coins.length === 0 ? (
        <div className="surface">
          <EmptyState icon={Bookmark} title={t("watchlist.loadFailed")} description={error}>
            <button
              type="button"
              onClick={() => dispatch(getUserWatchlist())}
              className="btn-brand h-11"
            >
              {t("watchlist.retry")}
            </button>
          </EmptyState>
        </div>
      ) : coins.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={Bookmark}
            title={t("watchlist.emptyTitle")}
            description={t("watchlist.emptyBody")}
          >
            <button type="button" onClick={() => navigate("/")} className="btn-brand h-11">
              {t("watchlist.explore")}
            </button>
          </EmptyState>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coins.map((coin) => (
            <WatchCard
              key={coin.id}
              coin={coin}
              onRemove={(id) => dispatch(addItemToWatchlist(id))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
