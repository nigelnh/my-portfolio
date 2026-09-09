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

Other scripts: `npm run build`, `npm run start`, `npm run lint`, `npm run typecheck`,
and `npm run verify` (typecheck + lint in one go).

> **Do not run `npm run build` while `npm run dev` is running.** Both write to
> `.next/`, so the production build replaces the chunks the dev server is still
> serving. The dev server then fails with `Cannot find module './NNN.js'` and the
> browser shows `__webpack_modules__[moduleId] is not a function`. Use
> `npm run verify` for checks while dev is up. To recover:
>
> ```bash
> pkill -f "next dev" && rm -rf .next && npm run dev
> ```

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
  icons.tsx         icon registry — see below
  LangSwitcher.tsx
  SoundToggle.tsx
  blob/
    sprites.tsx     the six avatar states, ported from the animation studio
    useBlobBrain.ts the mascot's state machine — see below
    BlobStage.tsx   the roaming blob and the static waving one
  sections/         About, Journey, Experience, Projects, Stack, Contact
lib/
  copy.ts           all EN/VI/ZH content + language-independent metadata
  i18n.tsx          language context, persisted to localStorage
  sfx.ts            8-bit sound synthesis (Web Audio, no assets)
  site.ts           pixel-grid and nav-label switches
  useActiveSection.ts  scroll-spy for the nav
```

## Icons

Every icon renders through `<Icon name="..." />`, which looks the name up in the
`ICONS` registry in `components/icons.tsx`. Swapping in a new icon set means
editing that one file — no call sites change.

The current set is the **Pixel Blob Icon Kit** (16 sprites, ported verbatim from
`pixel_blob_icon_kit_interactive_showcase.html`). Unlike a monochrome icon font
these are full-colour 24×24 sprites: the fills are part of the artwork, so they
do *not* follow `currentColor`. Keep rendered sizes on integer multiples of 24
(24 / 48 / 72) so the pixel grid lands on whole device pixels.

Where each sprite is used:

| Sprite | Placement |
| --- | --- |
| `graduation-cap` | nav — About |
| `school-building` | nav — Journey |
| `split-keyboard` | nav — Work |
| `retro-monitor` | nav — Projects |
| `pixel-envelope` | nav — Contact |
| `ai-brain-chip` | job — Finbud AI |
| `rocket-launch` | job — eSmart Solutions Agency |
| `scooter-vespa` | job — FPT IS |
| `bull-finance` | job — KB Securities |
| `blob-idle` / `blob-wink` | hero mascot, before / after a poke |
| `blob-wave` | Contact reply box |
| `coffee-cup` | beside the hero mascot |
| `diploma-scroll` | Journey — MILESTONES heading |
| `macbook-m1` | Stack — SETUP card |
| `pixel-star` | Contact — ELSEWHERE heading |

Nav and job icons come from `SECTIONS[].icon` and `jobsMeta[].icon` in
`lib/copy.ts`, both typed as `IconName` so a bad name fails the build.

## The blob

The mascot comes from the Pixel Blue Blob Avatar & Animation Studio kit. Its six
states live in `components/blob/sprites.tsx` (32×26 viewBox, animated inner
elements driven by the kit's `.zzz-*`, `.pearl-anim-*` and `.smoke-*` classes in
`globals.css`).

`useBlobBrain` runs its day, and every timing sits in one `TIMING` object at the
top of that file:

| Behaviour | Trigger |
| --- | --- |
| Wander | Continuous — hops to a random spot along the shelf under the laptop |
| Stop | On arrival it picks `idle`, `code` (typing) or `boba` at random, and holds for 2.6–5.2s |
| Ask for boba | 45% of `boba` stops open a bubble with YES / NO; unanswered after 14s it moves on |
| Sleep | 26s with no hover on the blob; any hover wakes it |
| Sulk | 4 clicks inside 3s → `angry` for 3s |

`prefers-reduced-motion: reduce` stops the wandering entirely and leaves a still
idle blob. The Contact box uses the static `wave` sprite.

## Sound

`lib/sfx.ts` synthesises the kit's chiptune cues with oscillators — no audio
files. Two gates guard it: the visitor's own toggle in the About title bar
(**off by default**, since the blob hops every couple of seconds), and a check
that a user gesture has happened, because browsers refuse to start an
AudioContext before one.

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
