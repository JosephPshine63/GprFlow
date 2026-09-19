/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Check, Copy, Loader2 } from "lucide-react";
import { paymentHandler } from "@/Redux/Wallet/Action";
import { Input } from "@/components/ui/input";
import AuthError from "@/components/custome/AuthError";
import Chip from "@/components/custome/Chip";
import { parseWholeAmount } from "@/Util/amount";
import { formatCurrency } from "@/Util/format";

const PRESETS = [50, 100, 250, 500];
const TEST_CARD = "4242 4242 4242 4242";
const TEST_MODE =
  (window.__RUNTIME_CONFIG__?.STRIPE_TEST_MODE ?? import.meta.env.VITE_STRIPE_TEST_MODE) === "true";

const TestCardHint = () => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(TEST_CARD);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked (insecure context, permissions): the number stays selectable
    }
  };

  return (
    <div className="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
      <p className="font-medium text-warning">{t("topup.testMode")}</p>
      <p className="mt-1 text-muted-foreground">
        {t("topup.testModeBody")}
      </p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <code className="select-all font-mono text-base tabular-nums">{TEST_CARD}</code>
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors hover:bg-accent"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
          )}
          <span aria-live="polite">{copied ? t("topup.copied") : t("topup.copy")}</span>
        </button>
      </div>
    </div>
  );
};

const TopupForm = () => {
  const { t } = useTranslation();
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
          {t("topup.amountUsd")}
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
          {invalid ? t("topup.invalid") : t("topup.hint")}
        </p>
      </div>

      <div className="flex items-center justify-between rounded-xl border px-4 py-3">
        <span className="text-sm text-muted-foreground">{t("topup.method")}</span>
        <img
          src="/brand/stripe.svg"
          alt="Stripe"
          className="h-6 dark:invert"
        />
      </div>

      {TEST_MODE && <TestCardHint />}

      <button
        type="submit"
        disabled={!(value > 0) || submitting}
        className="btn-brand h-12 w-full"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {t("topup.submit")}
      </button>
    </form>
  );
};

export default TopupForm;
