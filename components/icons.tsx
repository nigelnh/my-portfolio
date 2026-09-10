/**
 * Pixel Blob Icon Kit — 16-bit retro sprites.
 *
 * Ported verbatim from `pixel_blob_icon_kit_interactive_showcase.html`.
 * Unlike a monochrome icon font these are full-colour 24x24 sprites: the fills
 * are part of the artwork, so they do NOT follow `currentColor`.
 *
 * Every icon in the site is looked up through `<Icon name="..." />`, so a future
 * icon set only has to replace the entries in `ICONS` — no call site changes.
 *
 * Sizes should stay integer multiples of 24 (24/48/72) so the pixel grid lands
 * on whole device pixels; smaller UI sizes are fine but lose some crispness.
 */

import type { SVGProps } from "react";

export type IconName =
  | "graduation-cap"
  | "school-building"
  | "retro-monitor"
  | "pixel-envelope"
  | "bull-finance"
  | "ai-brain-chip"
  | "split-keyboard"
  | "macbook-m1"
  | "rocket-launch"
  | "coffee-cup"
  | "scooter-vespa"
  | "diploma-scroll"
  | "pixel-star"
  | "apple-glow"
  | "apple-silver"
  | "m1-pro-chip"
  | "touch-id-power"
  | "apple-chin"
  | "logo-kb"
  | "logo-finbud"
  | "logo-esmart"
  | "logo-fpt";

