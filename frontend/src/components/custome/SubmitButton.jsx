/* eslint-disable react/prop-types */
import { Loader2 } from "lucide-react";

const SubmitButton = ({ loading, disabled, children }) => (
  <button type="submit" disabled={loading || disabled} className="btn-brand h-11 w-full">
    {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
    {children}
  </button>
);

export default SubmitButton;
