import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { getAssetDetails } from "@/Redux/Assets/Action";
import { payOrder } from "@/Redux/Order/Action";
import { getUserWallet } from "@/Redux/Wallet/Action";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency, formatNumber } from "@/Util/format";
import { cn } from "@/lib/utils";

const PERCENTS = [25, 50, 75, 100];

const round8 = (v) => Number(v.toFixed(8));

const TradingForm = () => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const coinDetails = useSelector((store) => store.coin.coinDetails);
  const assetDetails = useSelector((store) => store.asset.assetDetails);
  const balance = useSelector((store) => store.wallet.userWallet?.balance) ?? 0;
  const [orderType, setOrderType] = useState("BUY");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const coinId = coinDetails?.id;
  const price = coinDetails?.market_data?.current_price?.usd;
  const symbol = coinDetails?.symbol?.toUpperCase();
  const owned = assetDetails?.quantity ?? 0;
  const isBuy = orderType === "BUY";

  useEffect(() => {
    if (coinId) dispatch(getAssetDetails({ coinId }));
  }, [dispatch, coinId]);

  const available = isBuy ? balance : owned * (price ?? 0);
  const value = Number(amount) || 0;
  const rawQuantity = price > 0 ? round8(value / price) : 0;
  // selling the whole position must not exceed the owned quantity by float error
  const quantity =
    !isBuy && rawQuantity > owned && rawQuantity - owned < 1e-6
      ? owned
      : rawQuantity;

  const validate = () => {
    if (!(value > 0)) return "Inserisci un importo";
    if (isBuy && value > balance) return "Saldo del wallet insufficiente";
    if (!isBuy && quantity > owned) return "Quantità disponibile insufficiente";
    if (!(quantity > 0)) return "Importo troppo piccolo";
    return null;
  };
  const error = validate();
  const showError = error && value > 0;

  const switchType = (type) => {
    setOrderType(type);
    setAmount("");
  };

  const applyPercent = (percent) => {
    const next = (available * percent) / 100;
    setAmount(next > 0 ? String(Math.floor(next * 100) / 100) : "");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (error || submitting) return;
    setSubmitting(true);
    const order = await dispatch(
      payOrder({
        amount: value,
        orderData: { coinId, quantity, orderType },
      })
    );
    setSubmitting(false);
    if (order) {
      toast({
        title: isBuy ? "Acquisto completato" : "Vendita completata",
        description: `${formatNumber(quantity)} ${symbol} a ${formatCurrency(price)}`,
      });
      setAmount("");
      dispatch(getUserWallet());
      dispatch(getAssetDetails({ coinId }));
    } else {
      toast({
        variant: "destructive",
        title: "Ordine non eseguito",
        description: "Riprova tra qualche istante.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div
        role="tablist"
        aria-label="Tipo di ordine"
        className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1"
      >
        {[
          { type: "BUY", label: "Acquista", active: "bg-up text-background" },
          { type: "SELL", label: "Vendi", active: "bg-down text-background" },
        ].map(({ type, label, active }) => (
          <button
            key={type}
            type="button"
            role="tab"
            aria-selected={orderType === type}
            onClick={() => switchType(type)}
            className={cn(
              "rounded-lg py-2 text-sm font-semibold transition-colors",
              orderType === type
                ? active
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="trade-amount"
          className="mb-1.5 block text-xs font-medium text-muted-foreground"
        >
          Importo in USD
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="trade-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            aria-invalid={showError ? "true" : undefined}
            aria-describedby="trade-error"
            className="h-12 pl-7 text-lg tabular-nums"
          />
        </div>
        <div className="mt-2 flex gap-1.5">
          {PERCENTS.map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => applyPercent(percent)}
              disabled={!(available > 0)}
              className="flex-1 rounded-full border py-1 text-xs font-semibold text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              {percent}%
            </button>
          ))}
        </div>
        <p id="trade-error" role="alert" className="mt-2 min-h-5 text-sm text-down">
          {showError ? error : ""}
        </p>
      </div>

      <dl className="space-y-2 rounded-xl border p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Prezzo</dt>
          <dd className="font-medium tabular-nums">{formatCurrency(price)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            {isBuy ? "Riceverai" : "Venderai"}
          </dt>
          <dd className="font-medium tabular-nums">
            {formatNumber(quantity)} {symbol}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Tipo di ordine</dt>
          <dd className="font-medium">Market</dd>
        </div>
        <div className="flex justify-between border-t pt-2">
          <dt className="text-muted-foreground">
            {isBuy ? "Saldo disponibile" : `${symbol} posseduti`}
          </dt>
          <dd className="font-medium tabular-nums">
            {isBuy ? formatCurrency(balance) : `${formatNumber(owned)} ${symbol}`}
          </dd>
        </div>
      </dl>

      <button
        type="submit"
        disabled={Boolean(error) || submitting}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-background transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40",
          isBuy ? "bg-up" : "bg-down"
        )}
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {isBuy ? "Acquista" : "Vendi"} {symbol}
      </button>
    </form>
  );
};

export default TradingForm;
