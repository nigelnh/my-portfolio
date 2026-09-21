/**
 * Whether the visitor is typing in the MacBook terminal.
 *
 * The blob watches this so it starts tapping its own keyboard while you use
 * the shell, and goes back to its own business when you click away.
 */

type Listener = (typing: boolean) => void;

const listeners = new Set<Listener>();
let typing = false;

export function setTyping(next: boolean) {
  if (typing === next) return;
  typing = next;
  listeners.forEach((l) => l(next));
}

export function isTyping() {
  return typing;
}

export function subscribeTyping(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
