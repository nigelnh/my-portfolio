import type { PointerEvent as ReactPointerEvent, RefObject } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { armAudio, playSfx } from "@/lib/sfx";
import { BLOB, ROUND_SECONDS, WIN_SCORE, useFeedGame } from "./useFeedGame";
import type { FoodType } from "./sprites";

/**
 * Characterization tests for the Feed The Blob game logic (slice S7).
 *
 * Everything is deterministic: fake timers (including requestAnimationFrame
 * and performance.now), a stubbed Math.random that decides which food spawns
 * next, a fake arena whose geometry is set by the test, and a mocked sfx module.
 */

vi.mock("@/lib/sfx", () => ({ armAudio: vi.fn(), playSfx: vi.fn() }));

const ARENA = { w: 300, h: 400 };
const HIT_TOP = 100; // blob rect top (arena px) while it can catch food
const AWAY_TOP = 10_000; // blob rect top while it is out of the way

/** Blob rect top; the test flips it to catch or dodge falling food. */
let blobTop = HIT_TOP;
/** Foods the next spawns will produce, in order; coffee once exhausted. */
let queue: FoodType[] = [];
let calls = 0;
const ROLL: Record<FoodType, number> = { boba: 0, donut: 0.5, coffee: 0.9 };

function makeArena() {
  const arena = document.createElement("div");
  const blob = document.createElement("div");
  blob.className = "fg-blob";
  arena.appendChild(blob);
  Object.defineProperty(arena, "clientWidth", { value: ARENA.w });
  Object.defineProperty(arena, "clientHeight", { value: ARENA.h });
  arena.getBoundingClientRect = () => new DOMRect(0, 0, ARENA.w, ARENA.h);
  blob.getBoundingClientRect = () => new DOMRect(0, blobTop, BLOB.w, BLOB.h);
  return arena;
}

function setup() {
  const arena = makeArena();
  const ref = { current: arena } as RefObject<HTMLDivElement | null>;
  const hook = renderHook(() => useFeedGame(ref));
  const g = () => hook.result.current;
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
  /** Advance in frame-sized steps until `done()` or `maxMs` pass. */
  const advanceUntil = (done: () => boolean, maxMs = 120_000) => {
    for (let spent = 0; spent < maxMs && !done(); spent += 16) advance(16);
  };
  return { hook, g, advance, advanceUntil, arena };
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "performance",
      "Date",
    ],
  });
  blobTop = HIT_TOP;
  queue = [];
  calls = 0;
  // Per spawn the hook draws: food roll, x, fall speed, next-spawn jitter.
  vi.spyOn(Math, "random").mockImplementation(() => {
    const slot = calls++ % 4;
    if (slot === 0) return ROLL[queue.shift() ?? "coffee"];
    return slot === 3 ? 0.5 : 0; // x = left edge (over the blob), min speed, no jitter
  });
  vi.mocked(playSfx).mockClear();
  vi.mocked(armAudio).mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("constants", () => {
  it("round is 60 s and the win score is 100", () => {
    expect(ROUND_SECONDS).toBe(60);
    expect(WIN_SCORE).toBe(100);
  });
});

