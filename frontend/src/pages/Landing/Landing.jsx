/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bot,
  CandlestickChart,
  LineChart,
  ShieldCheck,
  Wallet,
  WalletCards,
} from "lucide-react";
import BrandMark from "@/components/custome/BrandMark";
import LanguageSwitcher from "@/components/custome/LanguageSwitcher";
import Seo from "@/components/custome/Seo";
import ThemeToggle from "@/components/custome/ThemeToggle";
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  isSupportedLanguage,
  landingPath,
  setLanguage,
} from "@/i18n";

// scripts/seo-build.mjs renders the same copy into static HTML for crawlers; keep the two in step.
const SITE_URL = "https://gprflow.trade";
const absolute = (code) => `${SITE_URL}${landingPath(code)}`;

const ALTERNATES = [
  ...LANGUAGES.map(({ code }) => ({ hreflang: code, href: absolute(code) })),
  { hreflang: "x-default", href: absolute(DEFAULT_LANGUAGE) },
];

const features = [
  { icon: LineChart, key: "markets" },
  { icon: CandlestickChart, key: "trading" },
  { icon: WalletCards, key: "portfolio" },
  { icon: Wallet, key: "wallet" },
  { icon: Bot, key: "assistant" },
  { icon: ShieldCheck, key: "security" },
];

const steps = ["signup", "topup", "trade"];

const secondaryButton =
  "inline-flex h-12 items-center justify-center rounded-xl border px-8 text-base font-semibold hover:bg-accent";

// `lang` comes from the route (/it, /fr, ...); the root route is English.
const Landing = ({ lang }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state } = useLocation();
  const current = i18n.language;
  const code = lang ?? DEFAULT_LANGUAGE;

  useEffect(() => {
    if (lang) setLanguage(lang);
  }, [lang]);

  // A returning visitor keeps their language: the root page hands them over to its localized twin,
  // unless they just picked English from one (`picked`, see choose).
  if (!lang && !state?.picked && current !== DEFAULT_LANGUAGE && isSupportedLanguage(current)) {
    return <Navigate to={landingPath(current)} replace />;
  }

  // Routes are keyed by language in App.jsx, so this page remounts on every switch and the effect
  // above would put the old route's language back; navigating first with `picked` avoids the redirect.
  const choose = (next) => {
    navigate(landingPath(next), { state: { picked: true } });
    return setLanguage(next);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title={t("landing.metaTitle")}
        description={t("landing.metaDescription")}
        robots="index, follow"
        canonical={absolute(code)}
        alternates={ALTERNATES}
      />

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to={landingPath(code)} className="flex items-center gap-3">
          <BrandMark className="h-8" />
          <span className="font-heading text-xl font-bold">GprFlow</span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher onSelect={choose} />
          <ThemeToggle />
          <Link to="/signin" className="btn-brand ml-2 h-10 px-4">
            {t("landing.ctaSignin")}
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-12 text-center md:pt-20">
          <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">
            {t("landing.h1")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t("landing.subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="btn-brand h-12 px-8 text-base">
              {t("landing.ctaSignup")}
            </Link>
            <Link to="/signin" className={secondaryButton}>
              {t("landing.ctaSignin")}
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-center font-heading text-3xl font-bold">
            {t("landing.featuresTitle")}
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, key }) => (
              <article key={key} className="surface p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand text-white">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{t(`landing.features.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`landing.features.${key}.body`)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="text-center font-heading text-3xl font-bold">{t("landing.stepsTitle")}</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((key, index) => (
              <li key={key} className="surface p-6">
                <span className="font-heading text-3xl font-bold text-gradient">{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold">{t(`landing.steps.${key}.title`)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(`landing.steps.${key}.body`)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="surface-glass p-6 text-center">
            <h2 className="text-xl font-semibold">{t("landing.demoTitle")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{t("landing.demoBody")}</p>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-center text-sm text-muted-foreground">
        <nav aria-label={t("landing.languages")} className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          {LANGUAGES.map(({ code: next, label }) => (
            <a
              key={next}
              href={landingPath(next)}
              hrefLang={next}
              lang={next}
              onClick={(event) => {
                event.preventDefault();
                choose(next);
              }}
              className="hover:text-foreground hover:underline"
            >
              {label}
            </a>
          ))}
        </nav>
        <p className="mt-6">gprflow.trade</p>
      </footer>
    </div>
  );
};

export default Landing;
