"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";
import { armAudio, playSfx } from "@/lib/sfx";
import { BLOB_ANIM, BlobSprite } from "./sprites";
import { useBlobBrain } from "./useBlobBrain";

const BLOB_W = 72;

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
 * The blob's shelf: it wanders left and right along the band under the laptop,
 * stopping to idle, type, or ask for boba. The speech bubble rides along with
 * it — hidden until you hover, except when the blob is waiting on an answer.
 */
export function BlobStage() {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const brain = useBlobBrain(!reduced);
  const b = t.hero.blob;

  const [answered, setAnswered] = useState<"yes" | "no" | null>(null);

  const line = answered
    ? answered === "yes"
      ? b.accepted
      : b.refused
    : brain.asking
      ? b.ask
      : b[brain.state];

  const answer = (yes: boolean) => {
    setAnswered(yes ? "yes" : "no");
    brain.answerBoba(yes);
    setTimeout(() => setAnswered(null), 3000);
  };

  return (
    <div className="blob-stage">
      <div
        className="blob-actor"
        data-state={brain.state}
        data-moving={brain.moving}
        style={{
          left: `calc(${brain.x} * (100% - ${BLOB_W}px))`,
          transition: brain.moving ? "left 900ms ease-out" : "none",
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
          onClick={brain.onPoke}
          aria-label={b.label}
        >
          <span
            className={`blob-flip${brain.facingLeft ? " blob-flip--left" : ""}`}
            style={{ display: "block" }}
          >
            <BlobSprite
              state={brain.state}
              size={BLOB_W}
              className={`pixel-blob ${brain.moving ? "anim-hop" : BLOB_ANIM[brain.state]}`}
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
