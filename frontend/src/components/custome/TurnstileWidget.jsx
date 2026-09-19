/* eslint-disable react/prop-types */
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { TURNSTILE_SITE_KEY, loadTurnstile } from "@/Util/turnstile";

// A token is single use: call reset() on the ref after every submit.
const TurnstileWidget = forwardRef(({ onToken, onError }, ref) => {
  const box = useRef(null);
  const widgetId = useRef(null);
  const callbacks = useRef({ onToken, onError });
  callbacks.current = { onToken, onError };

  useEffect(() => {
    let cancelled = false;
    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !box.current) return;
        widgetId.current = turnstile.render(box.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          callback: (token) => callbacks.current.onToken(token),
          "expired-callback": () => callbacks.current.onToken(null),
          "error-callback": () => {
            callbacks.current.onToken(null);
            callbacks.current.onError?.("Verifica anti-bot non riuscita, riprova.");
          },
        });
      })
      .catch((err) => callbacks.current.onError?.(err.message));
    return () => {
      cancelled = true;
      if (widgetId.current !== null) window.turnstile?.remove(widgetId.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    reset: () => {
      callbacks.current.onToken(null);
      if (widgetId.current !== null) window.turnstile?.reset(widgetId.current);
    },
  }));

  return <div ref={box} className="flex min-h-[65px] justify-center" />;
});

TurnstileWidget.displayName = "TurnstileWidget";

export default TurnstileWidget;
