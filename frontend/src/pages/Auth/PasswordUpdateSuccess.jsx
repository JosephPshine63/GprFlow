import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import AuthLayout from "@/components/layout/AuthLayout";

const PasswordUpdateSuccess = () => {
  const navigate = useNavigate();
  return (
    <AuthLayout
      title="Password aggiornata"
      subtitle="La tua password è stata cambiata con successo."
    >
      <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-8">
        <CheckCircle2 className="h-14 w-14 text-up" strokeWidth={1.5} />
        <button
          type="button"
          onClick={() => navigate("/")}
          className="btn-brand h-11 w-full"
        >
          Vai al login
        </button>
      </div>
    </AuthLayout>
  );
};

export default PasswordUpdateSuccess;
