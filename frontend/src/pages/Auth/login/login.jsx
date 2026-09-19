/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/Redux/Auth/Action";
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

const formSchema = z.object({
  email: z.string().email("Indirizzo email non valido"),
  password: z.string().min(8, "La password deve avere almeno 8 caratteri"),
});

const LoginForm = ({ error }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((store) => store.auth.loading);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data) => {
    data.navigate = navigate;
    dispatch(login(data));
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  autoComplete="current-password"
                  aria-label="Password"
                  className="h-11"
                  placeholder="Password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-right">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Password dimenticata?
          </Link>
        </div>
        <SubmitButton loading={loading}>Accedi</SubmitButton>
      </form>
    </Form>
  );
};

export default LoginForm;
