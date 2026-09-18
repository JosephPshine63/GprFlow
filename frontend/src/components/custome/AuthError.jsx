/* eslint-disable react/prop-types */
import { AlertCircle } from "lucide-react";

// Backend errors arrive as { error: "..." }, a plain string, or an Error.
const messageOf = (error) => {
  if (!error) return null;
  if (typeof error === "string") return error;
  return error.error || error.message || "Si è verificato un errore.";
};

const AuthError = ({ error }) => {
  const message = messageOf(error);
  if (!message) return null;
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2 rounded-xl border border-down/30 bg-down/10 px-3 py-2.5 text-sm text-down"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span>{message}</span>
    </div>
  );
};

export default AuthError;
