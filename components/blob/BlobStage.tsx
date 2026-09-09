"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { armAudio, playSfx } from "@/lib/sfx";
import { BLOB_ANIM, BLOB_ASPECT, BlobSprite } from "./sprites";
import { HOP_PARAMS, useBlobBrain } from "./useBlobBrain";

const BLOB_W = 72;
const BLOB_H = Math.round(BLOB_W * BLOB_ASPECT);

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

/**
 * The blob's arena: it roams freely in two dimensions across the laptop area,
 * hopping between random destinations and stopping to idle, type or drink.
 * The speech bubble rides along, hidden until you hover — except when the blob
 * is waiting on an answer.
 */
export function BlobStage() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const brain = useBlobBrain(!reduced);
  const b = t.hero.blob;

  const [flash, setFlash] = useState<string | null>(null);

  const line = flash ?? (brain.asking ? b.ask : b[brain.state]);

  const answer = (yes: boolean) => {
    setFlash(yes ? b.accepted : b.refused);
    brain.answerBoba(yes);
    window.setTimeout(() => setFlash(null), 3000);
  };

  const poke = () => {
    const result = brain.onPoke();
    setFlash(result === "woken" ? b.woken : result === "rage" ? b.angry : b.poked);
    window.setTimeout(() => setFlash(null), 2600);
  };

  return (
    <div className="blob-stage">
      <div
        className="blob-actor"
        data-state={brain.state}
        data-mode={brain.moveMode}
        // The kit shows these on a HUD; here they just make the blob's
        // decisions inspectable.
        data-energy={Math.round(brain.vitals.energy)}
        data-boba={Math.round(brain.vitals.bobaNeed)}
        data-code={Math.round(brain.vitals.codeUrge)}
        style={{
          left: `calc(${brain.x} * (100% - ${BLOB_W}px))`,
          top: `calc(${brain.y} * (100% - ${BLOB_H}px))`,
          transition: `left ${HOP_PARAMS.duration}ms cubic-bezier(0.28, 0.84, 0.42, 1), top ${HOP_PARAMS.duration}ms cubic-bezier(0.28, 0.84, 0.42, 1)`,
        }}
      >
        <div
          className={`blob-bubble${brain.asking ? " blob-bubble--open" : ""}`}
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
              size={BLOB_W}
              className={`pixel-blob ${brain.hopping ? "anim-single-hop" : BLOB_ANIM[brain.state]}`}
              style={
                brain.hopping
                  ? { animationDuration: `${HOP_PARAMS.duration}ms` }
                  : undefined
              }
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
