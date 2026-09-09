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

The mascot comes from the Pixel Blue Blob Avatar & Animation Studio kit. Its
states live in `components/blob/sprites.tsx` (32×26 viewBox, animated inner
elements driven by the kit's `.zzz-*`, `.pearl-anim-*`, `.smoke-*` and
`.paw-tap-*` classes in `globals.css`). The current kit ships five poses; `wave`
is carried over from the previous revision, which is the last one that had it,
and the Contact box still uses it.

### Free roaming

The blob roams in two dimensions across the whole laptop block, hopping between
random destinations at **1.4×** speed — 28px steps, 420ms per hop, 200ms rest
(`HOP` in `useBlobBrain.ts`; `1` and `2` are there too if you want to change
gear). Each hop plays one `singleHop` animation, with the takeoff and landing
sounds fired at 20% and 85% of it so they land on the squash and the stretch.

### State rules

Four vitals drift once a second and decide what happens next. Rules are checked
in priority order, and each takes an action lock so the blob finishes what it
started:

| # | Rule | Condition | Then |
| --- | --- | --- | --- |
| 1 | Out of energy | `energy ≤ 15` | Sleep for at least 9s; wakes at `energy ≥ 95` and wanders off 1.5s later |
| 2 | Craving boba | `bobaNeed ≥ 80` | Asks for one with YES / NO — YES drinks for 6.5s, NO sulks; unanswered after 14s it takes a sip anyway |
| 3 | Inspired | `codeUrge ≥ 80` and `energy > 35` | Opens the MacBook for 7s |
| 4 | Chill | nothing urgent | Returns to idle, then alternates: 65% chance to start wandering, 35% chance to stop |

Drift rates per second: sleeping `energy +8, boba +0.5, anger 0`; drinking
`boba −18, energy +2`; coding `codeUrge −12, energy −2, boba +2`; otherwise
`energy −2.5` wandering or `−1` standing, `boba +2.2`, `codeUrge +1.8`.

Poking: one poke is friendly (`energy +4`, `codeUrge +6`); **3 pokes inside
2.6s** or **any poke while asleep** sets anger to 100 and sulks for 4.5s.

`prefers-reduced-motion: reduce` stops the roaming and leaves a still idle blob.
The blob's vitals are mirrored onto `data-energy` / `data-boba` / `data-code` on
`.blob-actor`, which is what the kit's HUD reads and makes its decisions easy to
inspect.

## Sound

`lib/sfx.ts` synthesises the kit's chiptune cues with oscillators — no audio
files. Two gates guard it: the visitor's own toggle in the About title bar
(**off by default**, since the blob hops every second or so), and a check that a
user gesture has happened, because browsers refuse to start an AudioContext
before one.

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
