import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";

const PaymentCancel = () => (
  <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-down/10 text-down">
      <XCircle className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
    </span>
    <h1 className="mt-5 text-2xl font-semibold">Pagamento annullato</h1>
    <p className="mt-2 text-muted-foreground">
      Non è stato addebitato nulla. Puoi riprovare quando vuoi.
    </p>
    <Link to="/wallet" className="btn-brand mt-8 h-11 px-6">
      Torna al wallet
    </Link>
  </div>
);

export default PaymentCancel;
