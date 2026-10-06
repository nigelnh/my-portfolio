# Audit: my-portfolio (2026-10-06)

Scope: tracked files on `chore/pipeline-bootstrap` (53 tracked, 33 commits). Read-only. Previously verified by the conductor: `npm ci`, `typecheck`, `lint`, `build` pass; no tests; no CI before this branch. I ran `npm audit --omit=dev` and `npm outdated` only. Line numbers are 1-based within the cited file.

## Scorecard (0 = absent/unsafe, 1 = weak, 2 = adequate, 3 = meets standard)

| Area | Score | Top fix |
| --- | --- | --- |
| Structure and boundaries | 2 | Split `app/globals.css` and `lib/copy.ts`; make page server-rendered |
| Tests | 0 | Add Vitest for the two API routes, then Playwright smoke + axe |
| Types and lint | 2 | Add `noUncheckedIndexedAccess`, `jsx-a11y` rules, Prettier |
| Dependencies | 1 | Bump next/react patch versions, `npm audit fix`, move eslint off deprecated 9.39 |
| Secrets and config | 3 | Add a typed env module (zod); keep as is otherwise |
| Security basics | 1 | Security headers + durable rate limit + honeypot on contact; sandbox the iframe |
| CI/CD and deploy | 1 | Add audit step, tests; Vercel config is implicit (unverified) |
| Docs and onboarding | 1 | README and CLAUDE.md are stale (Vietnamese, rate limit, SoundToggle) |
| Accessibility and performance | 1 | Keyboard control for game slider; fix contrast; stop client-rendering whole page |
| Observability and error handling | 1 | Structured logging, request id, error boundary, route timeouts |

