import { afterEach, describe, expect, it, vi } from "vitest";
import { isTyping, setTyping, subscribeTyping } from "@/lib/typing";

describe("typing state", () => {
  afterEach(() => setTyping(false));

  it("starts as not typing", () => {
    expect(isTyping()).toBe(false);
  });

  it("notifies subscribers only when the value changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeTyping(listener);

    setTyping(true);
    setTyping(true);
    setTyping(false);

    expect(listener.mock.calls).toEqual([[true], [false]]);
    unsubscribe();
  });

  it("stops notifying after unsubscribe", () => {
    const listener = vi.fn();
    subscribeTyping(listener)();

    setTyping(true);

    expect(listener).not.toHaveBeenCalled();
    expect(isTyping()).toBe(true);
  });
});
