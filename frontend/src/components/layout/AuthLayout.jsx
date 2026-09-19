/* eslint-disable react/prop-types */
import { useTranslation } from "react-i18next";
import { LineChart, ShieldCheck, Zap } from "lucide-react";
import BrandMark from "@/components/custome/BrandMark";
import LanguageSwitcher from "@/components/custome/LanguageSwitcher";

const highlights = [
  { icon: LineChart, key: "auth.layout.highlight1" },
  { icon: Zap, key: "auth.layout.highlight2" },
  { icon: ShieldCheck, key: "auth.layout.highlight3" },
];

const AuthLayout = ({ title, subtitle, footer, children }) => {
  const { t } = useTranslation();
  return (
  <div className="grid min-h-screen bg-background lg:grid-cols-2">
    <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
      <div className="flex items-center gap-3">
        <BrandMark className="h-9 bg-white [background-image:none]" />
        <span className="font-heading text-2xl font-bold">GprFlow</span>
      </div>

      <div className="relative z-10 max-w-md">
        <h2 className="font-heading text-4xl font-bold leading-tight">
          {t("auth.layout.headline")}
        </h2>
        <ul className="mt-8 space-y-4">
          {highlights.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-3 text-white/90">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>
      </div>

      <BrandMark className="pointer-events-none absolute -bottom-10 -right-16 h-72 bg-white opacity-10 [background-image:none]" />
      <p className="relative z-10 text-sm text-white/60">
        gprflow.trade
      </p>
    </aside>

    <main className="relative flex items-center justify-center px-6 py-10">
      <LanguageSwitcher className="absolute right-4 top-4" />
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
};

export default AuthLayout;
