import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { verifyResetPassowrdOTP } from "@/Redux/Auth/Action";
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

const formSchema = yup.object({
  password: yup
    .string()
    .min(8, "La password deve avere almeno 8 caratteri")
    .required("La password è obbligatoria"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Le password non coincidono")
    .required("Conferma la password"),
  otp: yup
    .string()
    .min(6, "Il codice deve avere 6 cifre")
    .required("Il codice è obbligatorio"),
});

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { session } = useParams();
  const error = useSelector((store) => store.auth.error);
  const form = useForm({
    resolver: yupResolver(formSchema),
    defaultValues: { confirmPassword: "", password: "", otp: "" },
  });

  const onSubmit = (data) => {
    dispatch(
      verifyResetPassowrdOTP({
        otp: data.otp,
        password: data.password,
        session,
        navigate,
      })
    );
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
          <SubmitButton>Cambia password</SubmitButton>
        </form>
      </Form>
    </AuthLayout>
  );
};

export default ResetPasswordForm;
