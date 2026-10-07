# Modernization backlog: my-portfolio (2026-10-06)

Sources: `audit.md` (cited as "audit <area>"), `as-built.md`, `decisions.md` (gate decisions, not re-litigated). Slice IDs are stable; ci.yml TODOs cite them: `TODO(tests)` closes in **S6**, `TODO(audit)` in **S1** (or **S5** if the postcss advisory needs the Next major). Tiers per pipeline-rubric (largest matching row wins). Standards: PRs under ~400 changed lines, Conventional Commits, squash merge, coverage floor 80% on changed code only. Every slice that adds a script also adds its CI step. Never run `npm run build` while `npm run dev` runs.

**Recommended execution order:** S1, S2, S6, S7, S3, S4, S8, S23, S9, S5, S10, S11, S12, S13, S14, S20, S16, S17, S18, S15, S19, S21, S24, S25. (S22 deferred.) IDs ascend by priority group, not by execution order; "Depends" is authoritative.

## P0 Safety
### S1 Clear npm audit and in-range bumps (audit Dependencies)
- Tier M (3 config files) · Risk: none · Effort S · Char tests first: no · Depends: none
- Files: `package.json`, `package-lock.json`, `.github/workflows/ci.yml`
- Accept: (1) `npm audit --omit=dev --audit-level=high` exits 0, or each remaining advisory is listed in the PR with S5 as closer (never `audit fix --force` blindly); (2) next/eslint-config-next 15.5.27, react/react-dom/@types/react 19.3.0 applied; (3) `engines.node` (>=22) declared; (4) the audit step is added to CI only once it exits 0.
- Verify: `npm ci && npm audit --omit=dev --audit-level=high && npm run verify && npm run build`
### S2 Security headers and iframe sandbox (audit Security basics, site-wide)
- Tier M · Risk: infra/production config · Effort M · Char tests first: no (S8 later asserts it) · Depends: none
- Files: `next.config.ts` (`headers()`), `components/mac/MacScreen.tsx`
- Accept: (1) `/` returns CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` and frame protection (`frame-ancestors 'none'`); (2) iframe has `sandbox="allow-scripts allow-same-origin"`, `referrerPolicy="no-referrer"`, `loading="lazy"`, and CSP `frame-src` lists only the project origins; (3) manual browser pass on `/` (fonts, images, MacBook `run` preview, blocked card) shows no CSP violations; (4) CSP starts with `'unsafe-inline'` for Next inline scripts, nonce hardening recorded as follow-up.
- Verify: `npm run build && npm run start`, then `curl -sI http://localhost:3000/ | grep -iE 'content-security|nosniff|referrer|permissions|frame'`
### S3 Contact form hardening (audit Security basics, /api/contact; Observability)
- Tier M · Risk: PII/secrets, infra · Effort M · Char tests first: yes (S7) · Depends: S7
- Files: `app/api/contact/route.ts`, `components/sections/Contact.tsx` (honeypot field), `app/globals.css`, route test, `package.json` (add `zod`: standard requires boundary validation), `docs/adr/0002-contact-rate-limit.md`
- Accept: (1) Resend `fetch` has `AbortSignal.timeout` and try/catch; timeout and network failure return 502 `{error:"send_failed"}`, never an unhandled throw; (2) filled honeypot returns 200 `{ok:true}` without calling Resend; Origin not on the allow-list (site URL, localhost in dev) returns 403 (open: confirm no legitimate client omits Origin); (3) zod schema: `.email()`, CR/LF and control chars rejected in name/email, caps 120/200/5000 kept; (4) ADR 0002 decides the durable limiter: recommended Vercel Firewall rate rule (no code or dependency; availability on the plan unverified) plus the in-memory limiter as best effort; Upstash/KV only if abuse is observed.
- Verify: `npm test -- contact && npm run verify`
### S4 Embeddable route hardening (audit Security basics, /api/embeddable)
- Tier S · Risk: none · Effort S · Char tests first: yes (S7) · Depends: S7
- Files: `app/api/embeddable/route.ts`, its test
- Accept: (1) results cached (revalidate several minutes) so repeated calls make no upstream fetch; (2) `clearTimeout` in `finally`; (3) redirects are not followed off the allow-listed host; (4) the spoofed browser User-Agent decision (keep or use an honest UA) is recorded in the PR, not changed silently.
- Verify: `npm test -- embeddable`
### S5 Framework upgrade: Next 16, React 19.3 (audit Dependencies)
- Tier L (cross-cutting) · Risk: infra/production config · Effort M · Char tests first: yes · Depends: S7, S8
- Files: `package.json`, `package-lock.json`, `next.config.ts`, files touched by Next 16 breaking changes (unverified until the codemod/migration guide is run)
- Accept: (1) `npm outdated next react react-dom` shows nothing behind; (2) typecheck, lint, tests, e2e and build pass; (3) `npm audit --omit=dev --audit-level=high` exits 0 and the CI audit step is on; (4) Vercel preview checked by hand before merge (G3). Out of scope: TypeScript 7, `@types/node` 26 (keep aligned with CI Node 22).
- Verify: `npm ci && npm run verify && npm test && npm run test:e2e && npm run build && npm audit --omit=dev --audit-level=high`

