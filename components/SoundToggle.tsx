"use client";

import { useEffect, useState } from "react";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sfx";

/**
 * Sound is off until the visitor asks for it: the blob hops every couple of
 * seconds, and an unprompted beep on page load is hostile (browsers block the
 * AudioContext before a gesture anyway).
 */
export function SoundToggle({ label }: { label: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(isSoundEnabled());
    return subscribeSound(setOn);
  }, []);

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-pressed={on}
      onClick={() => setSoundEnabled(!on)}
    >
      <span aria-hidden="true">{on ? "♪" : "×"}</span>
      <span>{label}</span>
    </button>
  );
}