## 1. Structure and boundaries: 2
Evidence:
- Clean feature folders: `components/{blob,game,mac,sections}`, `lib/`, `app/api/*`. Root `app/page.tsx` is 5 lines.
- Files over the ~300-line guideline: `app/globals.css` (2132 lines, every component's styles), `lib/copy.ts` (731), `components/blob/useBlobBrain.ts` (491), `components/icons.tsx` (518), `components/game/useFeedGame.ts` (337), `components/mac/MacScreen.tsx` (291, near limit).
- `components/Portfolio.tsx:1` is `"use client"` and wraps the entire page in the language provider, so every section (including static About/Journey/Stack text) ships and hydrates as client code. Standard says Server Components by default.
- `components/sections/About.tsx` imports `scrollToSection` from `components/Nav.tsx` (component-to-component util coupling; minor).
- `lib/copy.ts` mixes content, types, language-independent metadata and the contact email constant (`CONTACT_EMAIL`, line 718), which the API route also imports, so server code depends on the content module.
Gap vs standards-web: "Server Components by default", "flag files over ~300 lines".
Top fix: split `globals.css` per feature (CSS modules or colocated files), split `copy.ts` into `copy/en.ts`, `copy/zh.ts`, `meta.ts`; move language state to a thin client provider and render sections as server components.

## 2. Tests: 0
- No test runner in `package.json` devDependencies, no `*.test.*` files, no Playwright. `package.json` scripts: dev, build, start, lint, typecheck, verify only.
- Coverage: not measurable.
- Highest-value characterization targets: `app/api/contact/route.ts` validation and rate limit, `app/api/embeddable/route.ts` `verdict()`, `components/mac/useTerminal.ts` command parser, `components/blob/useBlobBrain.ts` rule table (pure-able), `useFeedGame.ts` scoring.
Gap: Vitest, Playwright, axe in e2e, coverage floor on changed code (all absent).
Top fix: Vitest + route-handler tests first (pure functions, no network; mock `fetch`), then one Playwright flow (load, switch language, submit contact with mocked route) with axe.

## 3. Types and lint: 2
- `tsconfig.json:7` `"strict": true`; no `noUncheckedIndexedAccess` (grep returned nothing). Code already uses `[0]`/`[i]` access freely, e.g. `components/sections/Projects.tsx` `projectsMeta[i].id`, `lib/useActiveSection.ts` `SECTIONS[0].id`; those would need touching.
- `eslint.config.mjs` extends `next/core-web-vitals` and `next/typescript` (includes a few jsx-a11y rules via next, not the full plugin). No Prettier config.
- `app/api/embeddable/route.ts:125` uses `p.url as string` cast; `route.ts` contact line 46 uses `!` non-null assertion. Minor.
- No `any` found by grep. i18n type safety: `STRINGS: Record<LangId, Strings>` (`lib/copy.ts:624`) forces `en` and `zh` to share the exact same keys at compile time.
- eslint 9.39.5 is deprecated (conductor's note); `npm outdated` shows latest 10.12.0.
- API bodies are validated with hand-rolled `typeof` checks, not zod (standard: zod at the boundary).
Top fix: add `noUncheckedIndexedAccess`, zod schemas for both routes, `eslint-plugin-jsx-a11y` strict config, Prettier then one format-only commit.

## 4. Dependencies: 1
Only 3 runtime deps (`next ^15.5.4`, `react ^19.1.1`, `react-dom ^19.1.1`); lockfile committed; `.npmrc` sets `package-lock=true`.
`npm audit --omit=dev`: 4 vulnerabilities (1 moderate, 3 high), all transitive:
- `postcss <=8.5.22` (bundled inside next): high, 4 advisories (XSS via `</style>` GHSA-qx2v-qp2m-jg93; sourceMappingURL file read GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849). Audit says fix needs `npm audit fix --force` (likely a breaking Next jump, unverified which).
- `sharp <0.35.5` (used by next/image): high, GHSA-wq5f-xc86-pv6w (librsvg). `npm audit fix` available.
- `source-map-js 1.0.0-1.2.1`: high, GHSA-68fv-2mgg-jv7q (DoS). `npm audit fix` available.
- One moderate: not itemised in the output I captured (unverified which package).
Exposure is low in practice (no user-supplied CSS or SVG is processed at runtime; unverified for production image optimizer inputs, but `next/image` only serves local files), but CI should not stay red/ignored.
`npm outdated`: next 15.5.25 -> wanted 15.5.27 (latest 16.3.8), react/react-dom 19.2.8 -> 19.3.0, @types/react 19.2.18 -> 19.3.0, eslint-config-next 15.5.25 -> 15.5.27, eslint 9.39.5 deprecated (latest 10.12.0), typescript 5.9.3 (latest 7.0.2), @types/node 22 (latest 26).
`.github/dependabot.yml` exists (conductor baseline) and covers github-actions at least; npm coverage not verified by me.
Top fix: `npm audit fix`, bump next/react within range, then add `npm audit --omit=dev --audit-level=high` to CI (the TODO in ci.yml).

## 5. Secrets and config: 3
- `.gitignore:` ignores `.env*` except `!.env.example`; `.env.example` holds names only (RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, NEXT_PUBLIC_SITE_URL), values blank.
- History: `git log --all --diff-filter=A` shows only `.env.example` ever added among env files. A pattern search over history for Resend-style (`re_...`), `sk-`, and `API_KEY=<value>` strings found nothing (shallow search; unverified against other secret formats; no scanner such as gitleaks available).
- `RESEND_API_KEY` only read in `app/api/contact/route.ts:50`, never `NEXT_PUBLIC_`.
- A personal email address is hard-coded in `lib/copy.ts:718` (intentionally public contact info; not a secret, but PII in source).
- Gaps vs standard: env vars are read ad hoc in `app/api/contact/route.ts:14-16,50` and `app/layout.tsx:23-28`, not through one typed validated module. `FROM` defaults to a hard-coded address on `nhanxnguyen.com`.
Top fix: `lib/env.ts` with zod; fail loudly at boot for malformed values.

## 6. Security basics: 1
### /api/contact (`app/api/contact/route.ts`)
Good:
- Server-side key (line 50), 503 `not_configured` when absent (51-53), `request.json()` try/catch (55-60), type checks (62-65), trim + length caps name 120 / email 200 / msg 5000 (19, 67-71), regex email check (72), HTML-escaped html body (44-47, 95-97), provider error body never echoed (101-104), `reply_to` set to visitor (92).
Findings:
- **Header/subject injection, low risk**: `subject` includes `clean.name` (line 93) unsanitised; name is not stripped of CR/LF. Resend takes JSON, not raw SMTP headers, so classic header injection is unlikely, but control characters in `name` still reach the subject and `reply_to` accepts anything matching `^[^@\s]+@[^@\s]+\.[^@\s]+$` (may include `,`, `<`, `>`). Reject control chars; use stricter email validation (zod `.email()`).
- **Rate limit is weak**: in-memory `Map` per serverless instance (lines 28-42), so it does not hold across Vercel instances/cold starts. Keyed on the first `x-forwarded-for` entry (76-77), which on non-Vercel hosts is client-spoofable; fallback key `"unknown"` makes all unidentifiable clients share one bucket. 5 per minute per IP (27) is generous for a personal inbox; README says three (stale). No daily cap, no CAPTCHA/honeypot/Turnstile. Limiter runs after validation and counts only valid requests, so malformed floods are unthrottled (cheap, but note).
- **No outbound timeout** on the Resend `fetch` (line 82): a hung provider ties up the function until platform timeout; no try/catch around `fetch`, so a network error throws an unhandled 500 (unverified how Next formats it) instead of the `send_failed` JSON.
- **No Origin/CSRF check or CORS policy**: no CORS headers are set, so cross-origin browsers cannot read responses by default, but any origin can still POST (simple `text/plain` JSON is parsed by `request.json()`). Add an Origin allow-list.
- Error shape is `{error: "<code>"}`, not RFC 9457; no request id (standards-api gap).
- Notification spoofing: attacker-chosen `name` and `email` land in an email to the owner; acceptable for a contact form.
### /api/embeddable (`app/api/embeddable/route.ts`)
- SSRF mitigated: only URLs exactly matching `projectsMeta[].url` are fetched (lines 124-126, 145). Good. `redirect: "follow"` (155) means a redirect from an allow-listed host could land anywhere; it is a HEAD/GET with the response used only for header inspection, but still follows into internal addresses if an upstream is compromised (low).
- Unauthenticated and unrate-limited: each call performs up to two upstream fetches with a spoofed browser User-Agent (159-160) and `cache: "no-store"` (156). Amplification/abuse of the owner's client deployments, and the spoofed UA is questionable. Add caching (`revalidate` several minutes) which also helps performance.
- The 6 s timeout is cleared only on the success path (`clearTimeout` at line 165 not in `finally`; on throw the timer still fires harmlessly).
- Response: HTTP 200 `{embeddable, reason}` even for upstream failure; 400 `{error:"unknown project url"}`.
### Site-wide
- `next.config.ts` has only `reactStrictMode` (7 lines): **no security headers** (CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors`/`X-Frame-Options`, `Permissions-Policy`). There is no `middleware.ts`, no `vercel.json` (unverified whether Vercel project settings add any).
- `components/mac/MacScreen.tsx:252` renders third-party deployments in an `<iframe>` with **no `sandbox` or `referrerPolicy` attribute**. Add `sandbox="allow-scripts allow-same-origin"` (and `referrerPolicy="no-referrer"`, `loading="lazy"`).
- Authz is not applicable (no auth, no stored user data). `dangerouslySetInnerHTML`: none found.
- `target="_blank"` links use `rel="noreferrer"` or `noopener noreferrer` (Contact.tsx, Projects.tsx, MacScreen.tsx:~270): fine.
Top fix: add security headers in `next.config.ts` `headers()`, put the contact limiter on a shared store (Upstash/Vercel KV) or Vercel firewall rule, add honeypot + timeout + try/catch around the Resend call.

## 7. CI/CD and deploy: 1 (before this branch: 0)
- `.github/workflows/ci.yml` (conductor baseline) steps: checkout, setup-node 22 with npm cache, `npm ci`, `typecheck`, `lint`, `build`. Accuracy check: all three scripts exist in `package.json`; `npm ci` is valid because `package-lock.json` is committed; Node 22 matches `@types/node ^22`. `engines` is not declared in `package.json` (no Node version pin for Vercel; gap). The TODO comments reference `docs/modernization/backlog.md`, which does not exist yet (only this audit and as-built are written); the TODOs lack issue references, which standards-web forbids ("no TODO without an issue reference").
- `npm run build` in CI will fetch Google Fonts at build (`next/font/google`, `app/layout.tsx:2`); needs network on the runner, fine on GitHub-hosted, flaky offline.
- Missing from the standard CI baseline: tests, e2e against a preview, dependency audit (currently would fail: 3 high).
- Deploy: Vercel (per README/CLAUDE.md; `.vercel` is gitignored; no `vercel.json`). Project settings, env vars and domain are unverified (no network).
- `.claude/launch.json` is tracked (11 lines), local tooling config; harmless but consider ignoring.
Top fix: add audit + tests jobs; declare `engines.node`; reference issues in TODOs.

## 8. Docs and onboarding: 1
Stale or wrong, verified against the repo:
- **CLAUDE.md** line 1-3 and Stack: claims "English, Vietnamese and Chinese" and "Three languages". Commit `cc1ed01 "Drop the Vietnamese version"` removed Vietnamese; `LANGS` in `lib/copy.ts:11-14` has only `en` and `zh`. CLAUDE.md "Three languages: visible text goes through lib/copy.ts" is also not fully true (see i18n below). The rest of CLAUDE.md (commands, build-vs-dev gotcha, env names) matches `package.json` and `.env.example`.
- **README.md**: says three languages; lists `SoundToggle.tsx` (file does not exist; the toggle is `components/blob/BlobSettings.tsx`); says rate limit is "three submissions per IP per minute" (code: `MAX_PER_WINDOW = 5`, route.ts:27); describes a "PET" screen-pet mode and cursor chasing that commit `6e34b1c "Drop screen-pet mode..."` removed (grep for "pet" toggle in components finds only the sound toggle; the PET/contained section is likely dead documentation, unverified in `useBlobBrain.ts`); documents VI in `Content` section ("STRINGS.en/.zh" is correct there). Also links a claude.ai design project URL (external, unverified).
- No CONTRIBUTING, no LICENSE (unverified none exists beyond tracked list: none tracked).
- `docs/adr/` has 0001 (conductor baseline).
Top fix: reconcile README/CLAUDE.md with code (drop Vietnamese, pet mode, SoundToggle; fix 5/min).

## 9. Accessibility and performance: 1
Accessibility (static review only; no axe or browser run, so contrast numbers computed by hand are noted as such):
- Positive: skip of motion via `@media (prefers-reduced-motion: reduce)` (`globals.css:384-394`) plus JS check in `BlobStage.tsx:10-18` that disables the blob brain; global `:focus-visible` outline 3px (`globals.css:90-93`); `aria-current` on nav links (Nav.tsx:41,74); `aria-pressed` on language and sound buttons; roving tabindex tablist with arrow keys in `Experience.tsx:20-35`; `role="alert"` for form error (`Contact.tsx:111`); iframe has `title`; `alt` text on all `next/image` uses (profile "Nhan Nguyen", project titles, photo labels); nav `aria-label="Sections"` on both navs.
- **Inputs lose the outline**: `globals.css:84-88` sets `input:focus, textarea:focus { outline: none; box-shadow: 3px 3px 0 var(--ink) }`. A 3px offset hard shadow is a visible indicator but relies on the shadow alone; check it meets WCAG 2.4.11/1.4.11 3:1 (shadow colour `--ink` #12304d on `--panel` #eaf3fa is high contrast, so probably passes; unverified visually).
- **Game slider not keyboard operable**: `components/game/FeedGame.tsx:94-99` exposes `role="slider"` with `tabIndex=0` but there are no key handlers anywhere in `components/game` (grep for `keydown`/`ArrowLeft` returned nothing); only pointer drag works. WCAG 2.1.1 fail; also `aria-valuemax` reads `arenaRef.current` during render. The game is optional content, so either add arrow-key movement or mark it `aria-hidden` plus a skip link.
- Blob and terminal: `BlobStage.tsx:106-107` dialog role without focus management (unverified); terminal input is a plain input (OK); `MacScreen.tsx:200` `role="presentation"` wrapper (check it is not hiding interactive content).
- Experience tabpanels use `aria-hidden={!active}` (Experience.tsx:66) on every panel; inactive ones should also be `hidden` so they are not reachable by tab (unverified in CSS).
- Palette contrast, computed by hand from tokens in `globals.css:5-25`: `--ink` #12304d on `--panel` #eaf3fa is about 11:1 (good); `--muted` #2c5a80 on `--panel` about 6:1 (good); `--on-bar` #cfe4f5 on bar colours unverified (title-bar backgrounds not inspected); `--accent-soft` #7fb0d6 and `--sky`/`--mint`/`--rose` as text or borders not verified. Run axe to confirm.
- Hard-coded `aria-label` strings not through i18n: `Nav.tsx:32,68` ("Sections"), `MacScreen.tsx:~283` ("Back to the shell"), `Nav.tsx:34` alt "Nhan Nguyen".
- `<html lang="en">` in `app/layout.tsx:244`; switched client-side to `zh-CN` in `lib/i18n.tsx:47-49` after hydration. Crawlers and screen readers on first paint see `en` only; the saved language is applied in an effect (`i18n.tsx:38-45`), causing a flash of English then Chinese (CLS/FOUC) for returning zh visitors.
- Sticky nav: left rail from 880px, fixed bottom tab bar below; scroll-spy uses `offsetTop` per scroll frame (cheap). `scrollToSection` hijacks anchor clicks with `preventDefault` (Nav.tsx:43,76) so the URL hash never updates and back button won't work; focus does not move to the target section (keyboard users stay on the nav link).
- Nav has no skip-to-content link and `main` has no skip target (unverified in layout: none present).
Performance:
- `next/font` used for IBM Plex Mono (3 weights) and Pixelify Sans (3 weights), latin subset only, `display: swap` (layout.tsx:5-17). CJK falls back to system fonts (`--font-cjk`, globals.css:31), no web font: good for weight, inconsistent rendering.
- Images: `next/image` everywhere. Assets: `public/profile.webp` 9.8 KB, three project `.webp` 24-65 KB, `public/journey/*.jpg` 178 KB + 104 KB (JPEG, optimizer converts on demand), `og.png` 26 KB. Resume PDF 114 KB. Image weight is modest. `PhotoFrame` and `Thumb` use `onError` fallback state (client components).
- No `priority`/lazy tuning beyond the profile image; no bundle analyser. The build output size table was not re-run per instructions (unverified): the whole page is one client tree (Portfolio.tsx:1), plus ~4k lines of client logic (blob 900, game 650, mac 500, sfx 239).
- Timers: blob uses chained `setTimeout` plus a 1 s `setInterval` (`useBlobBrain.ts:452`), game uses `requestAnimationFrame` loop only while playing (`useFeedGame.ts:147,211`) and cleans up refs. Blob animation is CSS-driven. Per-frame React state updates for the game (`blobX`) render at 60 fps (unverified profiling). Fine for the content, but INP/LCP not measured.
- `/api/embeddable` uses `no-store` and is called on each `run` (see above).
- No Lighthouse/CWV measurement possible without running the app; unverified.
Top fix: make sections server components, add keyboard control to the game, add skip link and hash-updating scroll, run axe + Lighthouse in CI.

### i18n completeness
- Languages: en, zh (`lib/copy.ts:11-14`). Vietnamese was removed (`cc1ed01`) but vestiges remain: a comment in `About.tsx:34-35` ("Vietnamese leaves this empty") and `hero.pron` optional handling.
- Key parity: guaranteed by TypeScript, `STRINGS: Record<LangId, Strings>` with both `en` and `zh` typed as `Strings` (typecheck passes). Values were not proofread; count of the two `id: "hcmc"/"gettysburg"` blocks match (lines 210/219 and 438/446).
- Hard-coded, untranslated strings: `<title>`/description/OG metadata in English only (`app/layout.tsx:25-33,53-58`), `og:locale` en_US with `alternateLocale zh_CN` but there is no separate zh URL (no `/zh` route, no `hreflang`), `aria-label`s above, `lib/copy.ts` links labels (`links`), terminal output in `components/mac/useTerminal.ts` (help text; presumably English; unverified), project titles in `MacScreen` `titles` map (unverified source). The lang switch is client-only, so zh content is not indexable.
- Language chosen via localStorage only; no `Accept-Language` negotiation.

## 10. Observability and error handling: 1
- Only logging: `console.error("resend send failed", res.status)` at `app/api/contact/route.ts:103` (no request id, no structured format; standard bans `console.log`, `console.error` here is arguably intentional).
- No `app/error.tsx`, `app/not-found.tsx`, or `global-error.tsx` among tracked files; no analytics, no Sentry, no Vercel Analytics/Speed Insights (not in dependencies).
- Contact form: UI has error and sent states, a busy state via `disabled`; the 429 vs 502 vs 503 cases collapse into one generic `errSend` message (`Contact.tsx` catch). Empty/loading/error/success: contact OK, iframe preview has loading/blocked, projects have failed-image fallback.
- `fetch` to Resend lacks try/catch/timeout (see Security).
Top fix: add `app/error.tsx` + `not-found.tsx`, log with a request id, enable Vercel Speed Insights/Web Vitals.

## SEO and Open Graph
- `app/layout.tsx`: title, description, `metadataBase` (from `NEXT_PUBLIC_SITE_URL` or `VERCEL_PROJECT_PRODUCTION_URL`, localhost fallback), OpenGraph (type website, image `/og.png` 1200x630 with alt), Twitter `summary_large_image`, `themeColor`. Good baseline. `public/og.png` exists (26 KB); generated from `tools/og-image.html`.
- Gaps: no `robots.ts`/`sitemap.ts`, no canonical/`alternates`, no JSON-LD (`Person`), no `hreflang`, `og:locale` en_US only; localhost fallback for `metadataBase` would emit localhost OG URLs if env is missing on a non-Vercel host. Single-page site, so low impact. `app/icon.svg` exists (favicon).

## Comparison against standards-web: named gaps
1. No `noUncheckedIndexedAccess` (strict only).
2. No zod validation at API boundaries; no typed env module.
3. Whole page is a client component tree (not Server Components by default).
4. Files over 300 lines: globals.css, copy.ts, icons.tsx, useBlobBrain.ts, useFeedGame.ts.
5. No Vitest, no Playwright, no axe, no coverage tooling.
6. No `jsx-a11y` strict config, no Prettier.
7. No security headers/CSP; iframe unsandboxed.
8. No `npm audit` in CI; audit currently shows 3 high.
9. CI lacks tests, e2e and audit; TODOs in ci.yml have no issue references.
10. WCAG 2.2 AA: game slider not keyboard-operable; hash-less scroll hijack; no skip link; contrast unverified.
11. Design tokens: `components` has only one hex literal outside sprites/icons (`app/layout.tsx:64` themeColor, unavoidable); sprites/icons embed hex fills by design (kit art). Token discipline is good. (standards-web "never hard-code a hex in a component": icons.tsx/sprites.tsx hold many; accepted as artwork.)
12. Empty/loading/error/success states: mostly present, no global error/404 pages.
13. Docs stale (README/CLAUDE.md).
14. No `console.log` found; `TODO`/`FIXME` grep in source returned none (only ci.yml baseline TODOs).
15. standards-api gaps for the two routes: no OpenAPI contract, errors not RFC 9457, no request id, no rate-limit headers, no `Retry-After` on 429.

## Priority list (proposal)
P0: security headers; iframe sandbox; contact route hardening (timeout, try/catch, Origin check, honeypot, durable limit); `npm audit fix` and patch bumps.
P1: Vitest for routes and pure logic; Playwright + axe; game keyboard control; fix docs; error/404 pages.
P2: server-component refactor; split globals.css/copy.ts; env module; `noUncheckedIndexedAccess`; SEO files; Speed Insights.
