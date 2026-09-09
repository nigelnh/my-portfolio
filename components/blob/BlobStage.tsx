"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLang } from "@/lib/i18n";
import { armAudio, playSfx } from "@/lib/sfx";
import { BLOB_ANIM, BlobSprite } from "./sprites";
import {
  BLOB_SIZE,
  HOP_PARAMS,
  useBlobBrain,
  type Arena,
  type Pointer,
} from "./useBlobBrain";

const PET_KEY = "portfolio.blobPet";

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

/** Coarse pointers (touch) have nothing to chase. */
function useHasFinePointer() {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return fine;
}

/**
 * The blob's arena. Contained in the laptop block by default; in screen-pet
 * mode the arena is the whole viewport and the blob chases the cursor.
 */
export function BlobStage({ pet }: { pet: boolean }) {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const finePointer = useHasFinePointer();
  const b = t.hero.blob;

  const stageRef = useRef<HTMLDivElement>(null);
  const arena = useRef<Arena>({ w: 400, h: 300 });
  const pointer = useRef<Pointer | null>(null);

  const brain = useBlobBrain({
    enabled: !reduced,
    arena,
    pointer,
    chase: pet && finePointer && !reduced,
  });

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

  // Track the cursor in arena coordinates. In pet mode the arena is the
  // viewport, so client coordinates are already arena coordinates.
  useEffect(() => {
    if (!pet || !finePointer) {
      pointer.current = null;
      return;
    }
    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY, at: Date.now() };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [finePointer, pet]);

  // Moving between the desk and the whole screen: re-measure, then re-place.
  const firstRun = useRef(true);
  useEffect(() => {
    measure();
    if (firstRun.current) {
      firstRun.current = false;
      brain.placeAt(40, arena.current.h - BLOB_SIZE.h - 8);
      return;
    }
    if (pet) {
      brain.placeAt(
        window.innerWidth / 2 - BLOB_SIZE.w / 2,
        window.innerHeight / 2 - BLOB_SIZE.h / 2,
      );
      armAudio();
      playSfx("success");
      say(b.freed, 3200);
    } else {
      brain.placeAt(40, arena.current.h - BLOB_SIZE.h - 8);
      armAudio();
      playSfx("blip");
      say(b.home, 2600);
    }
    // Only react to the mode switch itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pet]);

  // "Caught your cursor" line, thrown occasionally by the chase.
  useEffect(() => {
    if (brain.caughtAt) say(b.caught, 2000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brain.caughtAt]);

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
    <div ref={stageRef} className={`blob-stage${pet ? " blob-stage--pet" : ""}`}>
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

/** Static waving blob for the Contact box. */
export function WaveBlob({ label, size = 72 }: { label: string; size?: number }) {
  return (
    <button
      type="button"
      className="blob-hit"
      onClick={() => {
        armAudio();
        playSfx("blip");
      }}
      aria-label={label}
    >
      <BlobSprite state="wave" size={size} className="pixel-blob anim-idle" />
    </button>
  );
}

/** Lets the visitor let the blob out onto the whole page, or put it back. */
export function usePetMode() {
  const [pet, setPet] = useState(true);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PET_KEY);
      if (saved !== null) setPet(saved === "1");
    } catch {
      // Storage can be unavailable; the default stands.
    }
  }, []);
  const toggle = useCallback(() => {
    setPet((p) => {
      try {
        window.localStorage.setItem(PET_KEY, p ? "0" : "1");
      } catch {
        // Ignore — the choice just won't persist.
      }
      return !p;
    });
  }, []);
  return { pet, toggle };
}
