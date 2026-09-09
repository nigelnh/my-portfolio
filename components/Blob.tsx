"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { Icon, type IconName } from "./icons";

interface BlobContextValue {
  poke: number;
  bump: () => void;
}

const BlobContext = createContext<BlobContextValue>({ poke: 0, bump: () => {} });

/** The blob's poke counter is shared: the mini blob in Contact advances the
 *  speech bubble in About, exactly as in the design source. */
export function BlobProvider({ children }: { children: ReactNode }) {
  const [poke, setPoke] = useState(0);
  const bump = useCallback(() => setPoke((n) => n + 1), []);
  const value = useMemo(() => ({ poke, bump }), [poke, bump]);
  return <BlobContext.Provider value={value}>{children}</BlobContext.Provider>;
}

export function useBlob() {
  return useContext(BlobContext);
}

/**
 * `variant="hero"` shows the idle sprite and winks once poked;
 * `variant="wave"` is the waving sprite the icon kit ships for the Contact box.
 */
export function Blob({
  variant = "hero",
  size = 120,
  label,
}: {
  variant?: "hero" | "wave";
  size?: number;
  label: string;
}) {
  const { poke, bump } = useBlob();

  const sprite: IconName =
    variant === "wave" ? "blob-wave" : poke > 0 ? "blob-wink" : "blob-idle";

  return (
    <button type="button" className="blob-hit" onMouseEnter={bump} onClick={bump} aria-label={label}>
      <Icon name={sprite} size={size} className="pixel-blob" />
    </button>
  );
}
