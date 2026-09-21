"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { subscribeTyping } from "@/lib/typing";
import { BLOB_ANIM, BlobSprite } from "./sprites";
import { BLOB_SIZE, HOP_PARAMS, useBlobBrain, type Arena } from "./useBlobBrain";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}

/** The blob's arena: the block beside the laptop in the About panel. */
export function BlobStage() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const b = t.hero.blob;

  const stageRef = useRef<HTMLDivElement>(null);
  const arena = useRef<Arena>({ w: 400, h: 300 });

  const [typing, setTypingState] = useState(false);
  useEffect(() => subscribeTyping(setTypingState), []);

  const brain = useBlobBrain({ enabled: !reduced, arena, typing });

  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const say = useCallback((text: string, ms = 2600) => {
    setFlash(text);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), ms);
  }, []);

  // Keep the measured arena in step with layout and viewport changes.
  const measure = useCallback(() => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    arena.current = { w: r.width, h: r.height };
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (stageRef.current) ro.observe(stageRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const firstRun = useRef(true);
  useEffect(() => {
    if (!firstRun.current) return;
    firstRun.current = false;
    measure();
    brain.placeAt(40, arena.current.h - BLOB_SIZE.h - 8);
    // Placing once, on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const line = flash ?? (brain.asking ? b.ask : b[brain.state]);

  const answer = (yes: boolean) => {
    say(yes ? b.accepted : b.refused, 3000);
    brain.answerBoba(yes);
  };

  const poke = () => {
    const result = brain.onPoke();
    say(result === "woken" ? b.woken : result === "rage" ? b.angry : b.poked);
  };

  // Near the top of the arena the bubble would run off, so flip it below.
  const bubbleBelow = brain.y < 90;

  return (
    <div ref={stageRef} className="blob-stage">
      <div
        className="blob-actor"
        data-state={brain.state}
        data-mode={brain.moveMode}
        data-energy={Math.round(brain.vitals.energy)}
        data-boba={Math.round(brain.vitals.bobaNeed)}
        data-code={Math.round(brain.vitals.codeUrge)}
        style={{
          left: `${Math.round(brain.x)}px`,
          top: `${Math.round(brain.y)}px`,
          transition: `left ${HOP_PARAMS.duration}ms cubic-bezier(0.28, 0.84, 0.42, 1), top ${HOP_PARAMS.duration}ms cubic-bezier(0.28, 0.84, 0.42, 1)`,
        }}
      >
        <div
          className={`blob-bubble${brain.asking ? " blob-bubble--open" : ""}`}
          data-below={bubbleBelow}
          role={brain.asking ? "dialog" : undefined}
          aria-label={brain.asking ? b.ask : undefined}
        >
          <p className="blob-bubble__text">{line}</p>
          {brain.asking ? (
            <div className="blob-bubble__actions">
              <button type="button" className="blob-answer" onClick={() => answer(true)}>
                {b.yes}
              </button>
              <button
                type="button"
                className="blob-answer blob-answer--no"
                onClick={() => answer(false)}
              >
                {b.no}
              </button>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="blob-hit"
          onMouseEnter={brain.onHover}
          onFocus={brain.onHover}
          onClick={poke}
          aria-label={b.label}
        >
          <span className={`blob-flip${brain.facingLeft ? " blob-flip--left" : ""}`}>
            <BlobSprite
              // Re-keying on hopId restarts the one-shot hop animation.
              key={brain.hopping ? `hop-${brain.hopId}` : `rest-${brain.state}`}
              state={brain.state}
              size={BLOB_SIZE.w}
              className={`pixel-blob ${brain.hopping ? "anim-single-hop" : BLOB_ANIM[brain.state]}`}
              style={brain.hopping ? { animationDuration: `${HOP_PARAMS.duration}ms` } : undefined}
            />
          </span>
        </button>
      </div>
    </div>
  );
}
