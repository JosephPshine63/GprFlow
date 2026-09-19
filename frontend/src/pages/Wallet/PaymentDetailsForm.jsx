/* eslint-disable react/prop-types */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { addPaymentDetails } from "@/Redux/Withdrawal/Action";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import AuthError from "@/components/custome/AuthError";

const formSchema = z
  .object({
    accountHolderName: z.string().trim().min(1, "Inserisci l'intestatario del conto"),
    ifsc: z
      .string()
      .trim()
      .refine((v) => v === "" || v.length === 11, "Il codice IFSC ha 11 caratteri"),
    accountNumber: z.string().trim().min(1, "Inserisci il numero di conto"),
    confirmAccountNumber: z.string(),
    bankName: z.string().trim().min(1, "Inserisci il nome della banca"),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    path: ["confirmAccountNumber"],
    message: "I numeri di conto non coincidono",
  });

const FIELDS = [
  { name: "accountHolderName", label: "Intestatario del conto", placeholder: "Mario Rossi", autoComplete: "name" },
  { name: "bankName", label: "Nome della banca", placeholder: "YES Bank" },
  { name: "ifsc", label: "Codice IFSC (facoltativo)", placeholder: "Solo per conti indiani" },
  { name: "accountNumber", label: "Numero di conto", placeholder: "000000005602", autoComplete: "off" },
  { name: "confirmAccountNumber", label: "Conferma numero di conto", placeholder: "Ripeti il numero di conto", autoComplete: "off" },
];

const PaymentDetailsForm = ({ onDone }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountHolderName: "",
      bankName: "",
      ifsc: "",
      accountNumber: "",
      confirmAccountNumber: "",
    },
  });
  const submitting = form.formState.isSubmitting;

  const onSubmit = async (data) => {
    const paymentDetails = { ...data };
    delete paymentDetails.confirmAccountNumber;
    setError(null);
    try {
      await dispatch(addPaymentDetails({ paymentDetails }));
      toast({ title: "Dati di pagamento salvati" });
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthError error={error} />
        {FIELDS.map(({ name, label, placeholder, autoComplete }) => (
          <FormField
            key={name}
            control={form.control}
            name={name}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  {label}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete={autoComplete}
                    className="h-11"
                    placeholder={placeholder}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <button type="submit" disabled={submitting} className="btn-brand h-12 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Salva
        </button>
      </form>
    </Form>
  );
};

export default PaymentDetailsForm;
