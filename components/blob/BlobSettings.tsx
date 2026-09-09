"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sfx";
import { useLang } from "@/lib/i18n";

const PET_KEY = "portfolio.blobPet";

interface BlobSettings {
  pet: boolean;
  togglePet: () => void;
}

const Ctx = createContext<BlobSettings>({ pet: true, togglePet: () => {} });

/** Screen-pet mode is shared: the rail toggles it, the About panel hosts it. */
export function BlobSettingsProvider({ children }: { children: ReactNode }) {
  const [pet, setPet] = useState(true);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PET_KEY);
      if (saved !== null) setPet(saved === "1");
    } catch {
      // Storage can be unavailable; the default stands.
    }
  }, []);

  const togglePet = useCallback(() => {
    setPet((p) => {
      try {
        window.localStorage.setItem(PET_KEY, p ? "0" : "1");
      } catch {
        // Ignore — the choice just won't persist.
      }
      return !p;
    });
  }, []);

  const value = useMemo(() => ({ pet, togglePet }), [pet, togglePet]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBlobSettings() {
  return useContext(Ctx);
}

/**
 * Pet and sound switches, styled like the language buttons they sit beside.
 * `variant="bar"` matches the compact set inside the About title bar.
 */
export function BlobToggles({ variant = "rail" }: { variant?: "rail" | "bar" }) {
  const { t } = useLang();
  const { pet, togglePet } = useBlobSettings();
  const [sound, setSound] = useState(false);

  useEffect(() => {
    setSound(isSoundEnabled());
    return subscribeSound(setSound);
  }, []);

  const cls = variant === "bar" ? "lang lang--bar" : "lang";

  return (
    <>
      <button type="button" className={cls} aria-pressed={pet} onClick={togglePet}>
        {t.hero.blob.pet}
      </button>
      <button
        type="button"
        className={cls}
        aria-pressed={sound}
        onClick={() => setSoundEnabled(!sound)}
      >
        {t.hero.blob.sound}
      </button>
    </>
  );
}
