# my-portfolio

Personal portfolio site for Nhan Nguyen — a pixel-art / retro-window take on a
developer portfolio, in English, Vietnamese and Chinese.

Implemented from the Claude Design artboard `Portfolio.dc.html`
([source project](https://claude.ai/design/p/dcc9033f-001c-4557-bccc-c6d803bb5200)).

## Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Plain CSS with design tokens in `app/globals.css` — no UI framework, the
  design's 4px borders and hard shadows map to CSS variables directly
- `next/font` for IBM Plex Mono and Pixelify Sans

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`.

## Layout

```
app/
  layout.tsx        fonts + metadata
  page.tsx          renders <Portfolio />
  globals.css       design tokens and every component style
components/
  Portfolio.tsx     providers + section order
  Nav.tsx           sticky left rail (≥880px) and bottom tab bar (<880px)
  Panel.tsx         the bordered window with its coloured title bar
  Blob.tsx          the mascot; its poke counter is shared across sections
  icons.tsx         icon registry — see below
  LangSwitcher.tsx
  sections/         About, Journey, Experience, Projects, Stack, Contact
lib/
  copy.ts           all EN/VI/ZH content + language-independent metadata
  i18n.tsx          language context, persisted to localStorage
  site.ts           pixel-grid and nav-label switches
  useActiveSection.ts  scroll-spy for the nav
```

## Icons

Every icon renders through `<Icon name="..." />`, which looks the name up in the
`ICONS` registry in `components/icons.tsx`. Swapping in a new icon set means
editing that one file — no call sites change. Icons are 16×16 inline SVG using
`currentColor` and `shapeRendering="crispEdges"` to stay pixel-crisp.

Names in use: `circle`, `triangle`, `square`, `grid`, `diamond`, `dot`
(assigned in `lib/copy.ts` via `SECTIONS[].icon` and `jobsMeta[].icon`).

## Contact form

The form validates locally, then:

- POSTs JSON to `NEXT_PUBLIC_CONTACT_WEBHOOK` (an n8n workflow) when that is set;
- falls back to a `mailto:` to `NEXT_PUBLIC_CONTACT_EMAIL` when the webhook is
  unset or the request fails.

Copy `.env.example` to `.env.local` to configure both.

## Content

All prose lives in `lib/copy.ts` under `STRINGS.en` / `.vi` / `.zh`. Stack tags,
employers and project metadata are language-independent and sit alongside it, so
a translation change never touches structure.
