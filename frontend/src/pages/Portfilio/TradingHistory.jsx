/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { ReceiptText } from "lucide-react";
import { getAllOrdersForUser } from "@/Redux/Order/Action";
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
import EmptyState from "@/components/custome/EmptyState";
import Pnl from "@/components/custome/Pnl";
import { calculateProfite } from "@/Util/calculateProfite";
import { formatCurrency, formatDateTime, formatNumber } from "@/Util/format";
import { cn } from "@/lib/utils";

const TYPE_TONE = {
  BUY: "bg-up/10 text-up",
  SELL: "bg-down/10 text-down",
};

const TypeBadge = ({ type }) => {
  const { t } = useTranslation();
  const tone = TYPE_TONE[type] ?? "bg-secondary text-muted-foreground";
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tone)}>
      {TYPE_TONE[type] ? t(`history.types.${type}`) : type}
    </span>
  );
};

// Flattens an order into what the row and card layouts both need.
const toRow = (order) => {
  const item = order.orderItem ?? {};
  const coin = item.coin;
  return {
    id: order.id,
    type: order.orderType,
    date: order.timestamp,
    coinId: coin?.id ?? item.coinId,
    name: coin?.name ?? item.coinSymbol?.toUpperCase() ?? "-",
    symbol: coin?.symbol ?? item.coinSymbol,
    image: coin?.image,
    quantity: item.quantity,
    unitPrice: order.orderType === "SELL" ? item.sellPrice : item.buyPrice,
    total: Number(order.price),
    pnl: calculateProfite(order),
  };
};

const CoinCell = ({ row }) => (
  <div className="flex items-center gap-3">
    <CoinLogo src={row.image} symbol={row.symbol} />
    {row.coinId ? (
      <Link to={`/market/${row.coinId}`} className="font-medium hover:underline">
        {row.name}
      </Link>
    ) : (
      <span className="font-medium">{row.name}</span>
    )}
  </div>
);

const TradingHistory = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((store) => store.order);

  useEffect(() => {
    dispatch(getAllOrdersForUser());
  }, [dispatch]);

  const rows = useMemo(
    () =>
      [...(orders ?? [])]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(toRow),
    [orders]
  );

  if (loading && rows.length === 0) {
    return (
      <div className="surface space-y-3 p-5">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (error && rows.length === 0) {
    return (
      <div className="surface">
        <EmptyState
          icon={ReceiptText}
          title={t("history.loadFailed")}
          description={error}
        >
          <button
            type="button"
            onClick={() => dispatch(getAllOrdersForUser())}
            className="btn-brand h-11"
          >
            {t("history.retry")}
          </button>
        </EmptyState>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="surface">
        <EmptyState
          icon={ReceiptText}
          title={t("history.emptyTitle")}
          description={t("history.emptyBody")}
        />
      </div>
    );
  }

  return (
    <>
      <div className="surface hidden overflow-hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("history.date")}</TableHead>
              <TableHead>{t("history.asset")}</TableHead>
              <TableHead>{t("history.type")}</TableHead>
              <TableHead className="text-right">{t("history.quantity")}</TableHead>
              <TableHead className="text-right">{t("history.price")}</TableHead>
              <TableHead className="text-right">{t("history.total")}</TableHead>
              <TableHead className="text-right">{t("history.pnl")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap text-muted-foreground">
                  {formatDateTime(row.date)}
                </TableCell>
                <TableCell>
                  <CoinCell row={row} />
                </TableCell>
                <TableCell>
                  <TypeBadge type={row.type} />
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.quantity)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(row.unitPrice)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatCurrency(row.total)}
                </TableCell>
                <TableCell className="text-right">
                  <Pnl pnl={row.pnl} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="surface p-4">
            <div className="flex items-center justify-between gap-3">
              <CoinCell row={row} />
              <TypeBadge type={row.type} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(row.date)}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">{t("history.quantity")}</dt>
              <dd className="text-right tabular-nums">{formatNumber(row.quantity)}</dd>
              <dt className="text-muted-foreground">{t("history.price")}</dt>
              <dd className="text-right tabular-nums">{formatCurrency(row.unitPrice)}</dd>
              <dt className="text-muted-foreground">{t("history.total")}</dt>
              <dd className="text-right font-medium tabular-nums">
                {formatCurrency(row.total)}
              </dd>
              <dt className="text-muted-foreground">{t("history.pnl")}</dt>
              <dd className="text-right">
                <Pnl pnl={row.pnl} />
              </dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
};

export default TradingHistory;
