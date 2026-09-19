/* eslint-disable react/prop-types */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";
import { enableTwoStepAuthentication, getUser, verifyOtp } from "@/Redux/Auth/Action";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import AppDialog from "@/components/custome/AppDialog";
import { cn } from "@/lib/utils";
import AccountVarificationForm from "./AccountVarificationForm";
import ChangePasswordForm from "./ChangePasswordForm";

const ROLES = { ROLE_ADMIN: "Amministratore", ROLE_USER: "Utente" };

const StateBadge = ({ ok, okLabel, pendingLabel }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      ok ? "bg-up/10 text-up" : "bg-warning/15 text-warning"
    )}
  >
    {ok ? okLabel : pendingLabel}
  </span>
);

const Section = ({ icon: Icon, title, badge, description, children }) => (
  <section className="surface flex flex-col p-6">
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
      </span>
      <h2 className="flex-1 text-lg font-semibold">{title}</h2>
      {badge}
    </div>
    <p className="mt-4 flex-1 text-sm text-muted-foreground">{description}</p>
    {children && <div className="mt-5">{children}</div>}
  </section>
);

const Profile = () => {
  const user = useSelector((store) => store.auth.user);
  const dispatch = useDispatch();
  const { toast } = useToast();
  const [dialog, setDialog] = useState(null);

  const twoFactor = Boolean(user?.twoFactorAuth?.enabled);
  const verified = Boolean(user?.verified);
  const name = user?.fullName || user?.email || "";

  const confirmTwoFactor = async (otp) => {
    await dispatch(enableTwoStepAuthentication({ otp }));
    await dispatch(getUser());
    toast({ title: "Verifica in due passaggi attivata" });
  };

  const confirmAccount = async (otp) => {
    await dispatch(verifyOtp({ otp }));
    await dispatch(getUser());
    toast({ title: "Account verificato" });
  };

  const rows = [
    ["Nome", user?.fullName],
    ["Email", user?.email],
    ["Ruolo", ROLES[user?.role] ?? user?.role],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold md:text-3xl">Profilo</h1>

      <section className="surface p-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-brand text-xl font-semibold text-white">
              {name.charAt(0).toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold">{name}</p>
            <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <dl className="mt-5 divide-y text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 py-3">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="min-w-0 truncate text-right font-medium">{value || "-"}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Section
          icon={ShieldCheck}
          title="Sicurezza"
          badge={<StateBadge ok={twoFactor} okLabel="2FA attiva" pendingLabel="2FA non attiva" />}
          description={
            twoFactor
              ? "Al login ti chiediamo anche un codice inviato via email."
              : "Aggiungi un codice via email al login per proteggere meglio il tuo account."
          }
        >
          <div className="space-y-2">
            {!twoFactor && (
              <button
                type="button"
                onClick={() => setDialog("twoFactor")}
                className="btn-brand h-11 w-full"
              >
                Attiva verifica in due passaggi
              </button>
            )}
            <button
              type="button"
              onClick={() => setDialog("password")}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors hover:bg-accent"
            >
              <KeyRound className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              Cambia password
            </button>
          </div>
        </Section>

        <Section
          icon={MailCheck}
          title="Stato account"
          badge={<StateBadge ok={verified} okLabel="Verificato" pendingLabel="Da verificare" />}
          description={
            verified
              ? "La tua email è verificata."
              : "Verifica la tua email con un codice a 6 cifre."
          }
        >
          {!verified && (
            <button
              type="button"
              onClick={() => setDialog("verify")}
              className="btn-brand h-11 w-full"
            >
              Verifica account
            </button>
          )}
        </Section>
      </div>

      <AppDialog
        open={dialog === "twoFactor"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Verifica in due passaggi"
        description="Conferma la tua email per attivarla."
      >
        <AccountVarificationForm onSubmit={confirmTwoFactor} onDone={() => setDialog(null)} />
      </AppDialog>

      <AppDialog
        open={dialog === "password"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Cambia password"
        description="Ti inviamo un codice via email per confermare il cambio."
      >
        <ChangePasswordForm
          onDone={() => {
            setDialog(null);
            toast({ title: "Password aggiornata" });
          }}
        />
      </AppDialog>

      <AppDialog
        open={dialog === "verify"}
        onOpenChange={(open) => !open && setDialog(null)}
        title="Verifica account"
        description="Conferma che l'email è tua."
      >
        <AccountVarificationForm onSubmit={confirmAccount} onDone={() => setDialog(null)} />
      </AppDialog>
    </div>
  );
};

export default Profile;
