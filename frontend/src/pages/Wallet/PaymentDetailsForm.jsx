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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import AuthError from "@/components/custome/AuthError";
import Chip from "@/components/custome/Chip";
import {
  BIC_LABEL,
  COUNTRIES,
  METHODS,
  buildPayload,
  formatFor,
  validateBank,
  validateCard,
} from "@/Util/payoutFormats";

const formSchema = z
  .object({
    method: z.enum(["BANK_TRANSFER", "CARD"]),
    country: z.string(),
    accountHolderName: z.string().trim().min(1, "Inserisci l'intestatario"),
    bankName: z.string(),
    accountNumber: z.string(),
    confirmAccountNumber: z.string(),
    bankCode: z.string(),
    swiftBic: z.string(),
    cardNumber: z.string(),
  })
  .superRefine((data, ctx) => {
    const issues = data.method === "CARD" ? validateCard(data) : validateBank(data);
    issues.forEach(({ path, message }) => ctx.addIssue({ code: "custom", path: [path], message }));
  });

const TextField = ({ form, name, label, placeholder, autoComplete = "off", description }) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-xs font-medium text-muted-foreground">{label}</FormLabel>
        <FormControl>
          <Input {...field} autoComplete={autoComplete} className="h-11" placeholder={placeholder} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

const PaymentDetailsForm = ({ onDone }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      method: "BANK_TRANSFER",
      country: "IT",
      accountHolderName: "",
      bankName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      bankCode: "",
      swiftBic: "",
      cardNumber: "",
    },
  });
  const submitting = form.formState.isSubmitting;
  const method = form.watch("method");
  const format = formatFor(form.watch("country"));

  const onSubmit = async (data) => {
    setError(null);
    try {
      await dispatch(addPaymentDetails({ paymentDetails: buildPayload(data) }));
      toast({ title: "Dati di pagamento salvati" });
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  const pickMethod = (value) => {
    form.clearErrors();
    form.setValue("method", value);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthError error={error} />

        <div role="group" aria-label="Metodo di payout" className="flex gap-2">
          {Object.entries(METHODS).map(([key, label]) => (
            <Chip key={key} active={method === key} onClick={() => pickMethod(key)}>
              {label}
            </Chip>
          ))}
        </div>

        <TextField
          form={form}
          name="accountHolderName"
          label={method === "CARD" ? "Intestatario della carta" : "Intestatario del conto"}
          placeholder="Mario Rossi"
          autoComplete="name"
        />

        {method === "CARD" ? (
          <TextField
            form={form}
            name="cardNumber"
            label="Numero di carta"
            placeholder="0000 0000 0000 0000"
            autoComplete="off"
            description="Salviamo solo il circuito e le ultime 4 cifre, mai il numero completo."
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    Paese del conto
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      form.clearErrors();
                      field.onChange(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COUNTRIES.map(({ code, label }) => (
                        <SelectItem key={code} value={code}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <TextField form={form} name="bankName" label="Nome della banca" placeholder="Nome della banca" />
            <TextField
              form={form}
              name="accountNumber"
              label={format.accountLabel}
              placeholder={format.accountPlaceholder}
            />
            <TextField
              form={form}
              name="confirmAccountNumber"
              label={`Conferma ${format.accountLabel === "IBAN" ? "IBAN" : "numero di conto"}`}
              placeholder="Ripeti il valore"
            />
            {format.code && (
              <TextField
                form={form}
                name="bankCode"
                label={format.code.label}
                placeholder={format.code.placeholder}
              />
            )}
            {format.bic && (
              <TextField
                form={form}
                name="swiftBic"
                label={format.bic === "optional" ? `${BIC_LABEL} (facoltativo)` : BIC_LABEL}
                placeholder="UNCRITMM"
              />
            )}
          </>
        )}

        <button type="submit" disabled={submitting} className="btn-brand h-12 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Salva
        </button>
      </form>
    </Form>
  );
};

export default PaymentDetailsForm;
