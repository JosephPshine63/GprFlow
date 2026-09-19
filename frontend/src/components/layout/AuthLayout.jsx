/* eslint-disable react/prop-types */
import { LineChart, ShieldCheck, Zap } from "lucide-react";
import BrandMark from "@/components/custome/BrandMark";

const highlights = [
  { icon: LineChart, text: "Mercati e grafici in tempo reale" },
  { icon: Zap, text: "Ordini di acquisto e vendita immediati" },
  { icon: ShieldCheck, text: "Verifica in due passaggi sul tuo account" },
];

const AuthLayout = ({ title, subtitle, footer, children }) => (
  <div className="grid min-h-screen bg-background lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3">
        <BrandMark className="h-9 bg-white [background-image:none]" />
        <span className="font-heading text-2xl font-bold">GprFlow</span>
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="font-heading text-4xl font-bold leading-tight">
          Fai crescere il tuo portafoglio crypto.
        </h2>
        <ul className="mt-8 space-y-4">
          {highlights.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-white/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <BrandMark className="pointer-events-none absolute -bottom-10 -right-16 h-72 bg-white opacity-10 [background-image:none]" />
      <p className="relative z-10 text-sm text-white/60">
        gprflow.trade
      </p>
    </aside>

    <main className="flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-slide-in">
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <BrandMark className="h-8" />
          <span className="font-heading text-xl font-bold">GprFlow</span>
        </div>
        <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        )}
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </main>
  </div>
);

export default AuthLayout;
