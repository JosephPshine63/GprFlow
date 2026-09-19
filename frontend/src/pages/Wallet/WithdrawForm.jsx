/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CreditCard, Landmark, Loader2 } from "lucide-react";
import { getUserWallet, getWalletTransactions } from "@/Redux/Wallet/Action";
import { withdrawalRequest } from "@/Redux/Withdrawal/Action";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AuthError from "@/components/custome/AuthError";
import EmptyState from "@/components/custome/EmptyState";
import { describePayout } from "@/Util/payoutFormats";
import { parseWholeAmount } from "@/Util/amount";
import { formatCurrency } from "@/Util/format";

const WithdrawForm = ({ onDone }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const balance = useSelector((store) => Number(store.wallet.userWallet?.balance) || 0);
  const paymentDetails = useSelector((store) => store.withdrawal.paymentDetails);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!paymentDetails) {
    return (
      <EmptyState
        icon={Landmark}
        title="Serve un metodo di pagamento"
        description="Aggiungi un conto bancario o una carta per poter richiedere un prelievo."
        className="py-6"
      >
        <button
          type="button"
          onClick={() => {
            onDone();
            navigate("/payment-details");
          }}
          className="btn-brand h-11"
        >
          Aggiungi dati di pagamento
        </button>
      </EmptyState>
    );
  }

  const payout = describePayout(paymentDetails);
  const PayoutIcon = payout.method === "CARD" ? CreditCard : Landmark;

  const value = parseWholeAmount(amount);
  const problem =
    amount === ""
      ? null
      : !(value > 0)
        ? "Inserisci un importo intero maggiore di zero"
        : value > balance
          ? "Saldo del wallet insufficiente"
          : null;
  const ready = value > 0 && !problem;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(withdrawalRequest({ amount: value }));
      dispatch(getUserWallet());
      dispatch(getWalletTransactions());
      toast({
        title: "Richiesta di prelievo inviata",
        description: `${formatCurrency(value)} in attesa di approvazione`,
      });
      onDone();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthError error={error} />

      <div className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
        <span className="text-muted-foreground">Saldo disponibile</span>
        <span className="font-semibold tabular-nums">{formatCurrency(balance)}</span>
      </div>

      <div>
        <label
          htmlFor="withdraw-amount"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Importo da prelevare (USD)
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="withdraw-amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={problem ? "true" : undefined}
            aria-describedby="withdraw-hint"
            className="h-12 pl-7 pr-16 text-lg tabular-nums"
          />
          <button
            type="button"
            onClick={() => setAmount(String(Math.floor(balance)))}
            disabled={!(balance >= 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-40"
          >
            Max
          </button>
        </div>
        <p
          id="withdraw-hint"
          role="alert"
          className="mt-2 min-h-5 text-sm text-down"
        >
          {problem}
        </p>
      </div>

      <div>
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">Accredito su</p>
        <div className="flex items-center gap-3 rounded-xl border px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <PayoutIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{payout.title}</p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {payout.masked}
            </p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={!ready || submitting}
        className="btn-brand h-12 w-full"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Preleva {ready && formatCurrency(value)}
      </button>
    </form>
  );
};

export default WithdrawForm;