## P1 Safety net (pin current behavior before any refactor)
### S6 Vitest harness (audit Tests)
- Tier M (new dependency) · Risk: none · Effort S · Char tests first: no · Depends: none
- Files: `package.json`, `vitest.config.ts`, one sample test under `lib/`, `.github/workflows/ci.yml`; deps `vitest`, `@vitest/coverage-v8`, `jsdom`, `@testing-library/react` (reason: logic and component tests per standards)
- Accept: (1) `npm test` runs and passes; (2) `npm run test:coverage` writes a report, no global floor; (3) CI runs `npm test` and the `TODO(tests)` comment is removed.
- Verify: `npm test && npm run test:coverage`
### S7 Characterization tests (audit Tests: highest-value targets)
- Tier M · Risk: none · Effort M · Char tests first: n/a (this is it) · Depends: S6
- Files: `app/api/contact/route.test.ts`, `app/api/embeddable/route.test.ts`, `components/mac/useTerminal.test.ts`, `components/game/useFeedGame.test.ts` (tests only, no source change)
- Accept: (1) contact: 200/400/429/502/503 and the limiter window pinned with mocked `fetch` and env; (2) embeddable: each `verdict()` reason plus the 400 pinned through `GET`; (3) terminal commands (`ls`, `cd`, `run`, `help`, history) and game scoring (+2, +1, -1, win at 100) pinned; (4) known quirks (unhandled network throw, limiter counting only valid requests) are written as explicit expectations, flipped by S3.
- Verify: `npm test`
### S8 Playwright smoke and axe (audit Tests, Accessibility)
- Tier M · Risk: none · Effort M · Char tests first: no · Depends: S6, S2
- Files: `playwright.config.ts`, `e2e/smoke.spec.ts`, `package.json` (`test:e2e`; deps `@playwright/test`, `@axe-core/playwright`), `ci.yml` (e2e job, chromium only)
- Accept: (1) load `/`, six sections visible; (2) switch to zh, `html lang` becomes `zh-CN`; (3) contact submit with `/api/contact` mocked shows the sent state; (4) axe on `/` reports no serious/critical issue except an explicit allow-list, each entry with an issue reference; security headers from S2 asserted.
- Verify: `npx playwright install chromium && npm run test:e2e`
### S9 Prettier and one format-only commit (audit Types and lint)
- Tier L (50+ files, mechanical) · Risk: touches >200 lines of untested code, mitigated by S7/S8 · Effort S · Char tests first: yes · Depends: S7, S8
- Files: `.prettierrc`, `.prettierignore` (lockfile, `.next`, `public`), `package.json` (`format`, `format:check`), `ci.yml`, then every source file in a separate commit
- Accept: (1) commit 1 is config only; commit 2 is format-only (no logic hunks); (2) `npm run format:check` exits 0 and is a CI step; (3) typecheck, tests and e2e results identical before and after; (4) land before S12-S15 to avoid conflicts.
- Verify: `npm run format:check && npm run verify && npm test && npm run test:e2e`
### S10 eslint off deprecated 9.39, jsx-a11y strict (audit Types and lint)
- Tier M · Risk: none · Effort M · Char tests first: yes · Depends: S5, S7 (check `eslint-config-next` peer range for eslint 10 first; unverified)
- Files: `package.json`, `package-lock.json`, `eslint.config.mjs`, files with new violations
- Accept: (1) `npm ls eslint` shows 10.x; (2) jsx-a11y strict rules on and `npm run lint` passes; (3) any `eslint-disable` has a reason and an issue reference.
- Verify: `npm ls eslint && npm run lint && npm run typecheck`

