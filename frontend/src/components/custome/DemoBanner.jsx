import { useLayoutEffect, useRef, useState } from "react";
import { FlaskConical, X } from "lucide-react";

const STORAGE_KEY = "gprflowDemoBannerDismissed";

const readDismissed = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

// Fixed above the app. Its height is published as --banner-h so the fixed
// sidebar and sticky topbar can start below it instead of underneath.
const DemoBanner = () => {
  const [dismissed, setDismissed] = useState(readDismissed);
  const ref = useRef(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const node = ref.current;
    if (dismissed || !node) {
      root.style.setProperty("--banner-h", "0px");
      return undefined;
    }
    const publish = () =>
      root.style.setProperty("--banner-h", `${node.offsetHeight}px`);
    publish();
    const observer = new ResizeObserver(publish);
    observer.observe(node);
    return () => {
      observer.disconnect();
      root.style.setProperty("--banner-h", "0px");
    };
  }, [dismissed]);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // storage blocked: the banner just returns on the next visit
    }
  };

  return (
    <div
      ref={ref}
      role="region"
      aria-label="Avviso ambiente demo"
      className="fixed inset-x-0 top-0 z-40 flex items-start gap-3 border-b border-warning/30 bg-warning/15 px-4 py-2 text-sm backdrop-blur-md"
    >
      <FlaskConical
        className="mt-0.5 h-4 w-4 shrink-0 text-warning"
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <p className="flex-1 text-foreground">
        <strong className="font-semibold">Ambiente demo.</strong> GprFlow è
        un&apos;app dimostrativa creata per portfolio e CV: è tutto in sandbox,
        non si può fare trading con denaro reale né eseguire prelievi (payout) o
        altre operazioni reali.
      </p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Chiudi l'avviso"
        className="-my-0.5 shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
};

export default DemoBanner;
