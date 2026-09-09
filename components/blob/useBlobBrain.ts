"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { armAudio, playSfx } from "@/lib/sfx";
import type { BlobState } from "./sprites";

/** Activities the blob picks between whenever it stops moving. */
const ACTIVITIES = ["idle", "code", "boba"] as const;
type Activity = (typeof ACTIVITIES)[number];

export const TIMING = {
  /** How long one hop across the stage takes. */
  moveMs: 900,
  /** How long the blob lingers on an activity before moving again. */
  restMinMs: 2600,
  restMaxMs: 5200,
  /** No hover for this long and the blob nods off. */
  sleepAfterMs: 26_000,
  /** Clicks within this window that trip the sulk. */
  rageWindowMs: 3000,
  rageClicks: 4,
  rageMs: 3000,
  /** Chance a "boba" stop comes with an actual request. */
  bobaAskChance: 0.45,
  /** An unanswered request gives up rather than freezing the blob forever. */
  askTimeoutMs: 14_000,
} as const;

export interface BlobBrain {
  state: BlobState;
  /** true while hopping to a new spot — drives the hop animation. */
  moving: boolean;
  /** Horizontal position as a 0–1 fraction of the stage width. */
  x: number;
  facingLeft: boolean;
  /** Set when the blob is actually asking for boba (needs an answer). */
  asking: boolean;
  answerBoba: (yes: boolean) => void;
  onPoke: () => void;
  onHover: () => void;
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];

/**
 * Runs the blob's day: it wanders the stage, stops to idle / type / drink boba,
 * falls asleep when ignored, and sulks if you poke it too much.
 *
 * Every timer is cleared through one ref so a state change can pre-empt the
 * schedule without leaking a pending step.
 */
export function useBlobBrain(enabled: boolean): BlobBrain {
  const [state, setState] = useState<BlobState>("idle");
  const [moving, setMoving] = useState(false);
  const [x, setX] = useState(0.08);
  const [facingLeft, setFacingLeft] = useState(false);
  const [asking, setAsking] = useState(false);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastHover = useRef(Date.now());
  const rage = useRef({ count: 0, since: 0 });
  // Held while the blob is sulking or waiting on a boba answer, so the wander
  // loop does not walk away mid-scene.
  const frozen = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }, []);

  const after = useCallback(
    (ms: number, fn: () => void) => {
      clear();
      timer.current = setTimeout(fn, ms);
    },
    [clear],
  );

  /** One wander cycle: hop somewhere, then settle into an activity. */
  const step = useCallback(() => {
    if (frozen.current) return;

    if (Date.now() - lastHover.current > TIMING.sleepAfterMs) {
      setMoving(false);
      setState("sleep");
      playSfx("snore", 0.8);
      after(6000, step);
      return;
    }

    setMoving(true);
    setState("idle");
    setX((prev) => {
      const next = Math.min(0.92, Math.max(0, prev + rand(-0.45, 0.45)));
      setFacingLeft(next < prev);
      return next;
    });
    playSfx("hop", 0.45);

    after(TIMING.moveMs, () => {
      if (frozen.current) return;
      setMoving(false);

      const activity: Activity = pick(ACTIVITIES);
      setState(activity);

      if (activity === "boba" && Math.random() < TIMING.bobaAskChance) {
        // Hold here until the visitor answers — or until they clearly won't.
        frozen.current = true;
        setAsking(true);
        playSfx("slurp", 0.7);
        after(TIMING.askTimeoutMs, () => {
          setAsking(false);
          frozen.current = false;
          step();
        });
        return;
      }

      playSfx(activity === "code" ? "blip" : activity === "boba" ? "slurp" : "squish", 0.5);
      after(rand(TIMING.restMinMs, TIMING.restMaxMs), step);
    });
  }, [after]);

  const answerBoba = useCallback(
    (yes: boolean) => {
      setAsking(false);
      frozen.current = false;
      armAudio();

      if (yes) {
        setState("boba");
        playSfx("success");
        after(3200, step);
      } else {
        setState("angry");
        playSfx("angry");
        after(TIMING.rageMs, step);
      }
    },
    [after, step],
  );

  const onHover = useCallback(() => {
    lastHover.current = Date.now();
    if (frozen.current) return;
    if (state === "sleep") {
      // Waking up: a squish, then straight back to wandering.
      setState("idle");
      playSfx("squish", 0.8);
      after(600, step);
    }
  }, [after, state, step]);

  const onPoke = useCallback(() => {
    armAudio();
    lastHover.current = Date.now();
    if (asking) return;

    // Count pokes inside a rolling window. Mutated in place rather than
    // reassigned, so a re-render mid-burst cannot drop the tally.
    const now = Date.now();
    if (now - rage.current.since > TIMING.rageWindowMs) {
      rage.current.since = now;
      rage.current.count = 0;
    }
    rage.current.count += 1;

    if (rage.current.count >= TIMING.rageClicks) {
      rage.current.count = 0;
      rage.current.since = now;
      frozen.current = true;
      setMoving(false);
      setState("angry");
      playSfx("angry");
      after(TIMING.rageMs, () => {
        frozen.current = false;
        step();
      });
      return;
    }

    if (frozen.current) return;
    setMoving(false);
    setState("idle");
    playSfx("squish", 0.8);
    after(1400, step);
  }, [after, asking, step]);

  useEffect(() => {
    if (!enabled) {
      clear();
      setState("idle");
      setMoving(false);
      return;
    }
    after(1200, step);
    return clear;
  }, [after, clear, enabled, step]);

  return { state, moving, x, facingLeft, asking, answerBoba, onPoke, onHover };
}
