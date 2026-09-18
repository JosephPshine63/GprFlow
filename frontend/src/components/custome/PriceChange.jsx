/* eslint-disable react/prop-types */
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatPercent } from "@/Util/format";
import { cn } from "@/lib/utils";

const PriceChange = ({ value, className }) => {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return <span className="text-muted-foreground">-</span>;
  }
  const up = value >= 0;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
        up ? "bg-up/10 text-up" : "bg-down/10 text-down",
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
      {formatPercent(value)}
    </span>
  );
};

export default PriceChange;
