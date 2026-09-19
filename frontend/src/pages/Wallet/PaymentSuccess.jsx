import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/Util/format";

const PaymentSuccess = () => {
  const { t } = useTranslation();
  const balance = useSelector((store) => store.wallet.userWallet?.balance);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-up/10 text-up">
        <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold">{t("payment.success.title")}</h1>
      <p className="mt-2 text-muted-foreground">
        {t("payment.success.body")}
      </p>
      {balance !== undefined && (
        <p className="mt-6 text-sm text-muted-foreground">
          {t("payment.success.balance")}
          <span className="mt-1 block text-3xl font-semibold tabular-nums text-foreground">
            {formatCurrency(Number(balance))}
          </span>
        </p>
      )}
      <Link to="/wallet" className="btn-brand mt-8 h-11 px-6">
        {t("payment.success.toWallet")}
      </Link>
    </div>
  );
};

export default PaymentSuccess;
