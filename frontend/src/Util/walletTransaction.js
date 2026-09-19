import i18n from "@/i18n";
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Landmark,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const META = {
  ADD_MONEY: { icon: ArrowDownToLine, direction: 1 },
  WITHDRAWAL: { icon: Landmark, direction: -1 },
  WALLET_TRANSFER: { icon: ArrowLeftRight },
  BUY_ASSET: { icon: TrendingUp, direction: -1 },
  SELL_ASSET: { icon: TrendingDown, direction: 1 },
};

// The ledger stores the withdrawal amount unsigned, so the sign comes from the
// transaction type; only transfers rely on the sign of the stored amount.
export const describeTransaction = (item) => {
  const known = META[item?.type];
  const meta = known ?? { icon: ArrowUpFromLine };
  const label = known
    ? i18n.t(`wallet.transactionTypes.${item.type}`)
    : item?.type ?? i18n.t("wallet.transactionTypes.other");
  const amount = Number(item?.amount) || 0;
  const direction = meta.direction ?? (amount >= 0 ? 1 : -1);
  return { label, icon: meta.icon, direction, value: Math.abs(amount) };
};
