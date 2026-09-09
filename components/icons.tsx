/**
 * Icon registry.
 *
 * Every icon in the site is looked up through `<Icon name="..." />`, so a new
 * icon set only has to replace the entries in `ICONS` — no call site changes.
 *
 * Icons are drawn on a 16×16 grid with `shapeRendering="crispEdges"` to keep the
 * pixel-art feel of the design, and they inherit color via `currentColor`.
 */

import type { SVGProps } from "react";

export type IconName =
  | "circle"
  | "triangle"
  | "square"
  | "grid"
  | "diamond"
  | "dot";

type Glyph = (props: SVGProps<SVGSVGElement>) => React.ReactElement;

const svg = (paths: React.ReactNode): Glyph => {
  const Glyph = (props: SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="currentColor"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {paths}
    </svg>
  );
  Glyph.displayName = "Glyph";
  return Glyph;
};

export const ICONS: Record<IconName, Glyph> = {
  circle: svg(
    <>
      <rect x="5" y="2" width="6" height="2" />
      <rect x="3" y="4" width="10" height="2" />
      <rect x="2" y="6" width="12" height="4" />
      <rect x="3" y="10" width="10" height="2" />
      <rect x="5" y="12" width="6" height="2" />
    </>,
  ),
  triangle: svg(
    <>
      <rect x="7" y="2" width="2" height="2" />
      <rect x="6" y="4" width="4" height="2" />
      <rect x="5" y="6" width="6" height="2" />
      <rect x="4" y="8" width="8" height="2" />
      <rect x="3" y="10" width="10" height="2" />
      <rect x="2" y="12" width="12" height="2" />
    </>,
  ),
  square: svg(<rect x="3" y="3" width="10" height="10" />),
  grid: svg(
    <>
      <rect x="2" y="2" width="5" height="5" />
      <rect x="9" y="2" width="5" height="5" />
      <rect x="2" y="9" width="5" height="5" />
      <rect x="9" y="9" width="5" height="5" />
    </>,
  ),
  diamond: svg(
    <>
      <rect x="7" y="1" width="2" height="2" />
      <rect x="6" y="3" width="4" height="2" />
      <rect x="4" y="5" width="8" height="2" />
      <rect x="2" y="7" width="12" height="2" />
      <rect x="4" y="9" width="8" height="2" />
      <rect x="6" y="11" width="4" height="2" />
      <rect x="7" y="13" width="2" height="2" />
    </>,
  ),
  dot: svg(<rect x="6" y="6" width="4" height="4" />),
};

export function Icon({
  name,
  size = 20,
  ...rest
}: { name: string; size?: number } & SVGProps<SVGSVGElement>) {
  const Glyph = ICONS[name as IconName] ?? ICONS.dot;
  return <Glyph width={size} height={size} {...rest} />;
}
