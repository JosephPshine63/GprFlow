/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { paymentHandler } from "@/Redux/Wallet/Action";
import { Input } from "@/components/ui/input";
import AuthError from "@/components/custome/AuthError";
import Chip from "@/components/custome/Chip";
import { parseWholeAmount } from "@/Util/amount";
import { formatCurrency } from "@/Util/format";

const PRESETS = [50, 100, 250, 500];

const TopupForm = () => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const value = parseWholeAmount(amount);
  const invalid = amount !== "" && !(value > 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!(value > 0) || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // on success the browser is sent to the payment provider
      await dispatch(paymentHandler({ paymentMethod: "STRIPE", amount: value }));
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <AuthError error={error} />

      <div>
        <label
          htmlFor="topup-amount"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Importo in USD
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="topup-amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={invalid ? "true" : undefined}
            aria-describedby="topup-hint"
            className="h-12 pl-7 text-lg tabular-nums"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((preset) => (
            <Chip
              key={preset}
              active={value === preset}
              onClick={() => setAmount(String(preset))}
            >
              {formatCurrency(preset).replace(".00", "")}
            </Chip>
          ))}
        </div>
        <p
          id="topup-hint"
          role={invalid ? "alert" : undefined}
          className={invalid ? "mt-2 text-sm text-down" : "mt-2 text-sm text-muted-foreground"}
        >
          {invalid ? "Inserisci un importo intero maggiore di zero" : "Importi interi, in dollari."}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border px-4 py-3">
        <span className="text-sm text-muted-foreground">Metodo di pagamento</span>
        <img
          src="/brand/stripe.svg"
          alt="Stripe"
          className="h-6 dark:invert"
        />
      </div>

      <button
        type="submit"
        disabled={!(value > 0) || submitting}
        className="btn-brand h-12 w-full"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Procedi al pagamento
      </button>
    </form>
  );
};

export default TopupForm;
