# As-built: my-portfolio (2026-10-06)

What the site does today, from reading the code (not running it). Keep / change / delete? marks are proposals for the keep-or-kill gate. "Unverified" means I did not confirm it in a browser.

## Overview
Single-page, pixel-art "retro window" portfolio for Nhan Nguyen. Next.js 15 App Router, React 19, TypeScript, plain CSS (`app/globals.css`, 2132 lines) with CSS-variable tokens. One route (`/`), two API routes. Deployed on Vercel (unverified; no `vercel.json`). Languages: English (`en`) and Chinese (`zh`) only (`lib/copy.ts:11-14`); Vietnamese was removed in commit `cc1ed01`.

## Page structure and user flow
`app/page.tsx` renders `<Portfolio />` (`components/Portfolio.tsx`), a client component: `LangProvider` > `SideRail` + `<main>` with six sections in order About, Journey, Experience, Projects, Stack, Contact, then `TabBar`.

| Feature | What it does today | Evidence | Proposal |
| --- | --- | --- | --- |
| Side rail nav (>=880px) | Sticky left rail: profile photo, 5 icon+label links (About, Journey, Work, Projects, Contact; Stack has no nav entry), language buttons, sound toggle. Smooth-scroll via `scrollTo`, hash not updated. | `components/Nav.tsx:28-61`, `lib/copy.ts` `SECTIONS` | change (focus/hash, skip link) |
| Bottom tab bar (<880px) | Same five links, fixed bottom. | `Nav.tsx:64-86` | change |
| Scroll-spy | Active section = last whose `offsetTop` is above 35% of viewport; rAF-throttled. | `lib/useActiveSection.ts` | keep |
| Language switch | EN / 中文 buttons (rail, and compact copy in About title bar). Stored in `localStorage` key `portfolio.lang`, restored after hydration; sets `document.documentElement.lang` (`zh-CN`). Default `en`; no URL per language. | `lib/i18n.tsx`, `LangSwitcher.tsx` | change (SEO/FOUC: consider `/zh` route) |
| About / hero | Greeting, name (`h1`), role list, bio, jump buttons, roaming blob mascot, and the interactive MacBook. | `components/sections/About.tsx` | keep |
| Blob mascot | Animated sprite that hops around its stage; vitals (energy, boba need, code urge, anger) drift each second and drive state rules (sleep, ask for boba YES/NO, "code" on laptop, sulk when poked). Motion disabled under `prefers-reduced-motion`. | `components/blob/useBlobBrain.ts` (491 lines), `BlobStage.tsx`, `sprites.tsx` (260) | keep (consider extracting pure rules for tests); `delete?` if page weight matters |
| Sound | Web Audio chiptune cues (`lib/sfx.ts`). Off by default; user toggles button; AudioContext only created after a user gesture (`armAudio()` called from click/Enter/game start). Complies with autoplay policy. | `lib/sfx.ts:108-147,295-311`, `BlobSettings.tsx` | keep |
| MacBook terminal | Boots once per session (`sessionStorage`), fake shell: `ls`, `cd <id>`, `cd ..`, `run [id]`, `open`, `clear`, `exit`, `help`, `whoami`, `pwd`; history with arrow keys. `run` shows the project's live site in a scaled iframe if allowed, else a "blocked" card with a link. | `components/mac/MacScreen.tsx`, `useTerminal.ts` | keep (change: iframe sandbox) |
| Journey | Education milestones (HCMC gifted school, Gettysburg College) with photos or hatched placeholders. | `Journey.tsx`, `PhotoFrame.tsx`, `public/journey/*.jpg` | keep |
| Experience | Tab list of 4 jobs (KB Securities, Finbud AI, eSmart Solutions Agency, FPT IS) with roving-tabindex arrow-key tabs, details, stack tags, terms. | `Experience.tsx`, `jobsMeta` in `lib/copy.ts:627-660` | keep |
| Projects | 3 cards with screenshot linking out: CW research terminal, CW portal, ITCH feed handler. | `Projects.tsx`, `projectsMeta` `lib/copy.ts:675-698` | keep; change: confirm the KB Securities-hosted `cw.kbsec.com.vn` project is cleared for public mention (unverified, flagged only) |
| Stack | Skill tag groups (languages, infra, quant) and a setup card. | `Stack.tsx`, `skillTags` | keep |
| Contact form | name, email, message; client validation then POST `/api/contact`; states idle/busy/sent/error. Title-bar links to GitHub, LinkedIn, resume PDF. Mailto fallback shown under the form. | `Contact.tsx` | keep (change: spam control, see audit) |
| Feed The Blob game | 60 s catch game in the Contact panel: drag blob to catch boba (+2), donut (+1), avoid coffee (-1); win at 100 points; intro/won/lost overlays; sound cues. Pointer-only control. | `components/game/*`, `useFeedGame.ts:11-30` | delete? (largest non-core code, no keyboard control) or keep as easter egg |
| Resume | Static PDF download at `/Nhan_Nguyen_Resume.pdf`. | `public/`, `RESUME_HREF` | keep |
| Pixel grid / nav label switches | Build-time constants. | `lib/site.ts` | delete? (dead config, both fixed `true`) |

## Routes and endpoints

### `GET /` (static page)
Server entry `app/page.tsx` + `app/layout.tsx` (fonts, metadata, `<html lang="en">`).

