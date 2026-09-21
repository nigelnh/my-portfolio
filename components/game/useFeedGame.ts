"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { armAudio, playSfx } from "@/lib/sfx";
import { FOODS, type FoodType } from "./sprites";

export type Phase = "intro" | "playing" | "won" | "lost";
/** Which blob pose the arena actor wears right now. */
export type Mood = "idle" | "angry" | "boba" | "sleep";

export const ROUND_SECONDS = 30;
export const WIN_SCORE = 10;

/** Arena actor, in arena pixels. Matches `.fg-blob` in globals.css. */
export const BLOB = { w: 76, h: 62, floor: 12 };

/** One hop: crouch, travel, land. Same cadence as the desk blob at 1.4x. */
const HOP = { duration: 420, rest: 130, step: 38 };
/** How far the blob commits to travelling before it turns around. */
const STRIDE = { min: 160, spread: 200, arrived: 18 };

const GRAVITY = 280;
const DROP_SPEED = 120;
const DROP_SPREAD = 40;
/** Clicks below this fraction of the arena are too low to be a fair drop. */
const DROP_ZONE = 0.62;

/**
 * Base odds for a dropped item.
 *
 * Coffee is deliberately as common as a treat: the blob only nets points when
 * you aim, so a full arena of random drops is close to break-even.
 */
const BASE = { boba: 30, donut: 35, coffee: 35 };

/**
 * Anti-spam ramp. Each drop that follows within `window` ms shifts `step`
 * percentage points from the treats onto the coffee, up to `max` — hammering
 * the arena turns the rain bitter. Spacing drops out again walks it back.
 */
const SPAM = { window: 420, step: 8, max: 32, cool: 900 };

