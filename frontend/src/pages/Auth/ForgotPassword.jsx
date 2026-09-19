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
import SubmitButton from "@/components/custome/SubmitButton";

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

  const onSubmit = (data) => {
    dispatch(
      sendResetPassowrdOTP({
        sendTo: data.email,
        navigate,
        verificationType: "EMAIL",
      })
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
        <SubmitButton>Invia codice</SubmitButton>
      </form>
    </Form>
  );
};

export default ForgotPasswordForm;