### `POST /api/contact` (`app/api/contact/route.ts`)
Request: `Content-Type: application/json`, body `{ "name": string, "email": string, "msg": string }`.
Processing: trims; truncates to 120/200/5000 chars; requires non-empty name and msg and email matching `^[^@\s]+@[^@\s]+\.[^@\s]+$`; limiter 5 valid requests per 60 s per first `x-forwarded-for` IP (in-memory, per instance); calls Resend `POST https://api.resend.com/emails` with `from "Portfolio <FROM>"`, `to [TO]`, `reply_to` = visitor email, subject `Portfolio — <name>`, plain and escaped-HTML bodies.
Responses (all JSON):
- 200 `{ "ok": true }`
- 400 `{ "error": "bad_request" }` (bad JSON, wrong types, empty fields, bad email)
- 429 `{ "error": "rate_limited" }`
- 502 `{ "error": "send_failed" }` (Resend non-2xx; status logged only)
- 503 `{ "error": "not_configured" }` (no `RESEND_API_KEY`)
- Network failure to Resend: unhandled throw (unverified response shape).
The UI maps every non-2xx to one generic message. Proposal: keep, change (hardening).

### `GET /api/embeddable?url=<encoded url>` (`app/api/embeddable/route.ts`)
Request: query `url`, must exactly equal one of `projectsMeta[].url`.
Behaviour: HEAD (browser User-Agent, `redirect: follow`, `no-store`, 6 s abort), falls back to GET if HEAD is not ok; inspects `X-Frame-Options` (deny/sameorigin) and CSP `frame-ancestors` ('none'/'self').
Responses:
- 200 `{ "embeddable": true, "reason": "ok" }`
- 200 `{ "embeddable": false, "reason": "x-frame-options: deny" | "frame-ancestors 'none'" | "http <status>" | "unreachable" }`
- 400 `{ "error": "unknown project url" }`
Notes: the ITCH project URL is a github.com repo, which will report not embeddable in practice (unverified live). Proposal: keep, change (cache result, sandbox consumer).

No other route handlers, no middleware, no server actions found.

## Data model
No database or server-side persistence. Content is static TypeScript in `lib/copy.ts`:
- `STRINGS: Record<"en"|"zh", Strings>` with sections nav, hero, journey (milestones, schools), work/jobs, projects, stack, contact, mac, game.
- Language-independent `jobsMeta` (4), `projectsMeta` (3: id, shot, shotPos, stack, url), `skillTags`, `links` (GitHub, LinkedIn), `RESUME_HREF`, `CONTACT_EMAIL`, `SECTIONS`.
Browser storage: `localStorage["portfolio.lang"]`; `sessionStorage` key `SESSION_KEY` in `MacScreen.tsx` (MacBook already booted this session). Sound on/off is in module memory only, not persisted (`lib/sfx.ts:109`).

## External services
- Resend (email API) from the server only.
- Vercel hosting; Vercel Marketplace integration for Resend (per README; unverified).
- Google Fonts via `next/font/google` (fetched at build, self-hosted at runtime).
- Project deployments fetched and framed: `cw-research-terminal.vercel.app`, `cw.kbsec.com.vn`, `github.com/nigelnh/itch-feed-handler` (link/preview).
- Off-site links: GitHub `nigelnh`, LinkedIn profile.
- No analytics, error tracking, database, auth provider.

## Environment variables (names only)
- `RESEND_API_KEY` (server, required for contact; absent gives 503)
- `CONTACT_TO_EMAIL` (optional; default `CONTACT_EMAIL` constant)
- `CONTACT_FROM_EMAIL` (optional; default hard-coded `portfolio@nhanxnguyen.com`)
- `NEXT_PUBLIC_SITE_URL` (optional; OG base URL)
- `VERCEL_PROJECT_PRODUCTION_URL` (set by Vercel; read in `app/layout.tsx`)
Listed in `.env.example`; the last is not (platform-provided).

## Static assets
`public/`: `Nhan_Nguyen_Resume.pdf` (114 KB), `og.png` (27 KB), `profile.webp` (10 KB), `projects/*.webp` (3, 24-65 KB), `journey/*.jpg` (2, 104-178 KB). `app/icon.svg` favicon. `tools/og-image.html` and `tools/itch-thumb.html` are manual generators for the OG image and ITCH thumbnail (not wired to any script).

## Dead, stale or half-finished
- README and CLAUDE.md describe Vietnamese (removed), a `SoundToggle.tsx` (does not exist), a "PET"/screen-pet and cursor-chasing mode (removed in commit `6e34b1c`; code comment at `useBlobBrain.ts:15` still mentions screen-pet), and 3 submissions/min (code: 5).
- `About.tsx:34-35` comment and optional `hero.pron` handling are left from Vietnamese.
- `lib/site.ts` switches (`showPixelGrid`, `navLabels`) are constants "that were editor props on the artboard".
- `components/icons.tsx` (518 lines) includes "Kit metadata, kept for reference and for any future icon browser" (line ~483); icons not used by any call site are unverified (README lists 16 sprites).
- `PhotoFrame` placeholder labels ("CLASSROOM PHOTO", "CAMPUS PHOTO") are the fallback when images fail; both images currently exist.
- Stack section has no nav entry (SECTIONS has 5 items, page has 6 sections).
- `.claude/launch.json` tracked tooling config.
- `ci.yml` TODOs reference `docs/modernization/backlog.md`, not yet written.
- No tests, no error/404 pages.
