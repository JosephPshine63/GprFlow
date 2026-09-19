/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { sendVerificationOtp } from "@/Redux/Auth/Action";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthError from "@/components/custome/AuthError";

const OTP_LENGTH = 6;

// Two steps: ask for the email code, then confirm it. onSubmit gets the code and
// must reject on failure so the message shows up here.
const AccountVarificationForm = ({ onSubmit, onDone }) => {
  const dispatch = useDispatch();
  const email = useSelector((store) => store.auth.user?.email);
  const [step, setStep] = useState("send");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const run = async (task) => {
    setBusy(true);
    setError(null);
    try {
      await task();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const sendCode = () =>
    run(async () => {
      await dispatch(sendVerificationOtp({ verificationType: "EMAIL" }));
      setOtp("");
      setStep("code");
    });

  const confirm = (e) => {
    e.preventDefault();
    if (otp.length !== OTP_LENGTH) return;
    run(async () => {
      await onSubmit(otp);
      onDone();
    });
  };

  if (step === "send") {
    return (
      <div className="space-y-4">
        <AuthError error={error} />
        <p className="text-sm text-muted-foreground">
          Invieremo un codice a {OTP_LENGTH} cifre a{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
        <button type="button" onClick={sendCode} disabled={busy} className="btn-brand h-12 w-full">
          {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Invia codice
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={confirm} className="space-y-5">
      <AuthError error={error} />
      <p className="text-sm text-muted-foreground">
        Inserisci il codice che abbiamo inviato a{" "}
        <span className="font-medium text-foreground">{email}</span>.
      </p>
      <div className="flex justify-center">
        <InputOTP autoFocus value={otp} onChange={setOtp} maxLength={OTP_LENGTH}>
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
      </div>
      <button
        type="submit"
        disabled={busy || otp.length !== OTP_LENGTH}
        className="btn-brand h-12 w-full"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Conferma
      </button>
      <button
        type="button"
        onClick={sendCode}
        disabled={busy}
        className="w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Invia di nuovo il codice
      </button>
    </form>
  );
};

export default AccountVarificationForm;
