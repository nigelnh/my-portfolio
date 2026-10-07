# my-portfolio

Personal portfolio site for Nhan Nguyen — a pixel-art / retro-window take on a
developer portfolio, in English and Chinese.

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
  blob/
    sprites.tsx     the six avatar states, ported from the animation studio
    useBlobBrain.ts the mascot's state machine — see below
    BlobStage.tsx   the roaming blob in the About panel
    BlobSettings.tsx  the sound switch, shown beside the languages
  game/
    FeedGame.tsx    the catch game in the Contact section
    useFeedGame.ts  its rules and loop
    sprites.tsx     food sprites
  mac/
    MacScreen.tsx   power, boot animation, shell, live project preview
    useTerminal.ts  the shell's commands
  sections/         About, Journey, Experience, Projects, Stack, Contact
app/api/contact/     contact form mail via Resend
app/api/embeddable/  header check behind the MacBook's live preview
lib/
  copy.ts           all EN/ZH content + language-independent metadata
  i18n.tsx          language context, persisted to localStorage
  sfx.ts            8-bit sound synthesis (Web Audio, no assets)
  site.ts           pixel-grid and nav-label switches
  typing.ts         whether the visitor is typing in the MacBook shell
  useActiveSection.ts  scroll-spy for the nav
```

## Icons

Every icon renders through `<Icon name="..." />`, which looks the name up in the
`ICONS` registry in `components/icons.tsx`. Swapping in a new icon set means
editing that one file — no call sites change.

The current set is the **Pixel Blob Icon Kit**, ported verbatim from
`pixel_blob_icon_kit_interactive_showcase.html`. Unlike a monochrome icon font
these are full-colour sprites: the fills are part of the artwork, so they do
*not* follow `currentColor`. Keep rendered sizes on integer multiples of 24
(24 / 48 / 72) so the pixel grid lands on whole device pixels.

Where each sprite is used:

| Sprite | Placement |
| --- | --- |
| `graduation-cap`, `school-building`, `split-keyboard`, `retro-monitor`, `pixel-envelope` | nav: About, Journey, Work, Projects, Contact |
| `logo-kb`, `logo-finbud`, `logo-esmart`, `logo-fpt` | Experience: one per employer |
| `diploma-scroll` | Journey: milestones heading |
| `macbook-m1` | Stack: setup card |
| `apple-chin` | About: laptop chin |
| `apple-glow`, `apple-silver`, `touch-id-power` | MacBook boot screen and power button |
| `retro-monitor` | MacBook screen: project preview |

The registry also holds sprites kept for reference and not currently placed
(for example `coffee-cup`, `pixel-star`, `bull-finance`).

Nav and job icons come from `SECTIONS[].icon` and `jobsMeta[].icon` in
`lib/copy.ts`, both typed as `IconName` so a bad name fails the build.

## The blob

The mascot comes from the Pixel Blue Blob Avatar & Animation Studio kit. Its
states live in `components/blob/sprites.tsx` (32×26 viewBox, animated inner
elements driven by the kit's `.zzz-*`, `.pearl-anim-*`, `.smoke-*` and
`.paw-tap-*` classes in `globals.css`). The current kit ships five poses; `wave`
is carried over from the previous revision, which is the last one that had it,
and no component currently renders it.

### Free roaming

The blob hops between random destinations in two dimensions at **1.4×** speed:
28px steps, 420ms per hop, 200ms rest (`HOP` in `useBlobBrain.ts`; `1` and `2`
are there too if you want to change gear). Each hop plays one `singleHop`
animation, with the takeoff and landing sounds fired at 20% and 85% of it so
they land on the squash and the stretch.

Its arena is the stage beside the laptop block in the About panel, measured in
pixels and re-read on every hop so a resize is picked up.

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
`.blob-actor`, which makes its decisions easy to inspect.

## The MacBook

The laptop in the hero is interactive. It boots on the first visit of a session
(later loads skip straight to the shell), and the power state is yours to
control — `exit` in the shell turns it off, and the dark screen is a button that
boots it again.

The shell is real, if small. `useTerminal.ts` implements:

```
ls              list projects
cd <id>         select a project (cd .. to deselect)
run [id]        launch the selected project on this screen
open            open the running project in a new tab
clear           clear the screen
exit            shut the machine down
help, whoami, pwd
```

Up and down arrows walk the command history. `run` loads the project's live
deployment into the screen, scaled down from a 1280px-wide viewport; clicking
the screen opens the real site.

Project deployments live on `projectsMeta[].url` in `lib/copy.ts`. A project
without a URL reports "not deployed" instead of running.

### Why there is a server-side header check

A site that sends `X-Frame-Options: DENY` cannot be embedded — but the page
cannot detect that: the blocked frame still fires `load` (on the browser's own
error page) and its document is cross-origin, so nothing is readable. So
`/api/embeddable` fetches the deployment server-side, reads `X-Frame-Options`
and CSP `frame-ancestors`, and answers whether framing is allowed. When it is
not, the screen shows a card that opens the project in a new tab instead.

Only URLs already listed in `projectsMeta` are fetched, so the route cannot be
pointed at arbitrary hosts.

## Sound

`lib/sfx.ts` synthesises the kit's chiptune cues with oscillators — no audio
files. Two gates guard it: the visitor's own sound switch (`BlobSettings.tsx`, in the About
title bar and the nav rail; **off by default**, since the blob hops every second
or so), and a check that a
user gesture has happened, because browsers refuse to start an AudioContext
before one.

## Contact form

The form validates locally, then POSTs to `app/api/contact/route.ts`, which
sends the mail through Resend. The key stays on the server: a `NEXT_PUBLIC_`
variable would ship it to every visitor.

The route also rate-limits to five submissions per IP per minute (`MAX_PER_WINDOW` and `WINDOW_MS` in the route; in memory, per server instance), sets
`reply_to` to the visitor so a reply reaches them rather than the site, and
returns 503 when `RESEND_API_KEY` is missing — in which case the form says so
instead of claiming the message was sent.

Resend is provisioned through the Vercel Marketplace:

```bash
vercel integration add resend/resend-email --plan free -m domain=<your-domain>
vercel env pull          # writes RESEND_API_KEY into .env.local
```

See `.env.example` for the optional overrides.

## Content

All prose lives in `lib/copy.ts` under `STRINGS.en` / `.zh` (`LANGS`). Stack tags,
employers and project metadata are language-independent and sit alongside it, so
a translation change never touches structure.
