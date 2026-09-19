/* eslint-disable react/prop-types */
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { sendResetPassowrdOTP, verifyResetPassowrdOTP } from "@/Redux/Auth/Action";
import { resetPasswordSchema } from "@/Util/passwordSchema";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthError from "@/components/custome/AuthError";
import SubmitButton from "@/components/custome/SubmitButton";

// Two steps: email the code, then confirm it together with the new password.
const ChangePasswordForm = ({ onDone }) => {
  const dispatch = useDispatch();
  const email = useSelector((store) => store.auth.user?.email);
  const [session, setSession] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "", otp: "" },
  });

  const sendCode = async () => {
    setSending(true);
    setError(null);
    try {
      const data = await dispatch(
        sendResetPassowrdOTP({ sendTo: email, verificationType: "EMAIL" })
      );
      setSession(data.session);
      form.setValue("otp", "");
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    try {
      await dispatch(
        verifyResetPassowrdOTP({ otp: data.otp, password: data.password, session })
      );
      onDone();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <AuthError error={error} />
        <p className="text-sm text-muted-foreground">
          Invieremo un codice a 6 cifre a{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <button type="button" onClick={sendCode} disabled={sending} className="btn-brand h-12 w-full">
          {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Invia codice
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthError error={error} />
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Codice di verifica</FormLabel>
              <FormControl>
                <InputOTP {...field} maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  aria-label="Nuova password"
                  className="h-11"
                  placeholder="Nuova password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="new-password"
                  aria-label="Conferma password"
                  className="h-11"
                  placeholder="Conferma password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <SubmitButton loading={form.formState.isSubmitting}>Cambia password</SubmitButton>
        <button
          type="button"
          onClick={sendCode}
          disabled={sending || form.formState.isSubmitting}
          className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Invia di nuovo il codice
        </button>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