function pickFood(spam: number): FoodType {
  const coffee = BASE.coffee + spam;
  const treats = 100 - coffee;
  const boba = (treats * BASE.boba) / (BASE.boba + BASE.donut);
  const roll = Math.random() * 100;
  if (roll < boba) return "boba";
  if (roll < treats) return "donut";
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

/** Why a drop was refused, so the arena can say something useful. */
export type DropResult = "dropped" | "too-low";

export function useFeedGame(arenaRef: React.RefObject<HTMLDivElement | null>) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [items, setItems] = useState<Item[]>([]);
  const [floats, setFloats] = useState<Float[]>([]);
  const [blob, setBlob] = useState({ x: 140, facingLeft: false, hopping: false, hopId: 0 });
  const [mood, setMood] = useState<Mood>("idle");

  const active = useRef(false);
  const scoreRef = useRef(0);
  const bodies = useRef(new Map<number, Body>());
  const binds = useRef(new Map<number, (el: HTMLElement | null) => void>());
  const nextId = useRef(1);
  const target = useRef(140);
  const posX = useRef(140);
  const lastDrop = useRef(0);
  const spam = useRef(0);
  const frame = useRef<number | null>(null);
  const clock = useRef<ReturnType<typeof setInterval> | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  /** Pick a destination at least `STRIDE.min` away, kept inside the arena. */
  const pickTarget = useCallback(() => {
    const arena = arenaRef.current;
    if (!arena) return;
    const maxX = arena.clientWidth - BLOB.w - 15;
    const from = posX.current;
    // Scale the stride to the arena so a narrow one does not turn every hop
    // into an edge-to-edge sprint.
    const span = Math.max(120, maxX - 15);
    const distance =
      Math.min(STRIDE.min, span * 0.45) + Math.random() * Math.min(STRIDE.spread, span * 0.4);
    let dir = Math.random() < 0.5 ? -1 : 1;
    if (from < 80) dir = 1;
    else if (from > maxX - 80) dir = -1;
    target.current = Math.max(15, Math.min(maxX, from + dir * distance));
  }, [arenaRef]);

  const step = useCallback(() => {
    if (!active.current) return;

    const dx = target.current - posX.current;
    const dist = Math.abs(dx);

    if (dist < STRIDE.arrived) {
      setBlob((b) => ({ ...b, hopping: false }));
      later(() => {
        if (!active.current) return;
        pickTarget();
        step();
      }, 340 + Math.random() * 320);
      return;
    }

    const dir = dx > 0 ? 1 : -1;
    posX.current += dir * Math.min(dist, HOP.step);
    setBlob((b) => ({
      x: posX.current,
      facingLeft: dir < 0,
      hopping: true,
      hopId: b.hopId + 1,
    }));

    later(() => playSfx("hopTakeoff", 0.4), Math.round(HOP.duration * 0.2));
    later(() => playSfx("hopLand", 0.4), Math.round(HOP.duration * 0.85));
    later(() => setBlob((b) => ({ ...b, hopping: false })), HOP.duration);
    later(step, HOP.duration + HOP.rest);
  }, [later, pickTarget]);

  const stop = useCallback(() => {
    active.current = false;
    clearTimers();
    if (clock.current) clearInterval(clock.current);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    clock.current = null;
    frame.current = null;
    bodies.current.clear();
    binds.current.clear();
    setItems([]);
    setFloats([]);
    setBlob((b) => ({ ...b, hopping: false }));
  }, [clearTimers]);

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

      // Read the live rect so a food still counts when the blob is mid-hop.
      const hit = {
        left: blobRect.left - arenaRect.left + 8,
        right: blobRect.left - arenaRect.left + BLOB.w - 8,
        top: blobRect.top - arenaRect.top + 6,
        bottom: blobRect.top - arenaRect.top + BLOB.h,
      };

      const caught: number[] = [];
      const missed: number[] = [];

      bodies.current.forEach((body, id) => {
        body.vy += GRAVITY * dt;
        body.y += body.vy * dt;
        const food = FOODS[body.type];
        if (body.el) body.el.style.transform = `translate(${Math.round(body.x)}px, ${Math.round(body.y)}px)`;

        const overlaps =
          body.x + food.w >= hit.left &&
          body.x <= hit.right &&
          body.y + food.h >= hit.top &&
          body.y <= hit.bottom;

        if (overlaps) {
          caught.push(id);
          const points = food.points;
          scoreRef.current += points;
          setScore(scoreRef.current);
          setFloats((f) => [
            ...f,
            {
              id,
              x: body.x,
              y: body.y,
              text: points > 0 ? `+${points}` : `${points}`,
              tint: food.tint,
            },
          ]);
          later(() => setFloats((f) => f.filter((x) => x.id !== id)), 750);

          if (points > 0) {
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

        if (body.y >= arena.clientHeight - 24) missed.push(id);
      });

      const gone = [...caught, ...missed];
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
    spam.current = 0;
    lastDrop.current = 0;
    posX.current = 140;

    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setMood("idle");
    setPhase("playing");
    setBlob({ x: 140, facingLeft: false, hopping: false, hopId: 0 });

    pickTarget();
    step();

    clock.current = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);

    const t0 = performance.now();
    frame.current = requestAnimationFrame((t) => loop(t, t0));
    playSfx("success");
  }, [loop, pickTarget, step, stop]);


  /** Drop an item at the click, unless the click was too close to the floor. */
  const drop = useCallback(
    (clientX: number, clientY: number): DropResult => {
      const arena = arenaRef.current;
      if (!arena || !active.current) return "too-low";
      const rect = arena.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (y > arena.clientHeight * DROP_ZONE) return "too-low";

      const now = performance.now();
      const gap = now - lastDrop.current;
      if (gap < SPAM.window) spam.current = Math.min(SPAM.max, spam.current + SPAM.step);
      else if (gap > SPAM.cool) spam.current = 0;
      else spam.current = Math.max(0, spam.current - SPAM.step);
      lastDrop.current = now;

      const type = pickFood(spam.current);
      const id = nextId.current++;
      bodies.current.set(id, {
        x: Math.max(10, Math.min(arena.clientWidth - FOODS[type].w - 10, x - 15)),
        y: Math.max(0, y - 10),
        vy: DROP_SPEED + Math.random() * DROP_SPREAD,
        type,
        el: null,
      });
      setItems((list) => [...list, { id, type }]);
      playSfx("drop", 0.7);
      return "dropped";
    },
    [arenaRef],
  );

  /**
   * Called by each food element so the loop can move it by writing `transform`
   * directly — the falling items never go through React's render path.
   * The callback is cached per id, or every re-render would detach the node.
   */
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

  useEffect(() => stop, [stop]);

  return {
    phase,
    score,
    timeLeft,
    items,
    floats,
    blob,
    mood,
    hopDuration: HOP.duration,
    start,
    drop,
    bindItem,
  };
}
