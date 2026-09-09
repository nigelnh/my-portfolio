"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { armAudio, playSfx } from "@/lib/sfx";
import type { BlobState } from "./sprites";

/**
 * The blob's Tamagotchi brain, transcribed from the animation studio kit.
 *
 * Four vitals drift every second and decide what the blob does next. The rules
 * are checked in priority order, and each one takes an "action lock" so the
 * blob finishes what it started before the next decision.
 */

/** Hop shape at each speed. The site runs at 1.4x. */
export const HOP = {
  "1": { duration: 520, rest: 280, stepDist: 22 },
  "1.4": { duration: 420, rest: 200, stepDist: 28 },
  "2": { duration: 320, rest: 140, stepDist: 34 },
} as const;

export const SPEED: keyof typeof HOP = "1.4";
export const HOP_PARAMS = HOP[SPEED];

export const RULES = {
  tickMs: 1000,
  /** Rule 1 — out of energy. */
  sleepAtEnergy: 15,
  sleepLockMs: 9000,
  wakeAtEnergy: 95,
  wakeLockMs: 3000,
  wanderAfterWakeMs: 1500,
  /** Rule 2 — craving boba. */
  bobaAtNeed: 80,
  bobaLockMs: 6500,
  /** Rule 3 — itching to code. */
  codeAtUrge: 80,
  codeNeedsEnergy: 35,
  codeLockMs: 7000,
  /** Rule 4 — chill wander. */
  restLockMs: 3500,
  startWanderChance: 0.65,
  startWanderLockMs: 5000,
  stopWanderChance: 0.35,
  stopWanderLockMs: 4000,
  /** Poking. */
  pokeWindowMs: 2600,
  pokeRageCount: 3,
  rageLockMs: 4500,
  /** Boba request (kept from the earlier brief; the kit itself just drinks). */
  askTimeoutMs: 14_000,
} as const;

export interface Vitals {
  energy: number;
  bobaNeed: number;
  codeUrge: number;
  anger: number;
}

const START: Vitals = { energy: 85, bobaNeed: 25, codeUrge: 40, anger: 0 };

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export type MoveMode = "idle" | "wander";

export interface BlobBrain {
  state: BlobState;
  moveMode: MoveMode;
  /** Position within the arena, as 0-1 fractions of its width/height. */
  x: number;
  y: number;
  facingLeft: boolean;
  /** Bumped once per hop so the single-hop animation can restart. */
  hopId: number;
  hopping: boolean;
  asking: boolean;
  vitals: Vitals;
  answerBoba: (yes: boolean) => void;
  onPoke: () => "poke" | "rage" | "woken";
  onHover: () => void;
}

