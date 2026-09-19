import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Landmark,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const META = {
  ADD_MONEY: { label: "Deposito", icon: ArrowDownToLine, direction: 1 },
  WITHDRAWAL: { label: "Prelievo", icon: Landmark, direction: -1 },
  WALLET_TRANSFER: { label: "Trasferimento", icon: ArrowLeftRight },
  BUY_ASSET: { label: "Acquisto", icon: TrendingUp, direction: -1 },
  SELL_ASSET: { label: "Vendita", icon: TrendingDown, direction: 1 },
};

// The ledger stores the withdrawal amount unsigned, so the sign comes from the
// transaction type; only transfers rely on the sign of the stored amount.
export const describeTransaction = (item) => {
  const meta = META[item?.type] ?? {
    label: item?.type ?? "Movimento",
    icon: ArrowUpFromLine,
  };
  const amount = Number(item?.amount) || 0;
  const direction = meta.direction ?? (amount >= 0 ? 1 : -1);
  return { label: meta.label, icon: meta.icon, direction, value: Math.abs(amount) };
};
