import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, Landmark } from "lucide-react";
import { getPaymentDetails } from "@/Redux/Withdrawal/Action";
import AppDialog from "@/components/custome/AppDialog";
import EmptyState from "@/components/custome/EmptyState";
import { describePayout } from "@/Util/payoutFormats";
import PaymentDetailsForm from "./PaymentDetailsForm";

const PaymentDetails = () => {
  const dispatch = useDispatch();
  const details = useSelector((store) => store.withdrawal.paymentDetails);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    dispatch(getPaymentDetails());
  }, [dispatch]);

  const payout = details ? describePayout(details) : null;
  const MethodIcon = payout?.method === "CARD" ? CreditCard : Landmark;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold md:text-3xl">Dati di pagamento</h1>

      {details ? (
        <section className="surface p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-white">
              <MethodIcon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{payout.title}</h2>
              <p className="text-sm text-muted-foreground">Metodo per i prelievi</p>
            </div>
          </div>
          <dl className="mt-5 divide-y text-sm">
            {payout.rows.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 py-3">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium tabular-nums">{value || "-"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : (
        <div className="surface">
          <EmptyState
            icon={Landmark}
            title="Nessun metodo collegato"
            description="Aggiungi un conto bancario o una carta per poter richiedere i prelievi."
          >
            <button type="button" onClick={() => setOpen(true)} className="btn-brand h-11">
              Aggiungi dati di pagamento
            </button>
          </EmptyState>
        </div>
      )}

      {open && (
        <AppDialog
          open
          onOpenChange={setOpen}
          title="Dati di pagamento"
          description="Dove vengono accreditati i prelievi."
        >
          <PaymentDetailsForm onDone={() => setOpen(false)} />
        </AppDialog>
      )}
    </div>
  );
};

export default PaymentDetails;
