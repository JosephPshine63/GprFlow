import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import AuthLayout from "@/components/layout/AuthLayout";
import SignupForm from "./signup/SignupForm";
import LoginForm from "./login/login";
import ForgotPasswordForm from "./ForgotPassword";

const linkClass = "font-semibold text-primary hover:underline";

const Auth = () => {
  const { pathname } = useLocation();
  const error = useSelector((store) => store.auth.error);

  if (pathname === "/signup") {
    return (
      <AuthLayout
        title="Crea il tuo account"
        subtitle="Inizia a fare trading in pochi minuti."
        footer={
          <>
            Hai già un account?{" "}
            <Link to="/signin" className={linkClass}>
              Accedi
            </Link>
          </>
        }
      >
        <SignupForm error={error} />
      </AuthLayout>
    );
  }

  if (pathname === "/forgot-password") {
    return (
      <AuthLayout
        title="Recupera la password"
        subtitle="Ti invieremo un codice via email per reimpostarla."
        footer={
          <Link to="/signin" className={linkClass}>
            Torna al login
          </Link>
        }
      >
        <ForgotPasswordForm />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Bentornato"
      subtitle="Accedi per gestire il tuo portafoglio."
      footer={
        <>
          Non hai un account?{" "}
          <Link to="/signup" className={linkClass}>
            Registrati
          </Link>
        </>
      }
    >
      <LoginForm error={error} />
    </AuthLayout>
  );
};

export default Auth;
