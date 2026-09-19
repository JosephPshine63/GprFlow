/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const STATUS = {
  PENDING: "bg-warning/15 text-warning",
  SUCCESS: "bg-up/10 text-up",
  DECLINE: "bg-down/10 text-down",
};

const StatusBadge = ({ status, className }) => {
  const { t } = useTranslation();
  const tone = STATUS[status] ?? "bg-secondary text-muted-foreground";
  const label = STATUS[status] ? t(`status.${status}`) : status ?? "-";
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
