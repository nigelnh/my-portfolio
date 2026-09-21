"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { armAudio, playSfx } from "@/lib/sfx";
import { FOODS, type FoodType } from "./sprites";

export type Phase = "intro" | "playing" | "won" | "lost";
/** Which blob pose the arena actor wears right now. */
export type Mood = "idle" | "angry" | "boba" | "sleep";

export const ROUND_SECONDS = 60;
export const WIN_SCORE = 100;

/** Arena actor, in arena pixels. Matches `.fg-blob` in globals.css. */
export const BLOB = { w: 76, h: 62, floor: 12 };

const GRAVITY = 300;
const DROP_SPEED = 130;
const DROP_SPREAD = 60;

/**
 * How often an item falls. The rain is what makes the target reachable: a 60s
 * round drops roughly 175 items, and a player who takes every treat and dodges
 * every coffee tops out near 175 points. WIN_SCORE of 100 therefore asks for
 * about 60% of perfect, which leaves room to misjudge a few.
 */
const SPAWN = { first: 500, every: 340, jitter: 120 };

/** Boba is worth double, so it stays the rarest of the three. */
const WEIGHTS = { boba: 32, donut: 35, coffee: 33 };

function pickFood(): FoodType {
  const roll = Math.random() * 100;
  if (roll < WEIGHTS.boba) return "boba";
  if (roll < WEIGHTS.boba + WEIGHTS.donut) return "donut";
  return "coffee";
}

interface Body {
  x: number;
  y: number;
  vy: number;
  type: FoodType;
  el: HTMLElement | null;
}

export interface Item {
  id: number;
  type: FoodType;
}

export interface Float {
  id: number;
  x: number;
  y: number;
  text: string;
  tint: string;
}

