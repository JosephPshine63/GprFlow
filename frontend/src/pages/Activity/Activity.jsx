import { useTranslation } from "react-i18next";
import TradingHistory from "../Portfilio/TradingHistory";

const Activity = () => {
  const { t } = useTranslation();
  return (
  <div className="mx-auto max-w-6xl space-y-6">
    <div>
      <h1 className="text-2xl font-semibold md:text-3xl">{t("activity.title")}</h1>
      <p className="text-sm text-muted-foreground">{t("activity.subtitle")}</p>
    </div>
    <TradingHistory />
  </div>
  );
};

export default Activity;
