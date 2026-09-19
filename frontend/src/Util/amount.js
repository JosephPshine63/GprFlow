// ledger-service takes withdrawal, transfer and top-up amounts as whole numbers.
export const parseWholeAmount = (raw) => {
  const text = String(raw ?? "").trim();
  return /^\d+$/.test(text) ? Number(text) : NaN;
};