export function useFeedGame(arenaRef: React.RefObject<HTMLDivElement | null>) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [items, setItems] = useState<Item[]>([]);
  const [floats, setFloats] = useState<Float[]>([]);
  const [blobX, setBlobX] = useState(140);
  const [held, setHeld] = useState(false);
  const [landing, setLanding] = useState(0);
  const [mood, setMood] = useState<Mood>("idle");

  const active = useRef(false);
  const scoreRef = useRef(0);
  const posX = useRef(140);
  const bodies = useRef(new Map<number, Body>());
  const binds = useRef(new Map<number, (el: HTMLElement | null) => void>());
  const nextId = useRef(1);
  const frame = useRef<number | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const spawner = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const drag = useRef<{ pointerId: number; grabDx: number } | null>(null);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  /** Keep the blob inside the arena; it only ever moves along x. */
  const clampX = useCallback(
    (x: number) => {
      const arena = arenaRef.current;
      if (!arena) return x;
      return Math.max(8, Math.min(arena.clientWidth - BLOB.w - 8, x));
    },
    [arenaRef],
  );

  const spawn = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena || !active.current) return;
    const type = pickFood();
    const id = nextId.current++;
    bodies.current.set(id, {
      x: 10 + Math.random() * Math.max(1, arena.clientWidth - FOODS[type].w - 20),
      y: -FOODS[type].h,
      vy: DROP_SPEED + Math.random() * DROP_SPREAD,
      type,
      el: null,
    });
    setItems((list) => [...list, { id, type }]);
    spawner.current = setTimeout(spawn, SPAWN.every + (Math.random() - 0.5) * 2 * SPAWN.jitter);
  }, [arenaRef]);

  const stop = useCallback(() => {
    active.current = false;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (clock.current) clearInterval(clock.current);
    if (spawner.current) clearTimeout(spawner.current);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    clock.current = null;
    spawner.current = null;
    frame.current = null;
    drag.current = null;
    bodies.current.clear();
    binds.current.clear();
    setItems([]);
    setFloats([]);
    setHeld(false);
  }, []);

  const finish = useCallback(() => {
    const won = scoreRef.current >= WIN_SCORE;
    stop();
    setMood(won ? "boba" : "sleep");
    setPhase(won ? "won" : "lost");
    playSfx(won ? "win" : "lose");
  }, [stop]);

  const loop = useCallback(
    (now: number, prev: number) => {
      if (!active.current) return;
      const arena = arenaRef.current;
      const actor = arena?.querySelector<HTMLElement>(".fg-blob");
      if (!arena || !actor) {
        frame.current = requestAnimationFrame((t) => loop(t, now));
        return;
      }

      const dt = Math.min(0.06, (now - prev) / 1000);
      const arenaRect = arena.getBoundingClientRect();
      const blobRect = actor.getBoundingClientRect();

      const hit = {
        left: blobRect.left - arenaRect.left + 8,
        right: blobRect.left - arenaRect.left + BLOB.w - 8,
        top: blobRect.top - arenaRect.top + 6,
        bottom: blobRect.top - arenaRect.top + BLOB.h,
      };

      const gone: number[] = [];

      bodies.current.forEach((body, id) => {
        body.vy += GRAVITY * dt;
        body.y += body.vy * dt;
        const food = FOODS[body.type];
        if (body.el) {
          body.el.style.transform = `translate(${Math.round(body.x)}px, ${Math.round(body.y)}px)`;
        }

        const overlaps =
          body.x + food.w >= hit.left &&
          body.x <= hit.right &&
          body.y + food.h >= hit.top &&
          body.y <= hit.bottom;

        if (overlaps) {
          gone.push(id);
          scoreRef.current += food.points;
          setScore(scoreRef.current);
          setFloats((f) => [
            ...f,
            { id, x: body.x, y: body.y, text: food.points > 0 ? `+${food.points}` : `${food.points}`, tint: food.tint },
          ]);
          later(() => setFloats((f) => f.filter((x) => x.id !== id)), 750);

          if (food.points > 0) {
            playSfx(body.type === "boba" ? "coin" : "bite");
          } else {
            playSfx("ouch");
            setMood("angry");
            later(() => {
              if (active.current) setMood("idle");
            }, 550);
          }
          return;
        }

        if (body.y >= arena.clientHeight) gone.push(id);
      });

      if (gone.length) {
        gone.forEach((id) => {
          bodies.current.delete(id);
          binds.current.delete(id);
        });
        setItems((list) => list.filter((i) => !gone.includes(i.id)));
      }

      frame.current = requestAnimationFrame((t) => loop(t, now));
    },
    [arenaRef, later],
  );

  const start = useCallback(() => {
    stop();
    armAudio();

    active.current = true;
    scoreRef.current = 0;
    const arena = arenaRef.current;
    posX.current = arena ? Math.round(arena.clientWidth / 2 - BLOB.w / 2) : 140;

    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setMood("idle");
    setPhase("playing");
    setBlobX(posX.current);

    clock.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    spawner.current = setTimeout(spawn, SPAWN.first);

    const t0 = performance.now();
    frame.current = requestAnimationFrame((t) => loop(t, t0));
    playSfx("success");
  }, [arenaRef, loop, spawn, stop]);

  /* ------------------------------------------------------------- dragging */

  const onGrab = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (!active.current) return;
      const arena = arenaRef.current;
      if (!arena) return;
      e.preventDefault();
      const rect = arena.getBoundingClientRect();
      // Remember where inside the blob it was grabbed, so it does not jump.
      drag.current = { pointerId: e.pointerId, grabDx: e.clientX - rect.left - posX.current };
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Capture is an optimisation for tracking outside the element; the
        // drag still works through the element's own move handler without it.
      }
      setHeld(true);
      setLanding(0);
      playSfx("hopTakeoff", 0.5);
    },
    [arenaRef],
  );

  const onDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || d.pointerId !== e.pointerId) return;
      const arena = arenaRef.current;
      if (!arena) return;
      const rect = arena.getBoundingClientRect();
      posX.current = clampX(e.clientX - rect.left - d.grabDx);
      setBlobX(posX.current);
    },
    [arenaRef, clampX],
  );

  const onRelease = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    drag.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // The capture may already be gone; nothing to release.
    }
    setHeld(false);
    setLanding((n) => n + 1);
    playSfx("hopLand", 0.5);
  }, []);

  /** Called by each food element so the loop can move it without re-rendering. */
  const bindItem = useCallback((id: number) => {
    const cached = binds.current.get(id);
    if (cached) return cached;
    const bind = (el: HTMLElement | null) => {
      const body = bodies.current.get(id);
      if (!body) return;
      body.el = el;
      if (el) el.style.transform = `translate(${Math.round(body.x)}px, ${Math.round(body.y)}px)`;
    };
    binds.current.set(id, bind);
    return bind;
  }, []);

  // The round is over the moment the clock reaches zero.
  useEffect(() => {
    if (phase === "playing" && timeLeft === 0) finish();
  }, [finish, phase, timeLeft]);

  // A resize can leave the blob outside the arena.
  useEffect(() => {
    const onResize = () => {
      posX.current = clampX(posX.current);
      setBlobX(posX.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [clampX]);

  useEffect(() => stop, [stop]);

  return {
    phase,
    score,
    timeLeft,
    items,
    floats,
    blobX,
    held,
    landing,
    mood,
    start,
    onGrab,
    onDrag,
    onRelease,
    bindItem,
  };
}
