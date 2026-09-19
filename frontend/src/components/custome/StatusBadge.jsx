/* eslint-disable react/prop-types */
import { cn } from "@/lib/utils";

const STATUS = {
  PENDING: { label: "In attesa", tone: "bg-warning/15 text-warning" },
  SUCCESS: { label: "Completato", tone: "bg-up/10 text-up" },
  DECLINE: { label: "Rifiutato", tone: "bg-down/10 text-down" },
};

const StatusBadge = ({ status, className }) => {
  const { label, tone } = STATUS[status] ?? {
    label: status ?? "-",
    tone: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tone,
        className
      )}
    >
      {label}
    </span>
  );
};

export default StatusBadge;
