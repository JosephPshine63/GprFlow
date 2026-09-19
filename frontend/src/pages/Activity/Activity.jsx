import TradingHistory from "../Portfilio/TradingHistory";

const Activity = () => (
  <div className="mx-auto max-w-6xl space-y-6">
    <div>
      <h1 className="text-2xl font-semibold md:text-3xl">Attività</h1>
      <p className="text-sm text-muted-foreground">Tutti i tuoi acquisti e le tue vendite.</p>
    </div>
    <TradingHistory />
  </div>
);

export default Activity;
