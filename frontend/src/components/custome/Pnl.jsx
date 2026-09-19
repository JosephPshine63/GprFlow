/* eslint-disable react/prop-types */
import { formatPercent, formatSignedCurrency } from "@/Util/format";
import { cn } from "@/lib/utils";

// pnl is { value, pct } or null when there is nothing to compare against.
const Pnl = ({ pnl, showPct = true, className }) => {
  if (!pnl) return <span className="text-muted-foreground">-</span>;
  const tone =
    pnl.value > 0 ? "text-up" : pnl.value < 0 ? "text-down" : "text-muted-foreground";
  return (
    <span className={cn("tabular-nums", tone, className)}>
      {formatSignedCurrency(pnl.value)}
      {showPct && (
        <span className="ml-1 text-xs opacity-80">({formatPercent(pnl.pct)})</span>
      )}
    </span>
  );
};

export default Pnl;
