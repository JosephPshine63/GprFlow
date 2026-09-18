import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { twoStepVerification } from "@/Redux/Auth/Action";
import AuthLayout from "@/components/layout/AuthLayout";
import AuthError from "@/components/custome/AuthError";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const TwoFactorAuth = () => {
  const [value, setValue] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { session } = useParams();
  const error = useSelector((store) => store.auth.error);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(twoStepVerification({ otp: value, session, navigate }));
  };

  return (
    <AuthLayout
      title="Verifica in due passaggi"
      subtitle="Inserisci il codice a 6 cifre che ti abbiamo inviato via email."
      footer={
        <Link to="/signin" className="font-semibold text-primary hover:underline">
          Torna al login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthError error={error} />
        <InputOTP value={value} onChange={setValue} maxLength={6}>
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
        <button
          type="submit"
          disabled={value.length < 6}
          className="btn-brand h-11 w-full"
        >
          Verifica
        </button>
      </form>
    </AuthLayout>
  );
};

export default TwoFactorAuth;