export function useBlobBrain(enabled: boolean): BlobBrain {
  const [state, setState] = useState<BlobState>("idle");
  const [moveMode, setMoveMode] = useState<MoveMode>("idle");
  const [pos, setPos] = useState({ x: 0.12, y: 0.72 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [hop, setHop] = useState({ id: 0, active: false });
  const [asking, setAsking] = useState(false);
  const [vitals, setVitals] = useState<Vitals>(START);

  // Mirrors of the reactive values the loops read, so neither loop has to be
  // rebuilt when they change.
  const vitalsRef = useRef<Vitals>({ ...START });
  const stateRef = useRef<BlobState>("idle");
  const modeRef = useRef<MoveMode>("idle");
  const posRef = useRef(pos);
  const askingRef = useRef(false);
  const lockUntil = useRef(0);
  const pokes = useRef<number[]>([]);
  const dest = useRef<{ x: number; y: number } | null>(null);
  const askTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hopTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wanderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setBlobState = useCallback((next: BlobState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const setMode = useCallback((next: MoveMode) => {
    modeRef.current = next;
    setMoveMode(next);
  }, []);

  const setAsk = useCallback((next: boolean) => {
    askingRef.current = next;
    setAsking(next);
  }, []);

  const clearHopTimers = useCallback(() => {
    hopTimers.current.forEach(clearTimeout);
    hopTimers.current = [];
    if (wanderTimer.current) clearTimeout(wanderTimer.current);
    wanderTimer.current = null;
  }, []);

  /* ---------------------------------------------------------------- wander */

  const pickDestination = useCallback(() => {
    dest.current = { x: 0.04 + Math.random() * 0.92, y: 0.06 + Math.random() * 0.88 };
  }, []);

  /**
   * One hop toward the destination, with the takeoff and landing sounds fired
   * at 20% and 85% of the jump so they line up with the squash and stretch.
   */
  const stepHop = useCallback(() => {
    if (modeRef.current !== "wander") return;
    if (!dest.current) pickDestination();
    const target = dest.current;
    if (!target) return;

    const dx = target.x - posRef.current.x;
    const dy = target.y - posRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 0.05) {
      // Arrived: stand and look around before choosing somewhere new.
      setHop((h) => ({ id: h.id, active: false }));
      const pause = Math.round((1000 + Math.random() * 1200) / Number(SPEED));
      wanderTimer.current = setTimeout(() => {
        if (modeRef.current !== "wander") return;
        pickDestination();
        stepHop();
      }, pause);
      return;
    }

    // stepDist is in the kit's pixels; ARENA_SPAN converts it to a fraction of
    // a typical arena so the 1x / 1.4x / 2x feel carries over.
    const ARENA_SPAN = 340;
    const ratio = Math.min(1, HOP_PARAMS.stepDist / ARENA_SPAN / dist);
    const next = { x: posRef.current.x + dx * ratio, y: posRef.current.y + dy * ratio };
    posRef.current = next;
    setPos(next);
    if (Math.abs(dx) > 0.008) setFacingLeft(dx < 0);
    setHop((h) => ({ id: h.id + 1, active: true }));

    hopTimers.current = [
      setTimeout(
        () => {
          if (modeRef.current === "wander") playSfx("hopTakeoff", 0.7);
        },
        Math.round(HOP_PARAMS.duration * 0.2),
      ),
      setTimeout(
        () => {
          if (modeRef.current === "wander") playSfx("hopLand", 0.7);
        },
        Math.round(HOP_PARAMS.duration * 0.85),
      ),
      setTimeout(() => {
        setHop((h) => ({ id: h.id, active: false }));
      }, HOP_PARAMS.duration),
    ];

    wanderTimer.current = setTimeout(() => {
      if (modeRef.current === "wander") stepHop();
    }, HOP_PARAMS.duration + HOP_PARAMS.rest);
  }, [pickDestination]);

  const startWander = useCallback(() => {
    clearHopTimers();
    setMode("wander");
    pickDestination();
    stepHop();
  }, [clearHopTimers, pickDestination, setMode, stepHop]);

  const stopWander = useCallback(() => {
    clearHopTimers();
    setMode("idle");
    setHop((h) => ({ id: h.id, active: false }));
  }, [clearHopTimers, setMode]);

  /* -------------------------------------------------------------- boba ask */

  const clearAsk = useCallback(() => {
    if (askTimer.current) clearTimeout(askTimer.current);
    askTimer.current = null;
  }, []);

  const answerBoba = useCallback(
    (yes: boolean) => {
      clearAsk();
      setAsk(false);
      armAudio();
      const now = Date.now();

      if (yes) {
        setBlobState("boba");
        playSfx("success");
        lockUntil.current = now + RULES.bobaLockMs;
      } else {
        setBlobState("angry");
        playSfx("angry");
        vitalsRef.current.anger = 100;
        // Refused: the craving stays, so it will ask again before long.
        lockUntil.current = now + RULES.rageLockMs;
      }
    },
    [clearAsk, setAsk, setBlobState],
  );

  /* -------------------------------------------------------------- AI cycle */

  const runCycle = useCallback(() => {
    const now = Date.now();
    const v = vitalsRef.current;
    const s = stateRef.current;

    // Vitals drift, at the kit's per-state rates.
    if (s === "sleep") {
      v.energy = clamp(v.energy + 8);
      v.bobaNeed = clamp(v.bobaNeed + 0.5);
      v.anger = 0;
    } else if (s === "boba") {
      v.bobaNeed = clamp(v.bobaNeed - 18);
      v.energy = clamp(v.energy + 2);
    } else if (s === "code") {
      v.codeUrge = clamp(v.codeUrge - 12);
      v.energy = clamp(v.energy - 2);
      v.bobaNeed = clamp(v.bobaNeed + 2);
    } else {
      v.energy = clamp(v.energy - (modeRef.current === "wander" ? 2.5 : 1));
      v.bobaNeed = clamp(v.bobaNeed + 2.2);
      v.codeUrge = clamp(v.codeUrge + 1.8);
    }
    if (v.anger > 0 && s !== "angry") v.anger = clamp(v.anger - 15);
    setVitals({ ...v });

    if (askingRef.current || now < lockUntil.current) return;

    // Rule 1 - no energy left: sleep until recharged.
    if (v.energy <= RULES.sleepAtEnergy && s !== "sleep") {
      stopWander();
      setBlobState("sleep");
      playSfx("snore", 0.8);
      lockUntil.current = now + RULES.sleepLockMs;
      return;
    }
    if (s === "sleep") {
      if (v.energy >= RULES.wakeAtEnergy) {
        setBlobState("idle");
        lockUntil.current = now + RULES.wakeLockMs;
        setTimeout(() => {
          if (stateRef.current === "idle" && modeRef.current !== "wander") startWander();
        }, RULES.wanderAfterWakeMs);
      }
      return;
    }

    // Rule 2 - craving boba. The blob asks first rather than helping itself.
    if (v.bobaNeed >= RULES.bobaAtNeed && s !== "boba" && s !== "angry") {
      stopWander();
      setBlobState("boba");
      setAsk(true);
      playSfx("slurp", 0.7);
      askTimer.current = setTimeout(() => {
        setAsk(false);
        // Nobody answered, so it settles for a sip rather than staying stuck.
        vitalsRef.current.bobaNeed = clamp(vitalsRef.current.bobaNeed - 25);
        lockUntil.current = Date.now() + 500;
      }, RULES.askTimeoutMs);
      return;
    }

    // Rule 3 - inspired, and awake enough to act on it.
    if (
      v.codeUrge >= RULES.codeAtUrge &&
      v.energy > RULES.codeNeedsEnergy &&
      s !== "code" &&
      s !== "angry"
    ) {
      stopWander();
      setBlobState("code");
      playSfx("blip", 0.6);
      lockUntil.current = now + RULES.codeLockMs;
      return;
    }

    // Rule 4 - nothing urgent: drift between standing around and wandering.
    if (s !== "idle") {
      setBlobState("idle");
      lockUntil.current = now + RULES.restLockMs;
      return;
    }
    if (modeRef.current === "idle" && Math.random() < RULES.startWanderChance) {
      startWander();
      lockUntil.current = now + RULES.startWanderLockMs;
    } else if (modeRef.current === "wander" && Math.random() < RULES.stopWanderChance) {
      stopWander();
      lockUntil.current = now + RULES.stopWanderLockMs;
    }
  }, [setAsk, setBlobState, startWander, stopWander]);

  /* --------------------------------------------------------- interactions */

  const onPoke = useCallback((): "poke" | "rage" | "woken" => {
    armAudio();
    const now = Date.now();
    const v = vitalsRef.current;

    // Poked awake - grumpy about it.
    if (stateRef.current === "sleep") {
      pokes.current = [];
      v.anger = 100;
      stopWander();
      setBlobState("angry");
      playSfx("angry");
      lockUntil.current = now + RULES.rageLockMs;
      return "woken";
    }

    pokes.current = [...pokes.current, now].filter((t) => now - t < RULES.pokeWindowMs);

    if (pokes.current.length >= RULES.pokeRageCount) {
      pokes.current = [];
      v.anger = 100;
      stopWander();
      setBlobState("angry");
      playSfx("angry");
      lockUntil.current = now + RULES.rageLockMs;
      return "rage";
    }

    // A friendly poke perks the blob up and gives it ideas.
    playSfx("squish", 0.9);
    v.energy = clamp(v.energy + 4);
    v.codeUrge = clamp(v.codeUrge + 6);
    setVitals({ ...v });
    return "poke";
  }, [setBlobState, stopWander]);

  const onHover = useCallback(() => {
    armAudio();
  }, []);

  /* ----------------------------------------------------------- lifecycle */

  useEffect(() => {
    if (!enabled) {
      clearHopTimers();
      clearAsk();
      setMode("idle");
      setBlobState("idle");
      return;
    }
    const id = setInterval(runCycle, RULES.tickMs);
    return () => {
      clearInterval(id);
      clearHopTimers();
      clearAsk();
    };
  }, [clearAsk, clearHopTimers, enabled, runCycle, setBlobState, setMode]);

  return {
    state,
    moveMode,
    x: pos.x,
    y: pos.y,
    facingLeft,
    hopId: hop.id,
    hopping: hop.active,
    asking,
    vitals,
    answerBoba,
    onPoke,
    onHover,
  };
}
