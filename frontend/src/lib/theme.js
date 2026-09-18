import { useEffect, useState } from "react";

// Reads a shadcn HSL channel variable (e.g. "238 65% 65%") as a comma-separated hsl() color,
// which is the form ApexCharts can parse.
export const cssColor = (name) => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--${name}`)
    .trim();
  const [h, s, l] = raw.split(/\s+/);
  return `hsl(${h}, ${s}, ${l})`;
};

export const useIsDark = () => {
  const root = document.documentElement;
  const [dark, setDark] = useState(root.classList.contains("dark"));

  useEffect(() => {
    const observer = new MutationObserver(() =>
      setDark(root.classList.contains("dark"))
    );
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [root]);

  return dark;
};
