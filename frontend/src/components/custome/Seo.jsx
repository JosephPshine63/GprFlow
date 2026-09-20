import { useEffect } from "react";

const upsertMeta = (name, content) => {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  const created = !el;
  if (created) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  const previous = el.getAttribute("content");
  el.setAttribute("content", content);
  return () => {
    if (created) el.remove();
    else el.setAttribute("content", previous ?? "");
  };
};

// Replaces every <link> matching `selector` with the given ones.
const replaceLinks = (selector, attrsList) => {
  document.head.querySelectorAll(selector).forEach((el) => el.remove());
  const added = attrsList.map((attrs) => {
    const el = document.createElement("link");
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    document.head.appendChild(el);
    return el;
  });
  return () => added.forEach((el) => el.remove());
};

// Head tags for the current route. The indexable pages are also emitted statically by
// scripts/seo-build.mjs; this keeps them right on client-side navigation and restores
// the previous values on unmount.
// eslint-disable-next-line react/prop-types
const Seo = ({ title, description, robots, canonical, alternates }) => {
  const alternatesKey = JSON.stringify(alternates ?? []);

  useEffect(() => {
    const cleanups = [];
    if (title) {
      const previous = document.title;
      document.title = title;
      cleanups.push(() => {
        document.title = previous;
      });
    }
    if (description) cleanups.push(upsertMeta("description", description));
    if (robots) cleanups.push(upsertMeta("robots", robots));
    if (canonical) cleanups.push(replaceLinks('link[rel="canonical"]', [{ rel: "canonical", href: canonical }]));
    const hreflangs = JSON.parse(alternatesKey);
    if (hreflangs.length) {
      cleanups.push(
        replaceLinks(
          'link[rel="alternate"][hreflang]',
          hreflangs.map(({ hreflang, href }) => ({ rel: "alternate", hreflang, href }))
        )
      );
    }
    return () => cleanups.reverse().forEach((fn) => fn());
  }, [title, description, robots, canonical, alternatesKey]);

  return null;
};

export default Seo;
