// Unrealized profit against the stored buy price; null when either price is missing.
export const assetPnl = (asset) => {
  const price = asset?.coin?.current_price;
  if (typeof price !== "number" || !asset?.buyPrice) return null;
  return {
    value: asset.quantity * (price - asset.buyPrice),
    pct: (price / asset.buyPrice - 1) * 100,
  };
};

// There is no aggregated portfolio endpoint, so totals are derived from the assets list.
export const portfolioSummary = (assets = [], balance = 0) => {
  let invested = 0;
  let change24h = 0;
  let pnl = 0;

  for (const asset of assets) {
    const price = asset?.coin?.current_price;
    if (typeof price !== "number") continue;
    invested += asset.quantity * price;
    change24h += asset.quantity * (asset.coin.price_change_24h ?? 0);
    pnl += assetPnl(asset)?.value ?? 0;
  }

  const previous = invested - change24h;
  return {
    total: invested + (Number(balance) || 0),
    invested,
    pnl,
    change24h,
    changePct: previous > 0 ? (change24h / previous) * 100 : 0,
  };
};