## P2 Structure
### S11 Housekeeping (gate decision 4; audit i18n completeness, as-built Dead/stale)
- Tier M · Risk: deletes code · Effort S · Char tests first: yes · Depends: S7, S8
- Files: `lib/site.ts` and its consumers (find by grep), `components/sections/About.tsx`, `lib/copy.ts` (`hero.pron`, en and zh), `components/blob/useBlobBrain.ts:15`, `components/icons.tsx`
- Accept: (1) `showPixelGrid` and `navLabels` removed with their branches (both were fixed `true`, so output unchanged); (2) the Vietnamese comment, `hero.pron` handling and the screen-pet comment are gone; (3) each icon-kit entry in `icons.tsx` is used or deleted, with the unused list in the PR; (4) smoke and e2e unchanged.
- Verify: `grep -rnE 'showPixelGrid|navLabels|hero\.pron|Vietnamese|screen-pet' app components lib` (no output), then `npm run verify && npm test && npm run test:e2e`
### S12 noUncheckedIndexedAccess (audit Types and lint)
- Tier M · Risk: none · Effort M · Char tests first: yes · Depends: S7, S9
- Files: `tsconfig.json`, `components/sections/Projects.tsx`, `lib/useActiveSection.ts`, other indexed-access sites the compiler lists
- Accept: (1) flag enabled and `npm run typecheck` passes; (2) no new `!` or `as` casts without a one-line reason; (3) tests and e2e pass.
- Verify: `npm run typecheck && npm test && npm run test:e2e`
### S13 Typed env module (audit Secrets and config)
- Tier M · Risk: secrets · Effort S · Char tests first: yes · Depends: S3, S9
- Files: `lib/env.ts`, `app/api/contact/route.ts`, `app/layout.tsx`, `lib/env.test.ts`
- Accept: (1) `process.env` is read only in `lib/env.ts` (grep) and `NEXT_PUBLIC_*` stay statically referenced; (2) a malformed `NEXT_PUBLIC_SITE_URL` fails the build; a missing `RESEND_API_KEY` still yields 503; (3) no secret reaches client code.
- Verify: `grep -rn 'process\.env' app components lib` (only `lib/env.ts`), `npm test && npm run build`
### S14 Split oversized files (audit Structure and boundaries)
- Tier L · Risk: rewrites >200 lines of untested code · Effort L (one PR per file family, each under 400 lines) · Char tests first: yes · Depends: S8, S9, S11
- Files: `lib/copy.ts` (to `lib/copy/{en,zh,meta}.ts`, `CONTACT_EMAIL` into `meta`), `app/globals.css` (per-feature CSS, same tokens and cascade order), `components/icons.tsx`, pure rule table out of `components/blob/useBlobBrain.ts`
- Accept: (1) no split file over ~300 lines (`wc -l`); (2) `STRINGS: Record<LangId, Strings>` parity still enforced by typecheck and `@/lib/copy` re-exports keep consumers unchanged; (3) side-by-side manual screenshots of `/` at 1280 and 390 px, en and zh, match the pre-split ones; (4) the extracted blob rules have unit tests.
- Verify: `wc -l app/globals.css lib/copy/*.ts components/icons.tsx components/blob/useBlobBrain.ts && npm run verify && npm test && npm run test:e2e`
### S15 Server-rendered sections and language delivery (audit Structure, Accessibility/i18n)
- Tier L · Risk: rewrites untested code · Effort L · Char tests first: yes · Depends: S8, S9, S11, S14; needs a human decision at G2, recorded as `docs/adr/0003-language-delivery.md`
- Options: cookie-read in the layout (correct `<html lang>`, no URL change) or a `/zh` route with `hreflang` (indexable zh); decide before building.
- Files: `components/Portfolio.tsx`, `lib/i18n.tsx`, `app/layout.tsx`, section components, ADR 0003
- Accept: (1) `"use client"` leaves `Portfolio.tsx`; static sections render on the server; (2) a returning zh visitor gets `lang` and zh text in the first HTML, with no English flash (Playwright); (3) `/` first-load JS in the build table is not larger than before (record before and after).
- Verify: `npm run build` (compare size table), `npm run test:e2e`

