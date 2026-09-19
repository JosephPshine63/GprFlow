// Realized profit of a SELL order; null when the order has no sell leg.
export const calculateProfite = (order) => {
  const item = order?.orderItem;
  if (order?.orderType !== "SELL" || !item?.buyPrice || !item?.sellPrice) return null;
  const value = (item.sellPrice - item.buyPrice) * item.quantity;
  return { value, pct: (item.sellPrice / item.buyPrice - 1) * 100 };
};
