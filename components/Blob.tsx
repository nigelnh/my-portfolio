"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

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

export function Blob({ mini = false, label }: { mini?: boolean; label: string }) {
  const { poke, bump } = useBlob();

  return (
    <button
      type="button"
      className="blob-hit"
      onMouseEnter={bump}
      onClick={bump}
      aria-label={label}
    >
      <div
        className={[
          "blob",
          mini ? "blob--mini" : "",
          !mini && poke > 0 ? "blob--poked" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="blob__eye blob__eye--l" />
        <div className="blob__eye blob__eye--r" />
        {!mini && (
          <>
            <div className="blob__cheek blob__cheek--l" />
            <div className="blob__cheek blob__cheek--r" />
          </>
        )}
        <div className="blob__mouth" />
        {!mini && <div className="blob__shine" />}
      </div>
    </button>
  );
}