## P3 Contracts
### S16 API contract, RFC 9457 errors, request id (audit Observability; Comparison #15)
- Tier M · Risk: none (only the site's own client calls these routes) · Effort M · Char tests first: yes · Depends: S3, S4, S7
- Files: `docs/pipeline/<yyyymmdd>-api-contract/openapi.yaml`, both route files, `lib/problem.ts`, `components/sections/Contact.tsx`, `lib/copy` (en and zh), contract test
- Accept: (1) the OpenAPI 3.1 file lints clean and holds realistic examples; (2) errors are `application/problem+json` with a stable `type`, `X-Request-Id` returned and written to a structured log line without PII; (3) 429 carries `Retry-After`; the UI shows distinct en/zh messages for 429, 502 and 503; (4) a contract test checks handler output against the spec examples. Open: `Idempotency-Key` on `POST /api/contact` or a written waiver; keep unversioned `/api/*` paths or move to `/api/v1`.
- Verify: `npx --yes @stoplight/spectral-cli lint docs/pipeline/*-api-contract/openapi.yaml && npm test`

## P4 Design and accessibility (design source: Claude Design artboard; Figma seat is View-only)
### S17 Game keyboard access (gate decision 1; audit Accessibility)
- Tier M · Risk: none · Effort M · Char tests first: yes · Depends: S7, S8
- Files: `components/game/FeedGame.tsx`, `components/game/useFeedGame.ts`, game CSS, tests
- Accept: (1) focused slider moves with Arrow keys (Home/End too) and updates `aria-valuenow`; `aria-valuemax` no longer reads a ref during render; (2) intro, play and won/lost overlays are completable by keyboard alone; (3) pointer control and scoring unchanged (S7 tests green); (4) axe clean on the game panel.
- Verify: `npm test && npm run test:e2e`
### S18 Navigation accessibility (audit Accessibility)
- Tier M · Risk: none · Effort M · Char tests first: yes · Depends: S8, S10, S11
- Files: `components/Nav.tsx`, `components/sections/About.tsx` (import `scrollToSection` from a shared lib instead of `Nav.tsx`), `components/sections/Experience.tsx`, `app/layout.tsx`, `lib/copy` (aria-labels en and zh)
- Accept: (1) first Tab focuses a skip-to-content link that reaches `main`; (2) nav clicks update `location.hash`, Back works and focus moves to the section; (3) inactive tabpanels are `hidden`; (4) hard-coded aria-labels come from copy.
- Verify: `npm run test:e2e`
### S19 Contrast and focus indicators (audit Accessibility)
- Tier S · Risk: none · Effort S · Char tests first: no · Depends: S8, S14
- Files: CSS tokens and form styles (post-split)
- Accept: (1) axe `color-contrast` reports 0 issues on `/` in en and zh and the S8 allow-list shrinks accordingly; (2) input focus meets 2.4.11 and 1.4.11 on a manual keyboard pass.
- Verify: `npm run test:e2e`
### S20 Error and 404 pages (audit Observability)
- Tier M · Risk: none · Effort S · Char tests first: no · Depends: S6
- Files: `app/error.tsx`, `app/not-found.tsx`, `app/global-error.tsx`, `lib/copy` (en and zh)
- Accept: (1) an unknown path returns HTTP 404 with a branded page and a home link; (2) `error.tsx` renders a message and a Retry button (component test); (3) axe clean on both pages.
- Verify: `npm run build && npm run start`, `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/nope` (404), `npm test`
### S21 Stack has no nav entry: durable decision (as-built Dead/stale)
- Tier S · Risk: none · Effort S · Char tests first: no · Depends: S8; human picks A or B
- Options: A add a Stack link (label and icon, en and zh, six items in rail and tab bar); B keep it unlinked on purpose and document it.
- Files: `docs/modernization/decisions.md`, `lib/copy.ts` (`SECTIONS` comment or entry), `components/Nav.tsx` (A only)
- Accept: (1) the choice is recorded with a date in `decisions.md`; (2) A: six nav items in both languages and the tab bar usable at 320 px; B: a `SECTIONS` comment cites the decision and a test pins five links; (3) scroll-spy behavior while in Stack is defined and tested.
- Verify: `npm test && npm run test:e2e`
### S22 Figma component library: DEFERRED
- Not scheduled: the Figma seat is View-only and the design source is the Claude Design artboard. Revisit if the seat is upgraded. Tier L, Effort L.

## P5 Operations
### S23 README and CLAUDE.md correction (gate decision 3; audit Docs)
- Tier S · Risk: none · Effort S · Char tests first: no · Depends: none (cheap, can go any time)
- Files: `README.md`, `CLAUDE.md`
- Accept: (1) no Vietnamese, `SoundToggle.tsx` (use `BlobSettings.tsx`), PET/screen-pet or cursor-chasing text; (2) contact limit reads 5 per minute per IP, matching the code (update if S3 changes it); (3) every file path named in the README exists; (4) CLAUDE.md stale notes are removed and test commands added as slices land.
- Verify: `grep -nE 'Vietnamese|SoundToggle|\bPET\b|screen-pet|chas(e|ing)' README.md CLAUDE.md` (no output)
### S24 CI closeout and deploy verification (audit CI/CD)
- Tier M · Risk: infra/production config · Effort S · Char tests first: no · Depends: S1, S6, S8, S9
- Files: `.github/workflows/ci.yml`, `.github/dependabot.yml`, `.gitignore` (`.claude/launch.json`: decide), `docs/modernization/decisions.md`
- Accept: (1) CI runs frozen install, typecheck, lint, format check, test, build, e2e, audit, and no `TODO` is left without an issue reference; (2) Dependabot npm config confirmed or fixed; (3) Vercel project settings (Node version, env var names, production branch) checked and recorded (unverified until then).
- Verify: `grep -n TODO .github/workflows/ci.yml` and a green PR run
### S25 SEO files and web-vitals measurement (audit SEO, Performance)
- Tier M · Risk: none · Effort M · Char tests first: no · Depends: S13, S15
- Options: `@vercel/speed-insights` (one dependency, real-user data, Vercel only) or Lighthouse in CI (no runtime dependency, lab data).
- Files: `app/robots.ts`, `app/sitemap.ts`, `app/layout.tsx` (canonical, JSON-LD Person), `package.json` or `ci.yml`
- Accept: (1) `/robots.txt` and `/sitemap.xml` return 200 on a production build; (2) a production build never emits a localhost `metadataBase`; (3) LCP under 2.5 s, INP under 200 ms, CLS under 0.1 measured once and recorded.
- Verify: `npm run build && npm run start`, `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/robots.txt`

## Suggested first three slices
1. **S1**: cheapest, clears the 3 high advisories and turns the CI audit TODO into a gate.
2. **S2**: highest risk reduction for small effort (no headers today, unsandboxed third-party iframe), and it needs no tests.
3. **S6**: unblocks S7 characterization tests, which gate S3, S4, S5 and every refactor.
