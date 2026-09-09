"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { projectsMeta } from "@/lib/copy";
import { useLang } from "@/lib/i18n";
import { armAudio, playSfx } from "@/lib/sfx";
import { Icon } from "../icons";
import { useTerminal } from "./useTerminal";

type Power = "off" | "booting" | "on";

const BOOT_MS = 2200;
const SESSION_KEY = "portfolio.macBooted";
/** The preview renders at desktop width, then scales down to fit the screen. */
const PREVIEW_W = 1280;
const PREVIEW_H = 800;
/**
 * A blocked frame still fires `load` (on the browser's own error page) and is
 * cross-origin, so the page cannot tell. `/api/embeddable` reads the response
 * headers server-side and answers for us.
 */
type FrameState = "loading" | "live" | "blocked";

/**
 * The MacBook screen: power it on, get a shell, `cd` into a project and `run`
 * it to load the live deployment right in the screen.
 */
export function MacScreen() {
  const { t } = useLang();
  const [power, setPower] = useState<Power>("off");
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(0.35);
  const [frameState, setFrameState] = useState<FrameState>("loading");

  const screenRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");

  const titles = Object.fromEntries(
    projectsMeta.map((p, i) => [p.id, t.projects.items[i].title]),
  );

  const shutdown = useCallback(() => {
    window.setTimeout(() => setPower("off"), 600);
  }, []);

  const term = useTerminal({ t, titles, onShutdown: shutdown });
  const { reset } = term;

  const boot = useCallback(() => {
    armAudio();
    playSfx("success");
    setPower("booting");
    setProgress(0);
  }, []);

  // Boot itself on the first visit of the session; later loads land on the
  // shell directly so the animation does not replay on every navigation.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let seen = false;
    try {
      seen = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Storage can be unavailable; treat it as a first visit.
    }
    if (seen) {
      setPower("on");
      reset(t);
    } else {
      setPower("booting");
    }
    // Only on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot progress, then hand over to the shell.
  useEffect(() => {
    if (power !== "booting") return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const p = Math.min(1, (Date.now() - startedAt) / BOOT_MS);
      setProgress(p);
      if (p === 1) {
        clearInterval(id);
        setPower("on");
        reset(t);
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          // Ignore — the boot animation will simply replay next time.
        }
      }
    }, 60);
    return () => clearInterval(id);
  }, [power, reset, t]);

  // Keep the running preview scaled to whatever the screen measures.
  useLayoutEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    const measure = () => setScale(el.clientWidth / PREVIEW_W);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Follow the output as it grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [term.lines]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      armAudio();
      playSfx("blip", 0.5);
      term.submit(draft);
      setDraft("");
      return;
    }
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = term.recall(e.key === "ArrowUp" ? -1 : 1);
      if (next !== null) setDraft(next);
    }
  };

  const runningProject = projectsMeta.find((p) => p.id === term.running);

  // Ask the server whether this deployment allows framing before showing it.
  useEffect(() => {
    const url = projectsMeta.find((p) => p.id === term.running)?.url;
    if (!url) return;
    setFrameState("loading");
    let cancelled = false;
    fetch(`/api/embeddable?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((d: { embeddable?: boolean }) => {
        if (!cancelled) setFrameState(d.embeddable ? "live" : "blocked");
      })
      .catch(() => {
        if (!cancelled) setFrameState("blocked");
      });
    return () => {
      cancelled = true;
    };
  }, [term.running]);

  return (
    <div className="mac__screen" ref={screenRef} data-power={power}>
      {power === "off" ? (
        <button type="button" className="mac__power" onClick={boot}>
          <Icon name="touch-id-power" size={24} />
          <span>{t.mac.powerOn}</span>
        </button>
      ) : null}

      {power === "booting" ? (
        <div className="mac__boot">
          <Icon name="apple-glow" size={48} className="apple-boot-glow" />
          <div className="mac__progress">
            <div className="mac__progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
          <p>{t.mac.booting}</p>
        </div>
      ) : null}

      {power === "on" && !runningProject ? (
        // Clicking anywhere on the shell focuses the prompt.
        <div
          className="mac__terminal"
          onClick={() => inputRef.current?.focus()}
          role="presentation"
        >
          <div className="mac__menubar">
            <Icon name="apple-silver" size={12} />
            <span>zsh — portfolio</span>
          </div>
          <div className="mac__scroll" ref={scrollRef}>
            {term.lines.map((l) => (
              <p key={l.id} className="mac__line" data-kind={l.kind}>
                {l.text || " "}
              </p>
            ))}
            <p className="mac__line mac__line--input">
              <span className="mac__prompt">{term.prompt}</span>
              <span className="mac__draft">{draft}</span>
              <span className="mac__caret" />
            </p>
          </div>
          <label className="visually-hidden" htmlFor="mac-input">
            {t.mac.screenLabel}
          </label>
          <input
            id="mac-input"
            ref={inputRef}
            className="mac__input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>
      ) : null}

      {power === "on" && runningProject?.url ? (
        <div className="mac__preview" data-frame={frameState}>
          {frameState !== "live" ? (
            <div className="mac__blocked">
              <Icon name="retro-monitor" size={24} />
              <p className="mac__blocked-title">{titles[runningProject.id]}</p>
              <p className="mac__blocked-note">
                {frameState === "loading" ? t.mac.loading : t.mac.blocked}
              </p>
            </div>
          ) : (
            <iframe
              src={runningProject.url}
              title={titles[runningProject.id]}
              className="mac__frame"
              style={{
                width: PREVIEW_W,
                height: PREVIEW_H,
                transform: `scale(${scale})`,
              }}
            />
          )}
          {/* The frame is inert, so this link takes every click. */}
          <a
            className="mac__open"
            href={runningProject.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="mac__open-hint">
              {frameState === "blocked"
                ? t.mac.blockedHint
                : frameState === "loading"
                  ? t.mac.loading
                  : t.mac.openHint}{" "}
              — {runningProject.url.replace(/^https?:\/\//, "")}
            </span>
          </a>
          <button
            type="button"
            className="mac__back"
            onClick={() => term.submit("cd ..")}
            aria-label="Back to the shell"
          >
            ×
          </button>
        </div>
      ) : null}
    </div>
  );
}
