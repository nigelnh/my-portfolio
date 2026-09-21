"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sfx";
import { useLang } from "@/lib/i18n";

/**
 * The sound switch, styled like the language buttons it sits beside.
 * `variant="bar"` matches the compact set inside the About title bar.
 */
export function BlobToggles({ variant = "rail" }: { variant?: "rail" | "bar" }) {
  const { t } = useLang();
  const [sound, setSound] = useState(false);

  useEffect(() => {
    setSound(isSoundEnabled());
    return subscribeSound(setSound);
  }, []);

  return (
    <button
      type="button"
      className={variant === "bar" ? "lang lang--bar" : "lang"}
      aria-pressed={sound}
      onClick={() => setSoundEnabled(!sound)}
    >
      {t.hero.blob.sound}
    </button>
  );
}
