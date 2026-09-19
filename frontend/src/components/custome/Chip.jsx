/* eslint-disable react/prop-types */
import { cn } from "@/lib/utils";

const Chip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={cn(
      "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
      active
        ? "bg-brand text-white"
        : "border text-muted-foreground hover:bg-primary/5 hover:text-foreground"
    )}
  >
    {children}
  </button>
);

export default Chip;
