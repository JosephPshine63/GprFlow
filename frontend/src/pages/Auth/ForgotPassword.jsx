import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch } from "react-redux";
import { sendResetPassowrdOTP } from "@/Redux/Auth/Action";
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
  email: z.string().email("Indirizzo email non valido"),
});

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const [error, setError] = useState(null);
  const [captcha, setCaptcha] = useState(null);
  const widget = useRef(null);

  const onSubmit = async (data) => {
    setError(null);
    try {
      await dispatch(
        sendResetPassowrdOTP({
          sendTo: data.email,
          navigate,
          verificationType: "EMAIL",
          captchaToken: captcha,
        })
      );
    } catch (err) {
      setError(err.message);
      widget.current?.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AuthError error={error} />
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
                  aria-label="Email"
                  className="h-11"
                  placeholder="Email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <TurnstileWidget ref={widget} onToken={setCaptcha} onError={setError} />
        <SubmitButton loading={form.formState.isSubmitting} disabled={!captcha}>
          Invia codice
        </SubmitButton>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
