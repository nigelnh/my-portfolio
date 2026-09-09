/**
 * Pixel Blue Blob avatar sprites.
 *
 * Ported verbatim from the "Pixel Blue Blob Avatar & Animation Studio" kit
 * (`pixel_blob_icon_kit_interactive_showcase (3).html`). All six share a
 * 32x26 viewBox; the inner elements carry the kit's own animation classes
 * (`.zzz-*`, `.pearl-anim-*`, `.smoke-*`), which live in globals.css.
 *
 * The fills are part of the artwork, so these do not follow `currentColor`.
 */

import type { SVGProps } from "react";
import type { SfxName } from "@/lib/sfx";

export type BlobState =
  | "boba"
  | "sleep"
  | "angry"
  | "code"
  | "idle"
  | "wave";

interface Variant {
  sound: SfxName;
  /** The kit's own line for this state, shown in the speech bubble. */
  quote: string;
  art: React.ReactNode;
}

export const BLOB_VARIANTS: Record<BlobState, Variant> = {
  /** Blob Uống Trà Sữa (Boba) */
  boba: {
    sound: "slurp",
    quote: "Hút trân châu cái rột! Ly để thấp vừa vặn thấy rõ miệng xinh đang uống nè! 🧋✨",
    art: (
      <>
      <path d="M10 2H22V4H26V7H29V11H31V19H29V22H27V24H5V22H3V19H1V11H3V7H6V4H10V2Z" fill="#122c44"/>
      <path d="M10 4H22V6H25V8H27V11H29V19H27V21H25V23H7V21H5V19H3V11H5V8H7V6H10V4Z" fill="#58b3ea"/>
      <path d="M7 21H25V23H7V21ZM5 19H7V21H5V19ZM25 19H27V21H25V19Z" fill="#296ea6"/>
      <path d="M10 5H16V7H10V5ZM7 8H9V11H7V8Z" fill="#b9e7fc"/>
      <rect x="8" y="10" width="2" height="3" fill="#122c44"/>
      <rect x="8" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="22" y="10" width="2" height="3" fill="#122c44"/>
      <rect x="22" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="4" y="13" width="4" height="3" fill="#ff8da1"/>
      <rect x="5" y="14" width="2" height="1" fill="#ffffff"/>
      <rect x="24" y="13" width="4" height="3" fill="#ff8da1"/>
      <rect x="25" y="14" width="2" height="1" fill="#ffffff"/>
      <rect x="14" y="12" width="4" height="4" fill="#122c44"/>
      <rect x="15" y="13" width="2" height="2" fill="#ff6b8b"/>
      <rect x="15" y="13" width="2" height="1" fill="#122c44"/>
      <rect x="13" y="14" width="1" height="1" fill="#296ea6"/>
      <rect x="18" y="14" width="1" height="1" fill="#296ea6"/>
      <rect x="15" y="14" width="2" height="9" fill="#122c44"/>
      <rect x="15" y="14" width="1" height="9" fill="#d8b4fe"/>
      <rect x="16" y="14" width="1" height="9" fill="#9333ea"/>
      <g className="pearl-anim-1">
      <rect x="15" y="17" width="2" height="2" fill="#122c44"/>
      <rect x="15" y="17" width="1" height="1" fill="#334155"/>
      </g>
      <rect x="11" y="17" width="10" height="1" fill="#122c44"/>
      <rect x="12" y="16" width="8" height="1" fill="#a855f7"/>
      <rect x="12" y="18" width="8" height="6" fill="#122c44"/>
      <rect x="13" y="18" width="6" height="5" fill="#f8fafc"/>
      <rect x="13" y="19" width="6" height="4" fill="#d9975b"/>
      <rect x="13" y="19" width="6" height="1" fill="#fae8d4"/>
      <rect x="14" y="22" width="1" height="1" fill="#122c44"/>
      <rect x="16" y="22" width="1" height="1" fill="#122c44"/>
      <rect x="17" y="21" width="1" height="1" fill="#122c44"/>
      <rect x="14" y="21" width="1" height="1" fill="#122c44"/>
      <rect x="10" y="18" width="2" height="3" fill="#122c44"/>
      <rect x="10" y="18" width="2" height="2" fill="#58b3ea"/>
      <rect x="20" y="18" width="2" height="3" fill="#122c44"/>
      <rect x="20" y="18" width="2" height="2" fill="#58b3ea"/>
      </>
    ),
  },
  /** Blob Đi Ngủ (Sleeping Zzz) */
  sleep: {
    sound: "snore",
    quote: "Khò khò... Đang sạc lại pin để mai viết thuật toán quant tiếp... Zzz 😴",
    art: (
      <>
      <path d="M8 8H24V10H28V14H31V21H29V24H3V21H1V14H4V10H8V8Z" fill="#122c44"/>
      <path d="M8 10H24V12H27V15H29V21H27V23H5V21H3V15H5V12H8V10Z" fill="#58b3ea"/>
      <path d="M5 21H27V23H5V21Z" fill="#296ea6"/>
      <rect x="8" y="11" width="8" height="2" fill="#b9e7fc"/>
      <rect x="8" y="16" width="4" height="2" fill="#122c44"/>
      <rect x="20" y="16" width="4" height="2" fill="#122c44"/>
      <rect x="6" y="18" width="3" height="2" fill="#ff8da1"/>
      <rect x="23" y="18" width="3" height="2" fill="#ff8da1"/>
      <path d="M12 4H20V9H12V4Z" fill="#2563eb"/>
      <path d="M13 3H19V4H13V3Z" fill="#122c44"/>
      <rect x="11" y="8" width="10" height="2" fill="#ffffff" stroke="#122c44" strokeWidth="0.5"/>
      <rect x="20" y="5" width="4" height="4" fill="#2563eb"/>
      <rect x="24" y="7" width="3" height="3" fill="#fde047" stroke="#122c44" strokeWidth="0.5"/>
      <circle cx="16" cy="18" r="2.5" fill="#a5f3fc" stroke="#122c44" strokeWidth="0.8" opacity="0.85" style={{ animation: "snotBubble 3s infinite ease-in-out", transformOrigin: "16px 18px" }}/>
      <g className="zzz-1 font-pixel" fill="#3b82f6">
      <text x="21" y="6" fontSize="5" fontFamily="'Press Start 2P', monospace" fill="#1e40af">Z</text>
      </g>
      <g className="zzz-2 font-pixel" fill="#60a5fa">
      <text x="24" y="3" fontSize="4" fontFamily="'Press Start 2P', monospace" fill="#3b82f6">z</text>
      </g>
      </>
    ),
  },
  /** Blob Giận Dỗi (Pouting / Rage) */
  angry: {
    sound: "angry",
    quote: "Hứ! Ai bảo debug cả buổi chiều mà quên lưu file cơ chứ?! Giận tím người luôn! 💢",
    art: (
      <>
      <g className="smoke-left">
      <rect x="2" y="5" width="2" height="2" fill="#ffffff"/>
      <rect x="3" y="3" width="3" height="2" fill="#d9ecf9"/>
      </g>
      <g className="smoke-right">
      <rect x="27" y="5" width="2" height="2" fill="#ffffff"/>
      <rect x="26" y="3" width="3" height="2" fill="#d9ecf9"/>
      </g>
      <path d="M10 2H22V4H26V7H29V11H31V19H29V22H27V24H5V22H3V19H1V11H3V7H6V4H10V2Z" fill="#122c44"/>
      <path d="M10 4H22V6H25V8H27V11H29V19H27V21H25V23H7V21H5V19H3V11H5V8H7V6H10V4Z" fill="#4ea5de"/>
      <path d="M7 21H25V23H7V21ZM5 19H7V21H5V19Z" fill="#256499"/>
      <path d="M8 11H12V12H10V13H8V11Z" fill="#122c44"/>
      <path d="M20 11H24V12H22V13H20V11Z" fill="#122c44"/>
      <rect x="9" y="13" width="2" height="1" fill="#ffffff"/>
      <rect x="21" y="13" width="2" height="1" fill="#ffffff"/>
      <rect x="14" y="16" width="4" height="2" fill="#122c44"/>
      <rect x="15" y="15" width="2" height="1" fill="#122c44"/>
      <rect x="4" y="14" width="5" height="4" fill="#ef4444"/>
      <rect x="5" y="15" width="3" height="2" fill="#f87171"/>
      <rect x="23" y="14" width="5" height="4" fill="#ef4444"/>
      <rect x="24" y="15" width="3" height="2" fill="#f87171"/>
      <g>
      <rect x="23" y="4" width="1" height="5" fill="#dc2626"/>
      <rect x="27" y="4" width="1" height="5" fill="#dc2626"/>
      <rect x="24" y="4" width="3" height="1" fill="#dc2626"/>
      <rect x="24" y="8" width="3" height="1" fill="#dc2626"/>
      <rect x="25" y="5" width="1" height="3" fill="#ef4444"/>
      </g>
      </>
    ),
  },
  /** Blob Gõ Phím (Coding M1) */
  code: {
    sound: "blip",
    quote: "Đang build mô hình định giá chứng quyền Black-Scholes cực cháy! 💻📈",
    art: (
      <>
      <path d="M10 2H22V4H26V7H29V11H31V19H29V22H27V24H5V22H3V19H1V11H3V7H6V4H10V2Z" fill="#122c44"/>
      <path d="M10 4H22V6H25V8H27V11H29V19H27V21H25V23H7V21H5V19H3V11H5V8H7V6H10V4Z" fill="#58b3ea"/>
      <path d="M10 5H16V7H10V5Z" fill="#b9e7fc"/>
      <rect x="9" y="10" width="2" height="3" fill="#122c44"/>
      <rect x="9" y="11" width="1" height="1" fill="#ffffff"/>
      <rect x="21" y="10" width="2" height="3" fill="#122c44"/>
      <rect x="21" y="11" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="13" width="2" height="2" fill="#ff8da1"/>
      <rect x="24" y="13" width="2" height="2" fill="#ff8da1"/>
      <rect x="7" y="14" width="18" height="8" fill="#122c44"/>
      <rect x="8" y="15" width="16" height="6" fill="#0b1724"/>
      <rect x="10" y="16" width="7" height="1" fill="#4ade80"/>
      <rect x="10" y="18" width="12" height="1" fill="#60a5fa"/>
      <rect x="8" y="21" width="3" height="2" fill="#58b3ea" stroke="#122c44" strokeWidth="0.5"/>
      <rect x="21" y="21" width="3" height="2" fill="#58b3ea" stroke="#122c44" strokeWidth="0.5"/>
      <rect x="5" y="22" width="22" height="2" fill="#122c44"/>
      <rect x="6" y="22" width="20" height="1" fill="#cbd5e1"/>
      </>
    ),
  },
  /** Blob Mỉm Cười (Happy Idle) */
  idle: {
    sound: "squish",
    quote: "Xin chào! Mình là Blob, chào mừng bạn ghé thăm portfolio của Nhan Nguyen! ✨",
    art: (
      <>
      <path d="M10 2H22V4H26V7H29V11H31V19H29V22H27V24H5V22H3V19H1V11H3V7H6V4H10V2Z" fill="#122c44"/>
      <path d="M10 4H22V6H25V8H27V11H29V19H27V21H25V23H7V21H5V19H3V11H5V8H7V6H10V4Z" fill="#58b3ea"/>
      <path d="M7 21H25V23H7V21ZM5 19H7V21H5V19ZM25 19H27V21H25V19Z" fill="#296ea6"/>
      <path d="M10 5H17V7H10V5ZM7 8H10V11H7V8ZM6 11H8V14H6V11Z" fill="#b9e7fc"/>
      <rect x="18" y="5" width="3" height="1" fill="#eaf6fd"/>
      <rect x="6" y="16" width="3" height="2" fill="#ff8da1"/>
      <rect x="23" y="16" width="3" height="2" fill="#ff8da1"/>
      <rect x="10" y="12" width="2" height="3" fill="#122c44"/>
      <rect x="10" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="20" y="12" width="2" height="3" fill="#122c44"/>
      <rect x="20" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="15" y="16" width="2" height="1" fill="#122c44"/>
      <rect x="14" y="15" width="1" height="1" fill="#122c44"/>
      <rect x="17" y="15" width="1" height="1" fill="#122c44"/>
      </>
    ),
  },
  /** Blob Vẫy Tay (Waving Hello) */
  wave: {
    sound: "blip",
    quote: "Gửi email hoặc kết nối LinkedIn với Nhan qua phần Liên hệ nhé! 👋💙",
    art: (
      <>
      <path d="M26 3H30V9H28V12H25V10H27V5H25V3H26Z" fill="#122c44"/>
      <rect x="26" y="4" width="2" height="5" fill="#58b3ea"/>
      <path d="M10 2H22V4H25V7H27V11H29V19H27V22H25V24H5V22H3V19H1V11H3V7H6V4H10V2Z" fill="#122c44"/>
      <path d="M10 4H22V6H25V8H26V11H27V19H25V21H24V23H7V21H5V19H3V11H5V8H7V6H10V4Z" fill="#58b3ea"/>
      <path d="M7 21H24V23H7V21Z" fill="#296ea6"/>
      <path d="M10 5H17V7H10V5Z" fill="#b9e7fc"/>
      <path d="M9 13H13V14H11V13ZM19 13H23V14H21V13Z" fill="#122c44"/>
      <rect x="14" y="15" width="4" height="2" fill="#122c44"/>
      <rect x="15" y="16" width="2" height="1" fill="#ff8da1"/>
      <rect x="6" y="15" width="3" height="2" fill="#ff8da1"/>
      <rect x="22" y="15" width="3" height="2" fill="#ff8da1"/>
      </>
    ),
  },
};

/** Animation class the kit pairs with each state. */
export const BLOB_ANIM: Record<BlobState, string> = {
  idle: "anim-idle",
  code: "anim-idle",
  wave: "anim-idle",
  boba: "anim-boba",
  sleep: "anim-sleep",
  angry: "anim-angry",
};

export function BlobSprite({
  state,
  size = 80,
  ...rest
}: { state: BlobState; size?: number } & Omit<SVGProps<SVGSVGElement>, "state">) {
  // The art is 32x26, so height follows the sprite's own aspect ratio.
  return (
    <svg
      viewBox="0 0 32 26"
      width={size}
      height={Math.round((size * 26) / 32)}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {BLOB_VARIANTS[state].art}
    </svg>
  );
}
