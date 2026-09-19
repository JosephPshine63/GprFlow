import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Copy,
  RefreshCw,
  ReceiptText,
} from "lucide-react";
import {
  depositMoney,
  getUserWallet,
  getWalletTransactions,
} from "@/Redux/Wallet/Action";
import { getPaymentDetails } from "@/Redux/Withdrawal/Action";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import AppDialog from "@/components/custome/AppDialog";
import EmptyState from "@/components/custome/EmptyState";
import { formatCurrency, formatDate } from "@/Util/format";
import { describeTransaction } from "@/Util/walletTransaction";
import { cn } from "@/lib/utils";
import TopupForm from "./TopupForm";
import TransferForm from "./TransferForm";
import WithdrawForm from "./WithdrawForm";

const ACTIONS = [
  { key: "topup", icon: ArrowDownToLine },
  { key: "withdraw", icon: ArrowUpFromLine },
  { key: "transfer", icon: ArrowLeftRight },
];

const FORMS = {
  topup: TopupForm,
  withdraw: WithdrawForm,
  transfer: TransferForm,
};

const Wallet = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { search } = useLocation();
  const { order_id: routeOrderId } = useParams();
  const wallet = useSelector((store) => store.wallet);
  const [dialog, setDialog] = useState(null);
  const depositStarted = useRef(false);

  const query = new URLSearchParams(search);
  const paymentId = query.get("session_id");
  const orderId = query.get("order_id") || routeOrderId;

  // Stripe sends the user back here with the checkout session in the URL.
  useEffect(() => {
    if (!orderId || !paymentId || depositStarted.current) return;
    depositStarted.current = true;
    dispatch(depositMoney({ orderId, paymentId, navigate })).catch((err) => {
      toast({
        variant: "destructive",
        title: t("wallet.depositFailed"),
        description: err.message,
      });
      navigate("/wallet", { replace: true });
    });
  }, [dispatch, navigate, toast, t, orderId, paymentId]);

  useEffect(() => {
    dispatch(getUserWallet());
    dispatch(getWalletTransactions());
    dispatch(getPaymentDetails());
  }, [dispatch]);

  const refresh = () => {
    dispatch(getUserWallet());
    dispatch(getWalletTransactions());
  };

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(String(wallet.userWallet?.id));
      toast({ title: t("wallet.idCopied") });
    } catch {
      toast({ variant: "destructive", title: t("wallet.copyFailed") });
    }
  };

  const walletLoaded = Boolean(wallet.userWallet?.id);
  const walletFailed = !walletLoaded && !wallet.loading && wallet.error;
  const transactions = wallet.transactions ?? [];
  const closeDialog = () => setDialog(null);
  const ActiveForm = dialog ? FORMS[dialog] : null;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-semibold md:text-3xl">{t("wallet.title")}</h1>

      {walletFailed ? (
        <div className="surface">
          <EmptyState
            icon={AlertCircle}
            title={t("wallet.loadFailed")}
            description={wallet.error}
          >
            <button type="button" onClick={refresh} className="btn-brand h-11">
              {t("wallet.retry")}
            </button>
          </EmptyState>
        </div>
      ) : (
        <section
          aria-label={t("wallet.balanceLabel")}
          className="rounded-2xl bg-brand p-6 text-white shadow-[0_20px_60px_rgba(47,49,149,0.35)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">{t("wallet.availableBalance")}</p>
              {walletLoaded ? (
                <p className="mt-1 text-4xl font-semibold tabular-nums md:text-5xl">
                  {formatCurrency(Number(wallet.userWallet.balance))}
                </p>
              ) : (
                <Skeleton className="mt-2 h-11 w-48 bg-white/20" />
              )}
            </div>
            <button
              type="button"
              onClick={refresh}
              aria-label={t("wallet.refresh")}
              className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <RefreshCw
                className={cn("h-5 w-5", wallet.loading && "animate-spin")}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {walletLoaded && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-white/70">
              <span>{t("wallet.id", { id: wallet.userWallet.id })}</span>
              <button
                type="button"
                onClick={copyId}
                aria-label={t("wallet.copyId")}
                className="rounded-full p-1 transition-colors hover:bg-white/15 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {ACTIONS.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setDialog(key)}
                disabled={!walletLoaded}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/15 py-3.5 text-sm font-semibold transition-colors hover:bg-white/25 disabled:pointer-events-none disabled:opacity-50"
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
                {t(`wallet.actions.${key}`)}
              </button>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="wallet-history">
        <h2 id="wallet-history" className="mb-3 text-lg font-semibold">
          {t("wallet.transactions")}
        </h2>

        {transactions.length === 0 && wallet.loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={ReceiptText}
              title={t("wallet.noTransactions")}
              description={t("wallet.noTransactionsBody")}
            />
          </div>
        ) : (
          <ul className="space-y-2">
            {[...transactions]
              .sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
              .map((item, index) => {
              const { label, icon: Icon, direction, value } = describeTransaction(item);
              return (
                <li
                  key={item.id ?? index}
                  className="surface flex items-center gap-3 px-4 py-3"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary">
                    <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{label}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatDate(item.date)}
                      {item.purpose ? ` - ${item.purpose}` : ""}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "shrink-0 font-semibold tabular-nums",
                      direction > 0 ? "text-up" : "text-down"
                    )}
                  >
                    {direction > 0 ? "+" : "-"}
                    {formatCurrency(value)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {ActiveForm && (
        <AppDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          title={t(`wallet.dialogs.${dialog}.title`)}
          description={t(`wallet.dialogs.${dialog}.description`)}
        >
          <ActiveForm onDone={closeDialog} />
        </AppDialog>
      )}
    </div>
  );
};

export default Wallet;
