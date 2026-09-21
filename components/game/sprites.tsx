/**
 * Artwork for the Feed The Blob minigame.
 *
 * Ported from the Pixel Blob kit (`pixel_blob_icon_kit_interactive_showcase
 * (7).html`). The blob itself is the shared sprite from `blob/sprites.tsx`;
 * only the falling food and the knocked-out pose live here.
 *
 * Cut-outs (the donut hole, the mug handle) are painted with `--arena` so they
 * read as holes against the arena floor.
 */

import type { SVGProps } from "react";

export type FoodType = "boba" | "donut" | "coffee";

interface FoodArt {
  /** Rendered size in arena pixels; also the collision box. */
  w: number;
  h: number;
  points: number;
  /** Colour of the floating +2 / +1 / -1 indicator. */
  tint: string;
  viewBox: string;
  art: React.ReactNode;
}

export const FOODS: Record<FoodType, FoodArt> = {
  boba: {
    w: 30,
    h: 36,
    points: 2,
    tint: "#0f7a58",
    viewBox: "0 0 20 24",
    art: (
      <>
        <rect x="9" y="1" width="2" height="7" fill="#9333ea" />
        <rect x="4" y="6" width="12" height="2" fill="#7e22ce" />
        <rect x="5" y="8" width="10" height="1" fill="#a855f7" />
        <path d="M5 9H15V20H13V22H7V20H5V9Z" fill="#122c44" />
        <path d="M6 10H14V19H12V21H8V19H6V10Z" fill="#fed7aa" />
        <rect x="6" y="12" width="8" height="7" fill="#ea580c" />
        <rect x="8" y="19" width="4" height="2" fill="#ea580c" />
        <rect x="7" y="17" width="2" height="2" fill="#122c44" />
        <rect x="11" y="17" width="2" height="2" fill="#122c44" />
        <rect x="9" y="15" width="2" height="2" fill="#122c44" />
      </>
    ),
  },
  donut: {
    w: 30,
    h: 30,
    points: 1,
    tint: "#a15c07",
    viewBox: "0 0 22 22",
    art: (
      <>
        <rect x="4" y="2" width="14" height="18" fill="#122c44" />
        <rect x="2" y="4" width="18" height="14" fill="#122c44" />
        <rect x="3" y="5" width="16" height="12" fill="#d97706" />
        <rect x="5" y="3" width="12" height="6" fill="#f43f5e" />
        <rect x="3" y="6" width="16" height="8" fill="#f43f5e" />
        <rect x="8" y="8" width="6" height="6" fill="#122c44" />
        <rect x="9" y="9" width="4" height="4" fill="var(--arena)" />
        <rect x="6" y="5" width="2" height="1" fill="#fde047" />
        <rect x="14" y="6" width="2" height="1" fill="#38bdf8" />
        <rect x="5" y="10" width="1" height="2" fill="#4ade80" />
        <rect x="16" y="11" width="1" height="2" fill="#ffffff" />
        <rect x="8" y="15" width="2" height="1" fill="#fde047" />
      </>
    ),
  },
  coffee: {
    w: 30,
    h: 30,
    points: -1,
    tint: "#a33b52",
    viewBox: "0 0 22 22",
    art: (
      <>
        <rect x="6" y="1" width="2" height="2" fill="#cbd5e1" />
        <rect x="10" y="2" width="2" height="2" fill="#cbd5e1" />
        <rect x="14" y="1" width="2" height="2" fill="#cbd5e1" />
        <rect x="3" y="5" width="13" height="14" fill="#122c44" />
        <rect x="4" y="6" width="11" height="12" fill="#334155" />
        <rect x="5" y="7" width="9" height="2" fill="#0f172a" />
        <rect x="16" y="7" width="4" height="8" fill="#122c44" />
        <rect x="17" y="9" width="2" height="4" fill="var(--arena)" />
        <rect x="7" y="11" width="5" height="4" fill="#ef4444" />
        <rect x="8" y="12" width="1" height="1" fill="#122c44" />
        <rect x="10" y="12" width="1" height="1" fill="#122c44" />
      </>
    ),
  },
};

/** The falling item itself, and the legend swatches, share this renderer. */
export function FoodSprite({
  type,
  scale = 1,
  ...rest
}: { type: FoodType; scale?: number } & Omit<SVGProps<SVGSVGElement>, "type">) {
  const food = FOODS[type];
  return (
    <svg
      viewBox={food.viewBox}
      width={Math.round(food.w * scale)}
      height={Math.round(food.h * scale)}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {food.art}
    </svg>
  );
}

/** Flattened blob with x_x eyes, shown when the round is lost. */
export function FaintBlob({ size = 88 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 26"
      width={size}
      height={Math.round((size * 26) / 32)}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className="anim-faint"
    >
      <path d="M8 8H24V10H28V14H31V21H29V24H3V21H1V14H4V10H8V8Z" fill="#122c44" />
      <path d="M8 10H24V12H27V15H29V21H27V23H5V21H3V15H5V12H8V10Z" fill="#718096" />
      <path d="M5 21H27V23H5V21Z" fill="#4a5568" />
      <rect x="8" y="15" width="1" height="1" fill="#122c44" />
      <rect x="10" y="15" width="1" height="1" fill="#122c44" />
      <rect x="9" y="16" width="1" height="1" fill="#122c44" />
      <rect x="8" y="17" width="1" height="1" fill="#122c44" />
      <rect x="10" y="17" width="1" height="1" fill="#122c44" />
      <rect x="20" y="15" width="1" height="1" fill="#122c44" />
      <rect x="22" y="15" width="1" height="1" fill="#122c44" />
      <rect x="21" y="16" width="1" height="1" fill="#122c44" />
      <rect x="20" y="17" width="1" height="1" fill="#122c44" />
      <rect x="22" y="17" width="1" height="1" fill="#122c44" />
      <rect x="14" y="18" width="4" height="1" fill="#122c44" />
      <rect x="15" y="19" width="2" height="2" fill="#ef4444" />
      <g className="soul-ghost">
        <path d="M13 3H19V7H13V3Z" fill="#e2e8f0" opacity="0.75" />
        <rect x="14" y="4" width="1" height="1" fill="#122c44" />
        <rect x="17" y="4" width="1" height="1" fill="#122c44" />
      </g>
    </svg>
  );
}
