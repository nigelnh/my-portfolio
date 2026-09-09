"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { armAudio, playSfx } from "@/lib/sfx";
import type { BlobState } from "./sprites";

/**
 * The blob's Tamagotchi brain, transcribed from the animation studio kit.
 *
 * Four vitals drift every second and decide what the blob does next. The rules
 * are checked in priority order, and each takes an "action lock" so the blob
 * finishes what it started before the next decision.
 *
 * Positions are pixels inside whatever arena the caller measures — the laptop
 * block normally, the whole viewport in screen-pet mode — so the kit's step
 * distances carry over unchanged.
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
  /** Rule 1 - out of energy. */
  sleepAtEnergy: 15,
  sleepLockMs: 9000,
  wakeAtEnergy: 95,
  wakeLockMs: 3000,
  wanderAfterWakeMs: 1500,
  /** Rule 2 - craving boba. */
  bobaAtNeed: 80,
  bobaLockMs: 6500,
  /** Rule 3 - itching to code. */
  codeAtUrge: 80,
  codeNeedsEnergy: 35,
  codeLockMs: 7000,
  /** Rule 4 - chill wander. */
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
  /** Cursor chasing. */
  pointerIdleMs: 2500,
  /** Close enough to the cursor to stop hopping, per the kit. */
  catchDistPx: 28,
  /** The kit aims this far up-left of the pointer so the blob's face lands on it. */
  pointerOffsetPx: 45,
  edgePad: 8,
} as const;

export interface Vitals {
  energy: number;
  bobaNeed: number;
  codeUrge: number;
  anger: number;
}

const START: Vitals = { energy: 85, bobaNeed: 25, codeUrge: 40, anger: 0 };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp100 = (v: number) => clamp(v, 0, 100);

export type MoveMode = "idle" | "wander" | "follow";

export interface Arena {
  w: number;
  h: number;
}

export interface Pointer {
  x: number;
  y: number;
  at: number;
}

export interface BlobBrainOptions {
  enabled: boolean;
  /** Live arena size; read on every hop so a resize is picked up. */
  arena: React.RefObject<Arena>;
  /** Live pointer position in arena coordinates, or null when unavailable. */
  pointer: React.RefObject<Pointer | null>;
  /** Whether the blob is allowed to chase the cursor. */
  chase: boolean;
}

export interface BlobBrain {
  state: BlobState;
  moveMode: MoveMode;
  /** Position in arena pixels. */
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
  /** Drop the blob at a spot in arena pixels (used when the arena changes). */
  placeAt: (x: number, y: number) => void;
  /** True the first time the blob reaches the cursor after a chase. */
  caughtAt: number;
}

export const BLOB_SIZE = { w: 72, h: 59 };

