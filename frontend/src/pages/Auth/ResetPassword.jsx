import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { verifyResetPassowrdOTP } from "@/Redux/Auth/Action";
import { resetPasswordSchema } from "@/Util/passwordSchema";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthError from "@/components/custome/AuthError";
import SubmitButton from "@/components/custome/SubmitButton";
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

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { session } = useParams();
  const [error, setError] = useState(null);
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { confirmPassword: "", password: "", otp: "" },
  });

  const onSubmit = async (data) => {
    setError(null);
    try {
      await dispatch(
        verifyResetPassowrdOTP({
          otp: data.otp,
          password: data.password,
          session,
          navigate,
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthLayout
      title="Reimposta la password"
      subtitle="Inserisci il codice ricevuto via email e scegli una nuova password."
      footer={
        <Link to="/signin" className="font-semibold text-primary hover:underline">
          Torna al login
        </Link>
      }
    >
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
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ResetPasswordForm;
