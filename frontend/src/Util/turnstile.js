// Cloudflare's always-pass test key; used when nothing else is configured.
const TEST_SITE_KEY = "1x00000000000000000000AA";

export const TURNSTILE_SITE_KEY =
  window.__RUNTIME_CONFIG__?.TURNSTILE_SITE_KEY ||
  import.meta.env.VITE_TURNSTILE_SITE_KEY ||
  TEST_SITE_KEY;

export const turnstileHeaders = (token) =>
  token ? { "X-Turnstile-Token": token } : {};

let scriptPromise;

export const loadTurnstile = () => {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => {
      scriptPromise = undefined;
      reject(new Error("Impossibile caricare la verifica anti-bot."));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
};
