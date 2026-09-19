// Backends answer errors as a plain string, { message } or { error }.
export const apiErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  if (typeof data === "string" && data) return data;
  return data?.message || data?.error || fallback || error?.message;
};
