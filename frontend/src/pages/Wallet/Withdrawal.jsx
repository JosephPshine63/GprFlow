import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { AlertCircle, Banknote } from "lucide-react";
import { getWithdrawalHistory } from "@/Redux/Withdrawal/Action";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EmptyState from "@/components/custome/EmptyState";
import StatusBadge from "@/components/custome/StatusBadge";
import { formatCurrency, formatDateTime } from "@/Util/format";

const Withdrawal = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { history, loading, error } = useSelector((store) => store.withdrawal);

  useEffect(() => {
    dispatch(getWithdrawalHistory());
  }, [dispatch]);

  const rows = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold md:text-3xl">{t("withdrawals.title")}</h1>
        <Link to="/wallet" className="text-sm font-medium text-primary hover:underline">
          {t("withdrawals.request")}
        </Link>
      </div>

      {rows.length === 0 && loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon={error ? AlertCircle : Banknote}
            title={error ? t("withdrawals.loadFailed") : t("withdrawals.emptyTitle")}
            description={error ?? t("withdrawals.emptyBody")}
          />
        </div>
      ) : (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="py-4">{t("withdrawals.date")}</TableHead>
                <TableHead className="text-right">{t("withdrawals.amount")}</TableHead>
                <TableHead className="text-right">{t("withdrawals.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="py-4">{formatDateTime(item.date)}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {formatCurrency(Number(item.amount))}
                  </TableCell>
                  <TableCell className="text-right">
                    <StatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Withdrawal;
