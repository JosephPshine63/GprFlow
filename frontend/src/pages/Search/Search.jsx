/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Search as SearchIcon, SearchX } from "lucide-react";
import { searchCoin } from "@/Redux/Coin/Action";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import CoinLogo from "@/components/custome/CoinLogo";
import EmptyState from "@/components/custome/EmptyState";

const MAX_RESULTS = 30;

const SearchCoin = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { searchCoinList, loading, error } = useSelector((store) => store.coin);
  const [keyword, setKeyword] = useState("");
  const [submitted, setSubmitted] = useState("");

  const run = (term) => {
    setSubmitted(term);
    dispatch(searchCoin(term));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const term = keyword.trim();
    if (term) run(term);
  };

  const results = (searchCoinList ?? []).slice(0, MAX_RESULTS);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">{t("search.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("search.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2" role="search">
        <div className="relative flex-1">
          <SearchIcon
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.75}
            aria-hidden="true"
          />
          <Input
            autoFocus
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            aria-label={t("search.label")}
            placeholder={t("search.placeholder")}
            className="h-11 pl-10"
          />
        </div>
        <button type="submit" disabled={!keyword.trim()} className="btn-brand h-11 px-5">
          {t("search.submit")}
        </button>
      </form>

      <div className="surface overflow-hidden">
        {!submitted ? (
          <EmptyState
            icon={SearchIcon}
            title={t("search.emptyTitle")}
            description={t("search.emptyBody")}
          />
        ) : loading ? (
          <div className="space-y-3 p-5">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <EmptyState icon={SearchX} title={t("search.failed")} description={error}>
            <button type="button" onClick={() => run(submitted)} className="btn-brand h-11">
              {t("search.retry")}
            </button>
          </EmptyState>
        ) : results.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={t("search.noResults")}
            description={t("search.noResultsBody", { term: submitted })}
          />
        ) : (
          <ul className="divide-y">
            {results.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/market/${item.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-primary/5"
                >
                  <span className="w-8 text-xs tabular-nums text-muted-foreground">
                    {item.market_cap_rank ? `#${item.market_cap_rank}` : ""}
                  </span>
                  <CoinLogo src={item.large ?? item.thumb} symbol={item.symbol} />
                  <span className="min-w-0 flex-1 truncate font-medium">{item.name}</span>
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {item.symbol}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchCoin;
