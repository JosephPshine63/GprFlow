/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { i18nResolver } from "@/i18n/resolver";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { register } from "@/Redux/Auth/Action";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import AuthError from "@/components/custome/AuthError";
import SubmitButton from "@/components/custome/SubmitButton";
import TurnstileWidget from "@/components/custome/TurnstileWidget";

const formSchema = z.object({
  fullName: z.string().nonempty("validation.nameRequired"),
  email: z.string().email("validation.emailInvalid"),
  password: z.string().min(8, "validation.passwordMin"),
});

const SignupForm = ({ error }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((store) => store.auth.loading);
  const form = useForm({
    resolver: i18nResolver(formSchema),
    defaultValues: { email: "", password: "", fullName: "" },
  });

  const [captcha, setCaptcha] = useState(null);
  const [captchaError, setCaptchaError] = useState(null);
  const widget = useRef(null);

  const onSubmit = async (data) => {
    data.navigate = navigate;
    data.captchaToken = captcha;
    await dispatch(register(data));
    widget.current?.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthError error={error || captchaError} />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="name"
                  aria-label={t("auth.fields.fullName")}
                  className="h-11"
                  placeholder={t("auth.fields.fullName")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  aria-label={t("auth.fields.email")}
                  className="h-11"
                  placeholder={t("auth.fields.email")}
                />
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
                  aria-label={t("auth.fields.password")}
                  className="h-11"
                  placeholder={t("auth.signup.passwordPlaceholder")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <TurnstileWidget ref={widget} onToken={setCaptcha} onError={setCaptchaError} />
        <SubmitButton loading={loading} disabled={!captcha}>{t("auth.signup.submit")}</SubmitButton>
      </form>
    </Form>
  );
};

export default SignupForm;
