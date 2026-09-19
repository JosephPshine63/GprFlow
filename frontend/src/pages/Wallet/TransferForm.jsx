/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { getWalletTransactions, transferMoney } from "@/Redux/Wallet/Action";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AuthError from "@/components/custome/AuthError";
import { parseWholeAmount } from "@/Util/amount";
import { formatCurrency } from "@/Util/format";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

const TransferForm = ({ onDone }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const wallet = useSelector((store) => store.wallet.userWallet);
  const [form, setForm] = useState({ amount: "", walletId: "", purpose: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const balance = Number(wallet?.balance) || 0;
  const amount = parseWholeAmount(form.amount);
  const recipient = form.walletId.trim();

  const validate = () => {
    if (form.amount === "") return null;
    if (!(amount > 0)) return "Inserisci un importo intero maggiore di zero";
    if (amount > balance) return "Saldo del wallet insufficiente";
    if (recipient && !/^\d+$/.test(recipient)) return "L'ID wallet è numerico";
    if (recipient && recipient === String(wallet?.id)) {
      return "Non puoi trasferire al tuo stesso wallet";
    }
    return null;
  };
  const problem = validate();
  const ready = amount > 0 && /^\d+$/.test(recipient) && !problem;

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await dispatch(
        transferMoney({
          walletId: recipient,
          reqData: { amount, purpose: form.purpose.trim() },
        })
      );
      dispatch(getWalletTransactions());
      toast({
        title: "Trasferimento inviato",
        description: `${formatCurrency(amount)} al wallet ${recipient}`,
      });
      onDone();
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthError error={error} />

      <div>
        <label htmlFor="transfer-amount" className={labelClass}>
          Importo in USD
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="transfer-amount"
            name="amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="0"
            value={form.amount}
            onChange={update}
            aria-invalid={problem ? "true" : undefined}
            aria-describedby="transfer-hint"
            className="h-12 pl-7 text-lg tabular-nums"
          />
        </div>
        <p
          id="transfer-hint"
          role={problem ? "alert" : undefined}
          className={problem ? "mt-2 text-sm text-down" : "mt-2 text-sm text-muted-foreground"}
        >
          {problem ?? `Disponibile: ${formatCurrency(balance)}`}
        </p>
      </div>

      <div>
        <label htmlFor="transfer-wallet" className={labelClass}>
          ID wallet destinatario
        </label>
        <Input
          id="transfer-wallet"
          name="walletId"
          inputMode="numeric"
          placeholder="Es. 12"
          value={form.walletId}
          onChange={update}
          className="h-11"
        />
      </div>

      <div>
        <label htmlFor="transfer-purpose" className={labelClass}>
          Causale (facoltativa)
        </label>
        <Input
          id="transfer-purpose"
          name="purpose"
          placeholder="Es. regalo"
          maxLength={120}
          value={form.purpose}
          onChange={update}
          className="h-11"
        />
      </div>

      <button
        type="submit"
        disabled={!ready || submitting}
        className="btn-brand h-12 w-full"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Invia
      </button>
    </form>
  );
};

export default TransferForm;
