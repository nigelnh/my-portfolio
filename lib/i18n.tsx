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
import { LANGS, STRINGS, type LangId, type Strings } from "./copy";

const STORAGE_KEY = "portfolio.lang";

function isLang(value: string | null): value is LangId {
  return !!value && LANGS.some((l) => l.id === value);
}

interface LangContextValue {
  lang: LangId;
  setLang: (lang: LangId) => void;
  t: Strings;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({
  children,
  initial = "en",
}: {
  children: ReactNode;
  initial?: LangId;
}) {
  const [lang, setLangState] = useState<LangId>(initial);

  // Restore the previous choice after hydration so server and client markup match.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLang(saved)) setLangState(saved);
    } catch {
      // Storage can be unavailable (private mode, blocked cookies) — ignore.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : lang;
  }, [lang]);

  const setLang = useCallback((next: LangId) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — the choice simply won't persist.
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({ lang, setLang, t: STRINGS[lang] }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
