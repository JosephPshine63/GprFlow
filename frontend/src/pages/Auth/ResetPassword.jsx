import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { i18nResolver } from "@/i18n/resolver";
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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { session } = useParams();
  const [error, setError] = useState(null);
  const form = useForm({
    resolver: i18nResolver(resetPasswordSchema),
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
      title={t("auth.reset.title")}
      subtitle={t("auth.reset.subtitle")}
      footer={
        <Link to="/signin" className="font-semibold text-primary hover:underline">
          {t("common.backToLogin")}
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
                <FormLabel>{t("auth.fields.verificationCode")}</FormLabel>
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
                    aria-label={t("auth.fields.newPassword")}
                    className="h-11"
                    placeholder={t("auth.fields.newPassword")}
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
                    aria-label={t("auth.fields.confirmPassword")}
                    className="h-11"
                    placeholder={t("auth.fields.confirmPassword")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton loading={form.formState.isSubmitting}>{t("auth.reset.submit")}</SubmitButton>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ResetPasswordForm;
