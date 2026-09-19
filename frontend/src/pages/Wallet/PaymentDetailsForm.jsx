/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { i18nResolver } from "@/i18n/resolver";
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
  COUNTRIES,
  METHOD_KEYS,
  buildPayload,
  bicLabel,
  formatFor,
  methodLabel,
  validateBank,
  validateCard,
} from "@/Util/payoutFormats";

const formSchema = z
  .object({
    method: z.enum(["BANK_TRANSFER", "CARD"]),
    country: z.string(),
    accountHolderName: z.string().trim().min(1, "payout.errors.holderRequired"),
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
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [error, setError] = useState(null);
  const form = useForm({
    resolver: i18nResolver(formSchema),
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
      toast({ title: t("paymentDetails.saved") });
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

        <div role="group" aria-label={t("paymentDetails.payoutMethod")} className="flex gap-2">
          {METHOD_KEYS.map((key) => (
            <Chip key={key} active={method === key} onClick={() => pickMethod(key)}>
              {methodLabel(key)}
            </Chip>
          ))}
        </div>

        <TextField
          form={form}
          name="accountHolderName"
          label={method === "CARD" ? t("paymentDetails.cardHolder") : t("paymentDetails.accountHolder")}
          placeholder={t("paymentDetails.holderPlaceholder")}
          autoComplete="name"
        />

        {method === "CARD" ? (
          <TextField
            form={form}
            name="cardNumber"
            label={t("paymentDetails.cardNumber")}
            placeholder="0000 0000 0000 0000"
            autoComplete="off"
            description={t("paymentDetails.cardNote")}
          />
        ) : (
          <>
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">
                    {t("paymentDetails.country")}
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
            <TextField form={form} name="bankName" label={t("paymentDetails.bankName")} placeholder={t("paymentDetails.bankName")} />
            <TextField
              form={form}
              name="accountNumber"
              label={format.accountLabel}
              placeholder={format.accountPlaceholder}
            />
            <TextField
              form={form}
              name="confirmAccountNumber"
              label={t("paymentDetails.confirm", {
                label: format.isIban ? "IBAN" : t("payout.accountNumber").toLowerCase(),
              })}
              placeholder={t("paymentDetails.repeat")}
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
                label={format.bic === "optional" ? t("payout.bicOptional") : bicLabel()}
                placeholder="UNCRITMM"
              />
            )}
          </>
        )}

        <button type="submit" disabled={submitting} className="btn-brand h-12 w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          {t("paymentDetails.save")}
        </button>
      </form>
    </Form>
  );
};

export default PaymentDetailsForm;