type Sprite = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const sprite = (children: React.ReactNode): Sprite => {
  const Glyph = (props: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
  Glyph.displayName = "PixelIcon";
  return Glyph;
};

export const ICONS: Record<IconName, Sprite> = {
  /** Giới thiệu (About) — Mũ cử nhân đại học pixel ở thanh bên trái */
  "graduation-cap": sprite(
    <>
      <path d="M12 3L13 3L18 6L23 9L12 15L1 9L6 6L11 3L12 3Z" fill="#122c44"/>
      <path d="M12 5L20 9L12 13L4 9L12 5Z" fill="#4a88c7"/>
      <path d="M12 5L17 8L12 11L7 8L12 5Z" fill="#8ec5fa"/>
      <path d="M6 11V16C6 16 8 19 12 19C16 19 18 16 18 16V11L12 14L6 11Z" fill="#122c44"/>
      <path d="M8 13V15.5C8 15.5 9.5 17 12 17C14.5 17 16 15.5 16 15.5V13L12 15L8 13Z" fill="#2d659d"/>
      <rect x="4" y="9" width="1" height="5" fill="#fec84e"/>
      <rect x="3" y="14" width="3" height="3" fill="#fec84e"/>
      <rect x="4" y="15" width="1" height="1" fill="#122c44"/>
      <rect x="11" y="8" width="2" height="2" fill="#ffffff"/>
    </>,
  ),
  /** Hành trình (Journey) — Tòa nhà trường đại học với tháp cờ */
  "school-building": sprite(
    <>
      <rect x="12" y="1" width="1" height="5" fill="#122c44"/>
      <path d="M13 2H17V4H13V2Z" fill="#4a88c7"/>
      <path d="M11 5H13V6H15V7H17V8H7V7H9V6H11V5Z" fill="#122c44"/>
      <rect x="9" y="7" width="6" height="1" fill="#d9edf9"/>
      <path d="M2 9H22V22H2V9Z" fill="#122c44"/>
      <rect x="4" y="11" width="16" height="9" fill="#99c8f0"/>
      <rect x="5" y="13" width="2" height="7" fill="#ffffff"/>
      <rect x="9" y="13" width="2" height="7" fill="#ffffff"/>
      <rect x="13" y="13" width="2" height="7" fill="#ffffff"/>
      <rect x="17" y="13" width="2" height="7" fill="#ffffff"/>
      <rect x="10" y="16" width="4" height="4" fill="#1f4b75"/>
      <rect x="11" y="17" width="2" height="3" fill="#122c44"/>
      <rect x="3" y="20" width="18" height="1" fill="#4a88c7"/>
    </>,
  ),
  /** Dự án (Projects) — Màn hình CRT máy tính thập niên 90 */
  "retro-monitor": sprite(
    <>
      <rect x="2" y="2" width="20" height="15" fill="#122c44"/>
      <rect x="4" y="4" width="16" height="11" fill="#cbe4f7"/>
      <rect x="6" y="5" width="12" height="8" fill="#1b4570"/>
      <rect x="7" y="6" width="3" height="1" fill="#67baf0"/>
      <rect x="7" y="7" width="1" height="2" fill="#67baf0"/>
      <rect x="17" y="13" width="2" height="1" fill="#4ade80"/>
      <rect x="14" y="13" width="1" height="1" fill="#122c44"/>
      <rect x="10" y="17" width="4" height="2" fill="#122c44"/>
      <rect x="11" y="17" width="2" height="2" fill="#88bce8"/>
      <rect x="6" y="19" width="12" height="2" fill="#122c44"/>
      <rect x="7" y="19" width="10" height="1" fill="#cbe4f7"/>
    </>,
  ),
  /** Liên hệ (Contact) — Bìa thư liên hệ phong cách 16-bit */
  "pixel-envelope": sprite(
    <>
      <rect x="2" y="4" width="20" height="15" fill="#122c44"/>
      <rect x="4" y="6" width="16" height="11" fill="#ffffff"/>
      <path d="M4 6L12 12L20 6H4Z" fill="#d9edf9"/>
      <path d="M4 6L12 12L4 12V6Z" fill="#b9daf2"/>
      <path d="M20 6L12 12L20 12V6Z" fill="#a4cde9"/>
      <line x1="4" y1="6" x2="12" y2="12" stroke="#122c44" strokeWidth="1"/>
      <line x1="20" y1="6" x2="12" y2="12" stroke="#122c44" strokeWidth="1"/>
      <line x1="4" y1="17" x2="10" y2="11" stroke="#122c44" strokeWidth="1"/>
      <line x1="20" y1="17" x2="14" y2="11" stroke="#122c44" strokeWidth="1"/>
      <rect x="15" y="7" width="3" height="4" fill="#4a88c7"/>
      <rect x="16" y="8" width="1" height="2" fill="#ffffff"/>
    </>,
  ),
  /** Bò Tài Chính (Quant Bull) — Chú bò phố Wall đại diện Quantitative Finance & KB Securities */
  "bull-finance": sprite(
    <>
      <rect x="4" y="4" width="2" height="4" fill="#fec84e"/>
      <rect x="3" y="3" width="2" height="2" fill="#fec84e"/>
      <rect x="10" y="4" width="2" height="4" fill="#fec84e"/>
      <rect x="11" y="3" width="2" height="2" fill="#fec84e"/>
      <rect x="5" y="7" width="6" height="7" fill="#122c44"/>
      <rect x="6" y="8" width="4" height="5" fill="#4a88c7"/>
      <rect x="6" y="11" width="4" height="3" fill="#8dc2f5"/>
      <rect x="7" y="14" width="2" height="2" fill="#fec84e"/>
      <rect x="9" y="9" width="11" height="7" fill="#122c44"/>
      <rect x="10" y="10" width="9" height="5" fill="#3273b3"/>
      <rect x="9" y="16" width="2" height="4" fill="#122c44"/>
      <rect x="13" y="16" width="2" height="4" fill="#122c44"/>
      <rect x="17" y="16" width="2" height="4" fill="#122c44"/>
      <rect x="20" y="8" width="1" height="4" fill="#122c44"/>
      <rect x="21" y="11" width="2" height="2" fill="#fec84e"/>
      <path d="M15 4H21V10H19V7.4L15.4 11L14 9.6L17.6 6H15V4Z" fill="#4ade80"/>
    </>,
  ),
  /** AI Brain (Finbud AI) — Bộ não AI kết hợp vi mạch bán dẫn */
  "ai-brain-chip": sprite(
    <>
      <rect x="6" y="1" width="2" height="3" fill="#122c44"/>
      <rect x="11" y="1" width="2" height="3" fill="#122c44"/>
      <rect x="16" y="1" width="2" height="3" fill="#122c44"/>
      <rect x="6" y="20" width="2" height="3" fill="#122c44"/>
      <rect x="11" y="20" width="2" height="3" fill="#122c44"/>
      <rect x="16" y="20" width="2" height="3" fill="#122c44"/>
      <rect x="1" y="6" width="3" height="2" fill="#122c44"/>
      <rect x="1" y="11" width="3" height="2" fill="#122c44"/>
      <rect x="1" y="16" width="3" height="2" fill="#122c44"/>
      <rect x="20" y="6" width="3" height="2" fill="#122c44"/>
      <rect x="20" y="11" width="3" height="2" fill="#122c44"/>
      <rect x="20" y="16" width="3" height="2" fill="#122c44"/>
      <rect x="3" y="3" width="18" height="18" fill="#122c44"/>
      <rect x="5" y="5" width="14" height="14" fill="#2d6aa4"/>
      <path d="M8 7H11V9H8V7ZM13 7H16V9H13V7ZM7 10H10V14H7V10ZM14 10H17V14H14V10ZM9 12H15V13H9V12ZM8 15H11V17H8V15ZM13 15H16V17H13V15Z" fill="#b9e7fc"/>
      <rect x="11" y="10" width="2" height="4" fill="#ffffff"/>
    </>,
  ),
  /** Bàn Phím Split (Sofle v2.1) — Bàn phím cơ split ergonomic xuất hiện trong phần Chương mới */
  "split-keyboard": sprite(
    <>
      <rect x="2" y="6" width="9" height="12" fill="#122c44"/>
      <rect x="3" y="7" width="7" height="10" fill="#6ba7df"/>
      <rect x="4" y="8" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="8" width="1" height="1" fill="#ffffff"/>
      <rect x="8" y="8" width="1" height="1" fill="#ffffff"/>
      <rect x="4" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="8" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="4" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="8" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="7" y="14" width="2" height="2" fill="#20507c"/>
      <rect x="13" y="6" width="9" height="12" fill="#122c44"/>
      <rect x="14" y="7" width="7" height="10" fill="#6ba7df"/>
      <rect x="15" y="8" width="1" height="1" fill="#ffffff"/>
      <rect x="17" y="8" width="1" height="1" fill="#ffffff"/>
      <rect x="19" y="8" width="1" height="1" fill="#ffffff"/>
      <rect x="15" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="17" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="19" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="15" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="17" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="19" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="15" y="14" width="2" height="2" fill="#20507c"/>
      <path d="M10 11H14V13H10V11Z" fill="#122c44"/>
      <rect x="11" y="11" width="2" height="1" fill="#fec84e"/>
    </>,
  ),
  /** MacBook Pro M1 — Laptop 2021 14-inch MacBook Pro with M1 Pro */
  "macbook-m1": sprite(
    <>
      <rect x="4" y="3" width="16" height="12" fill="#122c44"/>
      <rect x="5" y="4" width="14" height="10" fill="#0b1724"/>
      <path d="M7 9C9 7 12 11 15 8" stroke="#4a88c7" strokeWidth="1"/>
      <path d="M6 11C10 9 12 13 17 9" stroke="#92cdfa" strokeWidth="1"/>
      <rect x="10" y="6" width="4" height="3" fill="#1f4b75"/>
      <rect x="11" y="7" width="2" height="1" fill="#ffffff"/>
      <rect x="2" y="15" width="20" height="3" fill="#122c44"/>
      <rect x="3" y="15" width="18" height="2" fill="#cbe4f7"/>
      <rect x="10" y="15" width="4" height="1" fill="#122c44"/>
      <rect x="4" y="18" width="16" height="1" fill="#122c44"/>
    </>,
  ),
  /** Tên Lửa (Chương Mới) — Tên lửa cất cánh đại diện Interactive Roadmap & Milestone */
  "rocket-launch": sprite(
    <>
      <rect x="18" y="2" width="4" height="4" fill="#122c44"/>
      <rect x="19" y="3" width="2" height="2" fill="#4a88c7"/>
      <path d="M14 4H18V8H20V12H18V14H16V16H12V18H8V14H10V12H12V8H14V4Z" fill="#122c44"/>
      <path d="M14 6H16V10H14V12H12V14H10V10H12V8H14V6Z" fill="#eaf5fd"/>
      <rect x="13" y="8" width="3" height="3" fill="#122c44"/>
      <rect x="14" y="9" width="1" height="1" fill="#60a5fa"/>
      <path d="M10 14H6V18H10V14Z" fill="#4a88c7"/>
      <path d="M16 8H20V12H16V8Z" fill="#4a88c7"/>
      <rect x="5" y="17" width="4" height="4" fill="#fec84e"/>
      <rect x="3" y="19" width="3" height="3" fill="#f97316"/>
      <rect x="1" y="21" width="2" height="2" fill="#ef4444"/>
      <rect x="7" y="15" width="2" height="2" fill="#ffffff"/>
    </>,
  ),
  /** Ly Cà Phê (Coffee Cup) — Cốc cà phê take-away bên cạnh Blob */
  "coffee-cup": sprite(
    <>
      <rect x="12" y="2" width="2" height="4" fill="#4ade80"/>
      <rect x="13" y="1" width="3" height="2" fill="#4ade80"/>
      <rect x="6" y="5" width="12" height="2" fill="#122c44"/>
      <rect x="7" y="5" width="10" height="1" fill="#ffffff"/>
      <path d="M5 7H19V19H17V22H7V19H5V7Z" fill="#122c44"/>
      <path d="M7 8H17V18H15V21H9V18H7V8Z" fill="#eef6fc"/>
      <rect x="6" y="11" width="12" height="5" fill="#4a88c7"/>
      <rect x="10" y="12" width="4" height="3" fill="#ffffff"/>
      <rect x="11" y="13" width="2" height="1" fill="#122c44"/>
    </>,
  ),
  /** Xe Tay Ga (Vespa) — Xe scooter xuất hiện trong ô dự án Covered Warrants */
  "scooter-vespa": sprite(
    <>
      <rect x="6" y="6" width="3" height="3" fill="#122c44"/>
      <rect x="7" y="7" width="1" height="1" fill="#fec84e"/>
      <rect x="7" y="9" width="2" height="5" fill="#122c44"/>
      <rect x="12" y="9" width="6" height="3" fill="#122c44"/>
      <rect x="13" y="10" width="5" height="1" fill="#364152"/>
      <path d="M6 13H18V17H16V18H8V16H6V13Z" fill="#4a88c7"/>
      <rect x="5" y="15" width="4" height="5" fill="#122c44"/>
      <rect x="6" y="16" width="2" height="3" fill="#ffffff"/>
      <rect x="7" y="17" width="1" height="1" fill="#122c44"/>
      <rect x="15" y="15" width="4" height="5" fill="#122c44"/>
      <rect x="16" y="16" width="2" height="3" fill="#ffffff"/>
      <rect x="17" y="17" width="1" height="1" fill="#122c44"/>
    </>,
  ),
  /** Bằng Tốt Nghiệp (Diploma) — Cuộn bằng cử nhân kèm ruy băng xanh */
  "diploma-scroll": sprite(
    <>
      <path d="M4 6H18V17H4V6Z" fill="#122c44"/>
      <rect x="5" y="7" width="12" height="9" fill="#f5fafd"/>
      <rect x="3" y="7" width="2" height="9" fill="#d2e7f7"/>
      <rect x="17" y="7" width="2" height="9" fill="#d2e7f7"/>
      <rect x="10" y="6" width="3" height="11" fill="#4a88c7"/>
      <rect x="10" y="17" width="2" height="3" fill="#2d6aa4"/>
      <rect x="12" y="18" width="2" height="3" fill="#2d6aa4"/>
      <rect x="11" y="17" width="1" height="1" fill="#fec84e"/>
    </>,
  ),
  /** Ngôi Sao (Pixel Star) — Hiệu ứng lấp lánh retro 4 cánh */
  "pixel-star": sprite(
    <>
      <rect x="11" y="2" width="2" height="20" fill="#122c44"/>
      <rect x="2" y="11" width="20" height="2" fill="#122c44"/>
      <rect x="10" y="10" width="4" height="4" fill="#fec84e"/>
      <rect x="11" y="11" width="2" height="2" fill="#ffffff"/>
      <rect x="11" y="5" width="2" height="6" fill="#fec84e"/>
      <rect x="11" y="13" width="2" height="6" fill="#fec84e"/>
      <rect x="5" y="11" width="6" height="2" fill="#fec84e"/>
      <rect x="13" y="11" width="6" height="2" fill="#fec84e"/>
      <rect x="8" y="8" width="2" height="2" fill="#4a88c7"/>
      <rect x="14" y="8" width="2" height="2" fill="#4a88c7"/>
      <rect x="8" y="14" width="2" height="2" fill="#4a88c7"/>
      <rect x="14" y="14" width="2" height="2" fill="#4a88c7"/>
    </>,
  ),
  /** Apple Logo (Lid Glow) */
  "apple-glow": sprite(
    <>
      <rect x="13" y="2" width="2" height="2" fill="#ffffff"/>
      <rect x="15" y="3" width="2" height="2" fill="#ffffff"/>
      <rect x="14" y="4" width="2" height="2" fill="#ffffff"/>
      <rect x="7" y="7" width="4" height="2" fill="#ffffff"/>
      <rect x="13" y="7" width="4" height="2" fill="#ffffff"/>
      <rect x="5" y="9" width="14" height="8" fill="#ffffff"/>
      <rect x="16" y="9" width="4" height="5" fill="#122c44"/>
      <rect x="15" y="10" width="2" height="3" fill="#122c44"/>
      <rect x="7" y="17" width="4" height="2" fill="#ffffff"/>
      <rect x="13" y="17" width="4" height="2" fill="#ffffff"/>
      <rect x="6" y="11" width="12" height="7" fill="#ffffff"/>
    </>,
  ),
  /** Apple Space Gray */
  "apple-silver": sprite(
    <>
      <rect x="13" y="2" width="2" height="2" fill="#94a3b8"/>
      <rect x="15" y="3" width="2" height="2" fill="#64748b"/>
      <rect x="14" y="4" width="2" height="2" fill="#cbd5e1"/>
      <rect x="7" y="7" width="4" height="2" fill="#cbd5e1"/>
      <rect x="13" y="7" width="4" height="2" fill="#cbd5e1"/>
      <rect x="5" y="9" width="14" height="8" fill="#94a3b8"/>
      <rect x="5" y="9" width="1" height="8" fill="#e2e8f0"/>
      <rect x="6" y="9" width="10" height="1" fill="#e2e8f0"/>
      <rect x="16" y="9" width="4" height="5" fill="#122c44"/>
      <rect x="15" y="10" width="2" height="3" fill="#122c44"/>
      <rect x="7" y="17" width="4" height="2" fill="#64748b"/>
      <rect x="13" y="17" width="4" height="2" fill="#64748b"/>
    </>,
  ),
  /** Chip Apple M1 Pro */
  "m1-pro-chip": sprite(
    <>
      <rect x="3" y="3" width="18" height="18" fill="#122c44"/>
      <rect x="4" y="4" width="16" height="16" fill="#1e293b"/>
      <rect x="6" y="2" width="2" height="2" fill="#eab308"/>
      <rect x="11" y="2" width="2" height="2" fill="#eab308"/>
      <rect x="16" y="2" width="2" height="2" fill="#eab308"/>
      <rect x="6" y="20" width="2" height="2" fill="#eab308"/>
      <rect x="11" y="20" width="2" height="2" fill="#eab308"/>
      <rect x="16" y="20" width="2" height="2" fill="#eab308"/>
      <rect x="6" y="6" width="12" height="12" fill="#0f172a"/>
      <rect x="7" y="8" width="1" height="5" fill="#ffffff"/>
      <rect x="8" y="9" width="1" height="2" fill="#ffffff"/>
      <rect x="9" y="8" width="1" height="5" fill="#ffffff"/>
      <rect x="11" y="8" width="2" height="1" fill="#ffffff"/>
      <rect x="12" y="8" width="1" height="5" fill="#ffffff"/>
      <rect x="7" y="14" width="10" height="2" fill="#38bdf8"/>
    </>,
  ),
  /** Nút Nguồn Touch ID */
  "touch-id-power": sprite(
    <>
      <rect x="2" y="2" width="20" height="20" fill="#122c44"/>
      <rect x="3" y="3" width="18" height="18" fill="#1e293b"/>
      <rect x="5" y="5" width="14" height="14" fill="#0f172a"/>
      <rect x="7" y="7" width="10" height="10" fill="none" stroke="#64748b" strokeWidth="1"/>
      <rect x="10" y="9" width="4" height="1" fill="#94a3b8"/>
      <rect x="9" y="11" width="6" height="1" fill="#94a3b8"/>
      <rect x="10" y="13" width="4" height="1" fill="#94a3b8"/>
    </>,
  ),
  /**
   * Apple Space Gray for a light surface. The kit's own logos paint the bite
   * cutout with a solid colour rather than leaving it transparent, so on the
   * laptop's chin the dark version showed up as a black notch. This one takes
   * the bite from the chin's background token instead.
   */
  "apple-chin": sprite(
    <>
      <rect x="8" y="6" width="3" height="1" fill="#6b7f96"/>
      <rect x="12" y="6" width="4" height="1" fill="#6b7f96"/>
      <rect x="6" y="7" width="12" height="1" fill="#6b7f96"/>
      <rect x="5" y="8" width="14" height="1" fill="#6b7f96"/>
      <rect x="4" y="9" width="14" height="1" fill="#6b7f96"/>
      <rect x="4" y="10" width="12" height="1" fill="#6b7f96"/>
      <rect x="4" y="11" width="11" height="1" fill="#6b7f96"/>
      <rect x="4" y="12" width="11" height="1" fill="#6b7f96"/>
      <rect x="4" y="13" width="12" height="1" fill="#6b7f96"/>
      <rect x="4" y="14" width="14" height="1" fill="#6b7f96"/>
      <rect x="4" y="15" width="15" height="1" fill="#6b7f96"/>
      <rect x="5" y="16" width="14" height="1" fill="#6b7f96"/>
      <rect x="6" y="17" width="12" height="1" fill="#6b7f96"/>
      <rect x="7" y="18" width="4" height="1" fill="#6b7f96"/>
      <rect x="13" y="18" width="4" height="1" fill="#6b7f96"/>
      <rect x="8" y="19" width="3" height="1" fill="#6b7f96"/>
      <rect x="13" y="19" width="3" height="1" fill="#6b7f96"/>
      <rect x="6" y="16" width="12" height="1" fill="#52657a"/>
      <rect x="7" y="17" width="10" height="1" fill="#52657a"/>
      <rect x="7" y="18" width="4" height="1" fill="#52657a"/>
      <rect x="13" y="18" width="4" height="1" fill="#52657a"/>
      <rect x="8" y="19" width="3" height="1" fill="#52657a"/>
      <rect x="13" y="19" width="3" height="1" fill="#52657a"/>
      <rect x="6" y="9" width="3" height="1" fill="#93a6b9"/>
      <rect x="5" y="10" width="2" height="1" fill="#93a6b9"/>
      <rect x="5" y="11" width="1" height="1" fill="#93a6b9"/>
      <rect x="14" y="2" width="3" height="1" fill="#5f7386"/>
      <rect x="13" y="3" width="4" height="1" fill="#5f7386"/>
      <rect x="13" y="4" width="3" height="1" fill="#5f7386"/>
      <rect x="11" y="5" width="2" height="1" fill="#52657a"/>
    </>,
  ),
  /** KB Securities — a stylised monogram tile, not the company's real logo. */
  "logo-kb": sprite(
    <>
      <rect x="2" y="4" width="20" height="16" fill="#122c44"/>
      <rect x="3" y="5" width="18" height="14" fill="#f5b32d"/>
      <rect x="5" y="8" width="2" height="8" fill="#122c44"/>
      <rect x="7" y="11" width="1" height="2" fill="#122c44"/>
      <rect x="8" y="9" width="1" height="2" fill="#122c44"/>
      <rect x="8" y="13" width="1" height="2" fill="#122c44"/>
      <rect x="9" y="8" width="1" height="1" fill="#122c44"/>
      <rect x="9" y="15" width="1" height="1" fill="#122c44"/>
      <rect x="13" y="8" width="2" height="8" fill="#122c44"/>
      <rect x="15" y="8" width="3" height="1" fill="#122c44"/>
      <rect x="15" y="11" width="3" height="1" fill="#122c44"/>
      <rect x="15" y="15" width="3" height="1" fill="#122c44"/>
      <rect x="18" y="9" width="1" height="2" fill="#122c44"/>
      <rect x="18" y="12" width="1" height="3" fill="#122c44"/>
    </>,
  ),
  /** Finbud AI — a stylised monogram tile, not the company's real logo. */
  "logo-finbud": sprite(
    <>
      <rect x="2" y="4" width="20" height="16" fill="#122c44"/>
      <rect x="3" y="5" width="18" height="14" fill="#1f7a5a"/>
      <rect x="6" y="8" width="6" height="2" fill="#ffffff"/>
      <rect x="6" y="10" width="2" height="6" fill="#ffffff"/>
      <rect x="8" y="11" width="3" height="2" fill="#ffffff"/>
      <rect x="14" y="14" width="2" height="2" fill="#7fd6b0"/>
      <rect x="16" y="11" width="2" height="5" fill="#7fd6b0"/>
      <rect x="14" y="9" width="4" height="1" fill="#7fd6b0"/>
      <rect x="17" y="8" width="1" height="2" fill="#7fd6b0"/>
    </>,
  ),
  /** eSmart Solutions Agency — a stylised monogram tile, not the company's real logo. */
  "logo-esmart": sprite(
    <>
      <rect x="2" y="4" width="20" height="16" fill="#122c44"/>
      <rect x="3" y="5" width="18" height="14" fill="#2f6fd0"/>
      <rect x="7" y="9" width="4" height="1" fill="#ffffff"/>
      <rect x="6" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="10" y="10" width="1" height="1" fill="#ffffff"/>
      <rect x="6" y="11" width="5" height="1" fill="#ffffff"/>
      <rect x="6" y="12" width="1" height="1" fill="#ffffff"/>
      <rect x="7" y="13" width="4" height="1" fill="#ffffff"/>
      <rect x="14" y="8" width="4" height="1" fill="#bcd9ff"/>
      <rect x="13" y="9" width="1" height="1" fill="#bcd9ff"/>
      <rect x="14" y="10" width="3" height="1" fill="#bcd9ff"/>
      <rect x="17" y="11" width="1" height="1" fill="#bcd9ff"/>
      <rect x="13" y="12" width="4" height="1" fill="#bcd9ff"/>
    </>,
  ),
  /** FPT IS — a stylised monogram tile, not the company's real logo. */
  "logo-fpt": sprite(
    <>
      <rect x="2" y="4" width="20" height="16" fill="#122c44"/>
      <rect x="3" y="5" width="18" height="14" fill="#f1f5f9"/>
      <rect x="5" y="8" width="4" height="2" fill="#f47b20"/>
      <rect x="5" y="10" width="2" height="6" fill="#f47b20"/>
      <rect x="7" y="11" width="2" height="2" fill="#f47b20"/>
      <rect x="10" y="8" width="4" height="2" fill="#1f9d55"/>
      <rect x="10" y="10" width="2" height="6" fill="#1f9d55"/>
      <rect x="12" y="10" width="2" height="2" fill="#1f9d55"/>
      <rect x="15" y="8" width="5" height="2" fill="#2f6fd0"/>
      <rect x="17" y="10" width="2" height="6" fill="#2f6fd0"/>
    </>,
  ),
};

/** Kit metadata, kept for reference and for any future icon browser. */
export const ICON_META: Record<IconName, { name: string; category: string }> = {
  "graduation-cap": { name: "Giới thiệu (About)", category: "nav" },
  "school-building": { name: "Hành trình (Journey)", category: "nav" },
  "retro-monitor": { name: "Dự án (Projects)", category: "nav" },
  "pixel-envelope": { name: "Liên hệ (Contact)", category: "nav" },
  "bull-finance": { name: "Bò Tài Chính (Quant Bull)", category: "tech" },
  "ai-brain-chip": { name: "AI Brain (Finbud AI)", category: "tech" },
  "split-keyboard": { name: "Bàn Phím Split (Sofle v2.1)", category: "tech" },
  "macbook-m1": { name: "MacBook Pro M1", category: "tech" },
  "rocket-launch": { name: "Tên Lửa (Chương Mới)", category: "items" },
  "coffee-cup": { name: "Ly Cà Phê (Coffee Cup)", category: "items" },
  "scooter-vespa": { name: "Xe Tay Ga (Vespa)", category: "items" },
  "diploma-scroll": { name: "Bằng Tốt Nghiệp (Diploma)", category: "items" },
  "pixel-star": { name: "Ngôi Sao (Pixel Star)", category: "items" },
  "apple-glow": { name: "Apple Logo (Lid Glow)", category: "apple" },
  "apple-silver": { name: "Apple Space Gray", category: "apple" },
  "apple-chin": { name: "Apple Space Gray (light surface)", category: "apple" },
  "logo-kb": { name: "KB Securities", category: "logo" },
  "logo-finbud": { name: "Finbud AI", category: "logo" },
  "logo-esmart": { name: "eSmart Solutions Agency", category: "logo" },
  "logo-fpt": { name: "FPT IS", category: "logo" },
  "m1-pro-chip": { name: "Chip Apple M1 Pro", category: "apple" },
  "touch-id-power": { name: "Nút Nguồn Touch ID", category: "apple" },
};

export function Icon({
  name,
  size = 24,
  ...rest
}: { name: IconName; size?: number } & Omit<SVGProps<SVGSVGElement>, "name">) {
  const Glyph = ICONS[name];
  return <Glyph width={size} height={size} {...rest} />;
}
