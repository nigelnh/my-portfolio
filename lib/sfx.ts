/**
 * 8-bit chiptune sound effects, synthesised with the Web Audio API.
 *
 * Ported from the Pixel Blue Blob Avatar & Animation Studio kit — no audio
 * assets, every sound is an oscillator envelope.
 *
 * Two gates guard playback:
 *  - `enabled`: the user's own mute toggle. Off by default, because a page
 *    that beeps at you unprompted is hostile.
 *  - `armed`: browsers refuse to start an AudioContext before a user gesture,
 *    so nothing is attempted until one has happened.
 */

export type SfxName = "blip" | "squish" | "hop" | "slurp" | "snore" | "angry" | "success";

let ctx: AudioContext | null = null;
let enabled = false;
let armed = false;

type Listener = (enabled: boolean) => void;
const listeners = new Set<Listener>();

/** Call from a user gesture handler; safe to call repeatedly. */
export function armAudio() {
  armed = true;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    try {
      ctx = new Ctor();
    } catch {
      return;
    }
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function isSoundEnabled() {
  return enabled;
}

export function setSoundEnabled(next: boolean) {
  enabled = next;
  if (next) armAudio();
  listeners.forEach((l) => l(next));
}

export function subscribeSound(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Frequency/gain envelopes, transcribed from the kit. */
function envelope(
  name: SfxName,
  osc: OscillatorNode,
  gain: GainNode,
  now: number,
  scale: number,
): number {
  const f = osc.frequency;
  const g = gain.gain;
  // Scheduled gain values, scaled so repeat-heavy cues can sit lower.
  const at = (v: number, t: number) => g.setValueAtTime(v * scale, t);
  const to = (v: number, t: number) => g.linearRampToValueAtTime(v * scale, t);

  switch (name) {
    case "blip":
      osc.type = "square";
      f.setValueAtTime(520, now);
      f.exponentialRampToValueAtTime(880, now + 0.08);
      at(0.08, now);
      to(0.001, now + 0.08);
      return 0.08;

    case "squish":
    case "hop":
      osc.type = "sine";
      f.setValueAtTime(260, now);
      f.exponentialRampToValueAtTime(560, now + 0.07);
      f.exponentialRampToValueAtTime(320, now + 0.14);
      at(0.12, now);
      to(0.001, now + 0.14);
      return 0.14;

    case "slurp":
      osc.type = "triangle";
      f.setValueAtTime(340, now);
      f.linearRampToValueAtTime(620, now + 0.08);
      f.linearRampToValueAtTime(420, now + 0.16);
      f.linearRampToValueAtTime(740, now + 0.24);
      at(0.1, now);
      to(0.01, now + 0.25);
      return 0.25;

    case "snore":
      osc.type = "sine";
      f.setValueAtTime(190, now);
      f.exponentialRampToValueAtTime(140, now + 0.35);
      at(0.07, now);
      to(0.001, now + 0.35);
      return 0.35;

    case "angry":
      osc.type = "sawtooth";
      f.setValueAtTime(280, now);
      f.linearRampToValueAtTime(160, now + 0.18);
      at(0.09, now);
      to(0.001, now + 0.18);
      return 0.18;

    case "success":
      osc.type = "triangle";
      f.setValueAtTime(523.25, now);
      f.setValueAtTime(659.25, now + 0.08);
      f.setValueAtTime(783.99, now + 0.16);
      at(0.09, now);
      to(0.001, now + 0.24);
      return 0.24;
  }
}

/**
 * `gainScale` trims the volume of sounds that repeat often — the blob's hop
 * fires every couple of seconds, so it plays well under the one-off cues.
 */
export function playSfx(name: SfxName, gainScale = 1) {
  if (!enabled || !armed || !ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const duration = envelope(name, osc, gain, now, gainScale);

    osc.start(now);
    osc.stop(now + duration);
  } catch {
    // A blocked or closed AudioContext must never break the animation loop.
  }
}
