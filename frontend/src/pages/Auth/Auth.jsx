import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import AuthLayout from "@/components/layout/AuthLayout";
import SignupForm from "./signup/SignupForm";
import LoginForm from "./login/login";
import ForgotPasswordForm from "./ForgotPassword";

const linkClass = "font-semibold text-primary hover:underline";

const Auth = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const error = useSelector((store) => store.auth.error);

  if (pathname === "/signup") {
    return (
      <AuthLayout
        title={t("auth.signup.title")}
        subtitle={t("auth.signup.subtitle")}
        footer={
          <>
            {t("auth.signup.haveAccount")}{" "}
            <Link to="/signin" className={linkClass}>
              {t("auth.signup.loginLink")}
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
        title={t("auth.forgot.title")}
        subtitle={t("auth.forgot.subtitle")}
        footer={
          <Link to="/signin" className={linkClass}>
            {t("common.backToLogin")}
          </Link>
        }
      >
        <ForgotPasswordForm />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
      footer={
        <>
          {t("auth.login.noAccount")}{" "}
          <Link to="/signup" className={linkClass}>
            {t("auth.login.signupLink")}
          </Link>
        </>
      }
    >
      <LoginForm error={error} />
    </AuthLayout>
  );
};

export default Auth;