describe("useFeedGame lifecycle", () => {
  it("starts in the intro with a zeroed, idle state", () => {
    const { g } = setup();
    expect(g()).toMatchObject({
      phase: "intro",
      score: 0,
      timeLeft: 60,
      items: [],
      floats: [],
      blobX: 140,
      held: false,
      mood: "idle",
    });
  });

  it("start() begins the round: playing, centered blob, audio armed, success sfx", () => {
    const { g } = setup();
    act(() => g().start());
    expect(g().phase).toBe("playing");
    expect(g().score).toBe(0);
    expect(g().timeLeft).toBe(60);
    expect(g().blobX).toBe(Math.round(ARENA.w / 2 - BLOB.w / 2)); // 112
    expect(armAudio).toHaveBeenCalledTimes(1);
    expect(playSfx).toHaveBeenCalledWith("success");
  });

  it("the clock ticks once per second and the round is lost at 0 with no points", () => {
    const { g, advance } = setup();
    blobTop = AWAY_TOP;
    act(() => g().start());
    advance(1000);
    expect(g().timeLeft).toBe(59);
    advance(58_000);
    expect(g().timeLeft).toBe(1);
    expect(g().phase).toBe("playing");
    advance(1000);
    expect(g().timeLeft).toBe(0);
    expect(g().phase).toBe("lost");
    expect(g().mood).toBe("sleep");
    expect(g().items).toEqual([]);
    expect(playSfx).toHaveBeenLastCalledWith("lose");
  });

  it("nothing spawns before 500 ms, then the first item appears", () => {
    const { g, advance } = setup();
    act(() => g().start());
    advance(499);
    expect(g().items).toHaveLength(0);
    advance(1);
    expect(g().items).toHaveLength(1);
  });

  it("start() again after a round resets score, clock and phase", () => {
    const { g, advance } = setup();
    blobTop = AWAY_TOP;
    act(() => g().start());
    advance(60_000);
    expect(g().phase).toBe("lost");
    act(() => g().start());
    expect(g()).toMatchObject({ phase: "playing", score: 0, timeLeft: 60, mood: "idle" });
  });

  it("unmounting cancels every timer", () => {
    const { g, hook } = setup();
    act(() => g().start());
    hook.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe("useFeedGame scoring", () => {
  const catchOne = (type: FoodType) => {
    const s = setup();
    queue = [type];
    act(() => s.g().start());
    s.advanceUntil(() => s.g().score !== 0, 5000);
    return s;
  };

  it("boba is worth +2 (coin sfx, +2 float)", () => {
    const { g } = catchOne("boba");
    expect(g().score).toBe(2);
    expect(g().floats.map((f) => f.text)).toEqual(["+2"]);
    expect(playSfx).toHaveBeenCalledWith("coin");
    expect(g().mood).toBe("idle");
  });

  it("donut is worth +1 (bite sfx, +1 float)", () => {
    const { g } = catchOne("donut");
    expect(g().score).toBe(1);
    expect(g().floats.map((f) => f.text)).toEqual(["+1"]);
    expect(playSfx).toHaveBeenCalledWith("bite");
  });

  it("coffee is worth -1 (ouch sfx, angry for 550 ms), and the score can go negative", () => {
    const { g, advance } = catchOne("coffee");
    expect(g().score).toBe(-1);
    expect(g().floats.map((f) => f.text)).toEqual(["-1"]);
    expect(playSfx).toHaveBeenCalledWith("ouch");
    expect(g().mood).toBe("angry");
    advance(549);
    expect(g().mood).toBe("angry");
    advance(1);
    expect(g().mood).toBe("idle");
  });

  it("a score float disappears after 750 ms and a caught item leaves the arena", () => {
    const { g, advance } = catchOne("boba");
    expect(g().items.some((i) => i.id === g().floats[0]?.id)).toBe(false);
    blobTop = AWAY_TOP; // later coffee must not add more floats
    advance(749);
    expect(g().floats).toHaveLength(1);
    advance(1);
    expect(g().floats).toHaveLength(0);
  });

  it("food that is missed falls out of the arena without scoring", () => {
    const { g, advanceUntil } = setup();
    blobTop = AWAY_TOP;
    queue = ["boba"];
    act(() => g().start());
    advanceUntil(() => g().items.length > 0, 2000);
    expect(g().items).toHaveLength(1);
    advanceUntil(() => g().items.length === 0 || g().items[0]!.id !== 1, 10_000);
    expect(g().items.some((i) => i.id === 1)).toBe(false);
    expect(g().score).toBe(0);
  });

  /** Catch `foods` in order, then dodge everything else until the round ends. */
  const playRound = (foods: FoodType[], target: number) => {
    const s = setup();
    queue = [...foods];
    act(() => s.g().start());
    s.advanceUntil(() => s.g().score >= target || s.g().phase !== "playing");
    return s;
  };

  it("reaching 100 does not end the round early; the win is decided when the clock hits 0", () => {
    const s = playRound(Array(50).fill("boba"), 100);
    expect(s.g().score).toBe(100);
    expect(s.g().phase).toBe("playing");
    expect(s.g().timeLeft).toBeGreaterThan(0);
    blobTop = AWAY_TOP; // dodge the rest
    s.advanceUntil(() => s.g().phase !== "playing");
    expect(s.g().phase).toBe("won");
    expect(s.g().mood).toBe("boba");
    expect(s.g().score).toBe(100);
    expect(playSfx).toHaveBeenLastCalledWith("win");
  });

  it("99 points at the buzzer is a loss", () => {
    const s = playRound([...Array(49).fill("boba"), "donut"], 99);
    expect(s.g().score).toBe(99);
    blobTop = AWAY_TOP;
    s.advanceUntil(() => s.g().phase !== "playing");
    expect(s.g().phase).toBe("lost");
    expect(s.g().mood).toBe("sleep");
    expect(playSfx).toHaveBeenLastCalledWith("lose");
  });

  it("a high score that drops below 100 again before the buzzer is a loss", () => {
    const s = playRound(Array(50).fill("boba"), 100);
    queue = ["coffee"]; // next catch is coffee (also the queue's default)
    s.advanceUntil(() => s.g().score < 100 || s.g().phase !== "playing");
    expect(s.g().score).toBe(99);
    blobTop = AWAY_TOP;
    s.advanceUntil(() => s.g().phase !== "playing");
    expect(s.g().phase).toBe("lost");
  });
});

describe("useFeedGame dragging", () => {
  const ptr = (clientX: number, pointerId = 1) => {
    const target = { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() };
    const event = {
      pointerId,
      clientX,
      preventDefault: vi.fn(),
      currentTarget: target,
    };
    return { event: event as unknown as ReactPointerEvent<HTMLElement>, raw: event, target };
  };

  it("grabbing is ignored while the game is not running", () => {
    const { g } = setup();
    const p = ptr(150);
    act(() => g().onGrab(p.event));
    expect(g().held).toBe(false);
    expect(p.raw.preventDefault).not.toHaveBeenCalled();
  });

  it("drag moves the blob without jumping, clamps to 8..(width - blob - 8), and release lands it", () => {
    const { g } = setup();
    blobTop = AWAY_TOP;
    act(() => g().start());
    const start = g().blobX; // 112
    const grab = ptr(start + 10); // grab 10px inside the blob
    act(() => g().onGrab(grab.event));
    expect(g().held).toBe(true);
    expect(playSfx).toHaveBeenCalledWith("hopTakeoff", 0.5);

    act(() => g().onDrag(ptr(start + 60).event));
    expect(g().blobX).toBe(start + 50);

    act(() => g().onDrag(ptr(-500).event));
    expect(g().blobX).toBe(8);
    act(() => g().onDrag(ptr(5000).event));
    expect(g().blobX).toBe(ARENA.w - BLOB.w - 8); // 216

    act(() => g().onDrag(ptr(100, 2).event)); // other pointer id: ignored
    expect(g().blobX).toBe(216);

    const landingBefore = g().landing;
    act(() => g().onRelease(ptr(0).event));
    expect(g().held).toBe(false);
    expect(g().landing).toBe(landingBefore + 1);
    expect(playSfx).toHaveBeenCalledWith("hopLand", 0.5);
  });
});
