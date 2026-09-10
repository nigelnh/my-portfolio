"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * A campus photo slot. Until the image file exists it shows the hatched
 * placeholder with its label, so the section never renders a broken image.
 */
export function PhotoFrame({ src, label }: { src?: string; label: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="frame">
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="frame frame--photo">
      <Image
        src={src}
        alt={label}
        fill
        sizes="(max-width: 880px) 90vw, 30vw"
        style={{ objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
