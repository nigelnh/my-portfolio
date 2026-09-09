"use client";

import { LANGS } from "@/lib/copy";
import { useLang } from "@/lib/i18n";

/** `variant="bar"` renders the compact set that lives in the About title bar
 *  on narrow screens, where the left rail is hidden. */
export function LangSwitcher({ variant = "rail" }: { variant?: "rail" | "bar" }) {
  const { lang, setLang } = useLang();

  return (
    <>
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          className={variant === "bar" ? "lang lang--bar" : "lang"}
          aria-pressed={l.id === lang}
          onClick={() => setLang(l.id)}
        >
          {l.label}
        </button>
      ))}
    </>
  );
}