export function useBlobBrain({ enabled, arena, pointer, chase }: BlobBrainOptions): BlobBrain {
  const [state, setState] = useState<BlobState>("idle");
  const [moveMode, setMoveMode] = useState<MoveMode>("idle");
  const [pos, setPos] = useState({ x: 40, y: 200 });
  const [facingLeft, setFacingLeft] = useState(false);
  const [hop, setHop] = useState({ id: 0, active: false });
  const [asking, setAsking] = useState(false);
  const [vitals, setVitals] = useState<Vitals>(START);
  const [caughtAt, setCaughtAt] = useState(0);

  // Mirrors of the reactive values the loops read, so neither loop has to be
  // rebuilt when they change.
  const vitalsRef = useRef<Vitals>({ ...START });
  const stateRef = useRef<BlobState>("idle");
  const modeRef = useRef<MoveMode>("idle");
  const posRef = useRef(pos);
  const askingRef = useRef(false);
  const chaseRef = useRef(chase);
  const lockUntil = useRef(0);
  const pokes = useRef<number[]>([]);
  const dest = useRef<{ x: number; y: number } | null>(null);
  const wasChasing = useRef(false);
  const askTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hopTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const wanderTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  chaseRef.current = chase;

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

  const bounds = useCallback(() => {
    const { w, h } = arena.current;
    const pad = RULES.edgePad;
    return {
      minX: pad,
      maxX: Math.max(pad, w - BLOB_SIZE.w - pad),
      minY: pad,
      maxY: Math.max(pad, h - BLOB_SIZE.h - pad),
    };
  }, [arena]);

  const placeAt = useCallback(
    (x: number, y: number) => {
      const b = bounds();
      const next = { x: clamp(x, b.minX, b.maxX), y: clamp(y, b.minY, b.maxY) };
      posRef.current = next;
      setPos(next);
      dest.current = null;
    },
    [bounds],
  );

  /* ---------------------------------------------------------------- wander */

  const pickDestination = useCallback(() => {
    const b = bounds();
    dest.current = {
      x: b.minX + Math.random() * (b.maxX - b.minX),
      y: b.minY + Math.random() * (b.maxY - b.minY),
    };
  }, [bounds]);

  /** The cursor when it is fresh and chasing is on, otherwise the wander goal. */
  const currentTarget = useCallback(() => {
    const p = pointer.current;
    if (chaseRef.current && p && Date.now() - p.at < RULES.pointerIdleMs) {
      return {
        x: p.x - RULES.pointerOffsetPx,
        y: p.y - RULES.pointerOffsetPx,
        chasing: true,
      };
    }
    if (!dest.current) pickDestination();
    return { ...dest.current!, chasing: false };
  }, [pickDestination, pointer]);

  /**
   * One hop toward the target, with the takeoff and landing sounds fired at 20%
   * and 85% of the jump so they line up with the squash and the stretch.
   */
  const stepHop = useCallback(() => {
    if (modeRef.current === "idle") return;

    const target = currentTarget();
    setMode(target.chasing ? "follow" : "wander");

    const b = bounds();
    const tx = clamp(target.x, b.minX, b.maxX);
    const ty = clamp(target.y, b.minY, b.maxY);
    const dx = tx - posRef.current.x;
    const dy = ty - posRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (Math.abs(dx) > 8) setFacingLeft(dx < 0);

    if (target.chasing) {
      // Caught up: idle next to the cursor and poll for it to move again.
      if (dist <= RULES.catchDistPx) {
        setHop((h) => ({ id: h.id, active: false }));
        if (wasChasing.current) {
          wasChasing.current = false;
          if (Math.random() < 0.25) setCaughtAt(Date.now());
        }
        wanderTimer.current = setTimeout(stepHop, 120);
        return;
      }
      wasChasing.current = true;
    } else if (dist < RULES.catchDistPx) {
      // Arrived: stand and look around before choosing somewhere new.
      setHop((h) => ({ id: h.id, active: false }));
      const pause = Math.round((1000 + Math.random() * 1200) / Number(SPEED));
      wanderTimer.current = setTimeout(() => {
        pickDestination();
        stepHop();
      }, pause);
      return;
    }

    const hopDist = Math.min(dist, HOP_PARAMS.stepDist);
    const ratio = hopDist / dist;
    const next = {
      x: clamp(posRef.current.x + dx * ratio, b.minX, b.maxX),
      y: clamp(posRef.current.y + dy * ratio, b.minY, b.maxY),
    };
    posRef.current = next;
    setPos(next);
    setHop((h) => ({ id: h.id + 1, active: true }));

    hopTimers.current = [
      setTimeout(
        () => {
          if (modeRef.current !== "idle") playSfx("hopTakeoff", 0.7);
        },
        Math.round(HOP_PARAMS.duration * 0.2),
      ),
      setTimeout(
        () => {
          if (modeRef.current !== "idle") playSfx("hopLand", 0.7);
        },
        Math.round(HOP_PARAMS.duration * 0.85),
      ),
      setTimeout(() => {
        setHop((h) => ({ id: h.id, active: false }));
      }, HOP_PARAMS.duration),
    ];

    wanderTimer.current = setTimeout(stepHop, HOP_PARAMS.duration + HOP_PARAMS.rest);
  }, [bounds, currentTarget, pickDestination, setMode]);

  const startWander = useCallback(() => {
    clearHopTimers();
    setMode("wander");
    pickDestination();
    stepHop();
  }, [clearHopTimers, pickDestination, setMode, stepHop]);

  const stopWander = useCallback(() => {
    clearHopTimers();
    setMode("idle");
    wasChasing.current = false;
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
      v.energy = clamp100(v.energy + 8);
      v.bobaNeed = clamp100(v.bobaNeed + 0.5);
      v.anger = 0;
    } else if (s === "boba") {
      v.bobaNeed = clamp100(v.bobaNeed - 18);
      v.energy = clamp100(v.energy + 2);
    } else if (s === "code") {
      v.codeUrge = clamp100(v.codeUrge - 12);
      v.energy = clamp100(v.energy - 2);
      v.bobaNeed = clamp100(v.bobaNeed + 2);
    } else {
      v.energy = clamp100(v.energy - (modeRef.current === "idle" ? 1 : 2.5));
      v.bobaNeed = clamp100(v.bobaNeed + 2.2);
      v.codeUrge = clamp100(v.codeUrge + 1.8);
    }
    if (v.anger > 0 && s !== "angry") v.anger = clamp100(v.anger - 15);
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
          if (stateRef.current === "idle" && modeRef.current === "idle") startWander();
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
        vitalsRef.current.bobaNeed = clamp100(vitalsRef.current.bobaNeed - 25);
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
    // Skipped while chasing the cursor, which the visitor is driving.
    if (s !== "idle") {
      setBlobState("idle");
      lockUntil.current = now + RULES.restLockMs;
      return;
    }
    if (modeRef.current === "follow") return;

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
    v.energy = clamp100(v.energy + 4);
    v.codeUrge = clamp100(v.codeUrge + 6);
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

  // A fresh cursor should pull the blob out of standing still.
  useEffect(() => {
    if (!enabled || !chase) return;
    const id = setInterval(() => {
      if (modeRef.current !== "idle") return;
      if (askingRef.current || Date.now() < lockUntil.current) return;
      const p = pointer.current;
      if (p && Date.now() - p.at < RULES.pointerIdleMs) {
        clearHopTimers();
        setMode("follow");
        stepHop();
      }
    }, 300);
    return () => clearInterval(id);
  }, [chase, clearHopTimers, enabled, pointer, setMode, stepHop]);

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
    placeAt,
    caughtAt,
  };
}
