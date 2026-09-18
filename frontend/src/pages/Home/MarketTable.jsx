/* eslint-disable react/prop-types */
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import CoinLogo from "@/components/custome/CoinLogo";
import PriceChange from "@/components/custome/PriceChange";
import { formatCompact, formatCurrency } from "@/Util/format";
import { cn } from "@/lib/utils";

const MarketTable = ({ coins, favorites, onToggleFavorite, loading }) => {
  const navigate = useNavigate();

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-8 px-2 sm:w-10 sm:px-4" />
          <TableHead className="hidden w-10 text-center sm:table-cell">#</TableHead>
          <TableHead className="px-2 sm:px-4">Coin</TableHead>
          <TableHead className="px-2 text-right sm:px-4">Prezzo</TableHead>
          <TableHead className="px-2 text-right sm:px-4">24h</TableHead>
          <TableHead className="hidden text-right md:table-cell">Volume</TableHead>
          <TableHead className="hidden text-right lg:table-cell">
            Market cap
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading &&
          coins.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell colSpan={7}>
                <Skeleton className="h-9 w-full rounded-lg" />
              </TableCell>
            </TableRow>
          ))}
        {coins.map((item) => {
          const favorite = favorites.some((f) => f?.id === item.id);
          return (
            <TableRow
              key={item.id}
              className="cursor-pointer"
              onClick={() => navigate(`/market/${item.id}`)}
            >
              <TableCell className="px-2 pr-0 sm:px-4 sm:pr-0">
                <button
                  type="button"
                  aria-label={
                    favorite
                      ? `Rimuovi ${item.name} dalla watchlist`
                      : `Aggiungi ${item.name} alla watchlist`
                  }
                  aria-pressed={favorite}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(item.id);
                  }}
                  className="rounded-full p-1 text-muted-foreground hover:text-warning"
                >
                  <Star
                    className={cn("h-4 w-4", favorite && "fill-warning text-warning")}
                    strokeWidth={1.75}
                  />
                </button>
              </TableCell>
              <TableCell className="hidden text-center text-muted-foreground tabular-nums sm:table-cell">
                {item.market_cap_rank}
              </TableCell>
              <TableCell className="px-2 sm:px-4">
                <div className="flex items-center gap-3">
                  <CoinLogo src={item.image} symbol={item.symbol} />
                  <div className="leading-tight">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs uppercase text-muted-foreground">
                      {item.symbol}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="px-2 text-right font-medium tabular-nums sm:px-4">
                {formatCurrency(item.current_price)}
              </TableCell>
              <TableCell className="px-2 text-right sm:px-4">
                <PriceChange value={item.price_change_percentage_24h} />
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground md:table-cell">
                {formatCompact(item.total_volume)}
              </TableCell>
              <TableCell className="hidden text-right tabular-nums text-muted-foreground lg:table-cell">
                {formatCompact(item.market_cap)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default MarketTable;
