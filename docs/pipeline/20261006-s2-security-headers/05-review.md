# 05-review: S2 Security headers and iframe sandbox

- Branch: `feat/security-headers` (a48b668), base 135f1e8. Diff: `next.config.ts` (+42), `components/mac/MacScreen.tsx` (+3), `04-build.md` (+40). No other files.
- Reviewer: Opus (implementer was Sonnet). Risk flag: infra/production config.

## Verdict: APPROVE

0 blockers, 0 majors, 5 minors, 3 nits. The policy is syntactically valid, reaches every route (pages, `/api/*`, `/_next/static`, `public/` files, 404), does not break `next dev` or `next start`, and a scripted headless Firefox pass on both servers showed **zero** `securitypolicyviolation` events (fonts, all six images, inline bootstrap, `/api/embeddable`, `/api/contact`, framed KB Securities preview, blocked cards). The minors are least-privilege and defense-in-depth items. They can land in this PR or as follow-ups. Before merge, the owner still has to do a Chrome/Safari pass and check the Vercel preview (see "Not verified").

## Findings

### F1 minor: `frame-src` grants `https://github.com`, which this site never frames
- `next.config.ts:7`, `next.config.ts:22`
- Evidence: the iframe only renders when `frameState === "live"` (`components/mac/MacScreen.tsx:243-252`). That state is set only when `/api/embeddable` returns `embeddable: true` (`MacScreen.tsx:163-166`). GitHub sends `x-frame-options: deny` and `frame-ancestors 'none'`, so the route's `verdict()` (`app/api/embeddable/route.ts:20-33`) always says no:
  ```
  curl /api/embeddable?url=https://github.com/nigelnh/itch-feed-handler
  {"embeddable":false,"reason":"x-frame-options: deny"}
  ```
  In headless Firefox, `run itch` gave `{"frame":"blocked","iframe":false}` and no child browsing context. So the grant is never used. GitHub is a third-party host the owner does not control, so it is dead privilege. AC2's wording ("only the project origins") is literally met, but least privilege says drop it.
- Fix: add a `frameable: false` flag to the ITCH entry in `projectsMeta` (or keep a small deny-list of hosts known not to allow framing) and filter on it in `next.config.ts`. That still keeps the list derived from `projectsMeta`. Optionally let the UI skip the `/api/embeddable` round trip for that flag.
- Related observation (no action needed): `https://cw-research-terminal.vercel.app/` **also** sends `x-frame-options: DENY` today (`curl -sI`). The route reports `embeddable:false`, so that preview also shows the blocked card. The deployment belongs to the owner, so keeping its origin is reasonable (they may enable framing later). However, `04-build.md` manual step 3 ("iframe loads in the sandbox" for cw-research-terminal) is wrong. Today only `cw.kbsec.com.vn` actually frames.

### F2 minor: no `X-Frame-Options` header
- `next.config.ts:35-43`
- Evidence: the production `curl -sI /` has `frame-ancestors 'none'` in the CSP and no `X-Frame-Options` line (full headers quoted below).
- Assessment: `frame-ancestors` is honoured by every current browser (Chrome, Edge, Firefox, Safari), so AC1 is met. IE11 and some old embedded WebViews ignore `frame-ancestors`. OWASP still recommends sending both, and header scanners flag the missing XFO.
- Fix: add `{ key: "X-Frame-Options", value: "DENY" }`. It costs nothing and does not conflict (browsers that support CSP2 use `frame-ancestors` first).

### F3 minor: Vercel preview deployments will log CSP violations from the Vercel Toolbar
- `next.config.ts:16-22`
- Evidence (from platform behaviour, not tested here): on preview deployments Vercel injects its toolbar/comments script and frame from `https://vercel.live`. `script-src 'self' 'unsafe-inline'`, `connect-src 'self'` and `frame-src` do not allow that host. The site targets Vercel (`app/layout.tsx:27-32` reads `VERCEL_PROJECT_PRODUCTION_URL`). Production is unaffected. But a G3 manual pass done on a preview will show "Refused to load ... vercel.live" errors, which contradicts AC3 unless that noise is expected.
- Fix: either add `https://vercel.live` to script-src/connect-src/img-src/style-src/font-src/frame-src only when `process.env.VERCEL_ENV === "preview"`, or turn off the toolbar for the project, or write down in the PR that toolbar violations on previews are expected.

### F4 minor: `new URL(p.url)` runs at config load and has no guard
- `next.config.ts:7`
- Evidence: `app/api/embeddable/route.ts:17` and `components/mac/useTerminal.ts` ("Widened so the guard survives every project currently having a URL") both expect a project without a URL. An empty or relative `url` would make `new URL` throw inside `next.config.ts`, which fails `next dev`, `build` and `start` with a config error.
- Fix: `projectsMeta.flatMap((p) => (p.url ? [new URL(p.url).origin] : []))`, the same pattern the embeddable route uses.

### F5 minor: no automated assertion of the headers yet
- Evidence: the slice adds no test. Backlog S2 says "Char tests first: no (S8 later asserts it)", so this is accepted. Until S8 lands, a regression in `headers()` (for example someone narrowing `source`) would ship silently. That matters because this is the production config.
- Fix: S8 should assert the exact header set on `/`, an `/api/*` route and a static asset, plus the absence of `'unsafe-eval'` in production. Keep S8 scheduled right after S6.

### F6 nit: unused sources in the policy
- `next.config.ts:19-20`. `media-src 'self' data: blob:` and `font-src ... data:`: the source has no media elements or `blob:` usage (audio is WebAudio; `grep` for `blob:`/`<audio`/`<video` found nothing), and the built CSS's font `url()`s are all `/_next/static/media/*.woff2`. `img-src blob:` is also unused. Fix: narrow to `'self'` (keep `img-src data:` if wanted for Next internals). Low value, so treat it as optional.

### F7 nit: `X-Powered-By: Next.js` still sent
- `next.config.ts:30`. Evidence: it appears in both the dev and prod `curl -sI` output. Fix: `poweredByHeader: false`.

### F8 nit: `next.config.ts` imports the 700+ line content module
- `next.config.ts:2`. `lib/copy.ts` has only type-only `@/` imports today, which are erased, and the build works. A future runtime `@/...` or client-only import added to `lib/copy.ts` would break config loading. I did not check whether Next 15 resolves tsconfig paths in config files. Fix: move `projectsMeta` URLs (or all of `projectsMeta`) to a dependency-free `lib/projects.ts`.

## Specific checks requested

**(a) Dev mode works.** `next.config.ts:4,16` has a NODE_ENV conditional: `isDev = process.env.NODE_ENV !== "production"` adds `'unsafe-eval'` in dev. I ran `npx next dev -p 3517`. `GET /` returned 200 (69,682 bytes), and the dev CSP header contained `script-src 'self' 'unsafe-inline' 'unsafe-eval'`. Server log: "Ready in 2.3s", "Compiled / in 6.7s", no errors. The only warning was the pre-existing "multiple lockfiles / inferred workspace root", which is unrelated to this slice. In headless Firefox on the dev server, the page hydrated, the MacBook booted, `run portal` framed the KB site, and the violations array was `[]`. The HMR websocket (`/_next/webpack-hmr`, same origin) caused no violation: CSP3 `connect-src 'self'` matches same-origin `ws:`. The dev server was killed afterwards and port 3517 was confirmed free before the build ran.

**(b) Production.** `npm run build` passed (`/` static, `/api/contact` and `/api/embeddable` dynamic). `npx next start -p 3518`, then `curl -sI http://localhost:3518/`:
```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; frame-src https://cw-research-terminal.vercel.app https://cw.kbsec.com.vn https://github.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
```
The same four headers are present on `/api/embeddable?url=x` (400), `POST /api/contact` (503, no mail key configured), `/og.png`, `/profile.webp`, `/icon.svg`, `/Nhan_Nguyen_Resume.pdf`, `/_next/static/chunks/webpack-*.js` and `/does-not-exist` (404). There is no `'unsafe-eval'` in production.

What the built HTML loads, checked against the policy:
- 7 external scripts, all `/_next/static/chunks/*`, covered by `'self'`. 7 inline scripts, covered by `'unsafe-inline'`.
- 1 stylesheet `/_next/static/css/*`, 0 `<style>` tags, 8 `style=""` attributes, covered by `'unsafe-inline'`.
- 4 font preloads, plus every CSS `url()` (`/_next/static/media/*.woff2`, next/font self-hosted), covered by `'self'`.
- Images: all `/_next/image?url=/...`, covered by `'self'`.
- Client fetches: `/api/embeddable` and `/api/contact` only, covered by `connect-src 'self'`.

The only absolute URLs in the HTML are `<a href>` links and `metadataBase` values, which CSP does not restrict. Headless Firefox on the production server: fonts loaded, all 6 images loaded after scrolling (`naturalWidth > 0`), contact submit reached `/api/contact` (503), the framed `cw.kbsec.com.vn` document rendered with its scripts (title present, about 33k characters of text, 18 scripts), and the violations array was `[]`. The resume PDF opened in Firefox's PDF.js under this CSP. Servers and the headless browser were stopped afterwards and ports 3517, 3518 and 9333 were confirmed free.

**(c) github.com.** An iframe is never attempted for it; see F1. Drop it (minor).

**(d) `sandbox="allow-scripts allow-same-origin"`.** This matches the backlog exactly. The well-known escape (the framed document removes its own sandbox) only works when the framed document is **same-origin with the embedder**. All three project origins are third-party, so the framed page keeps its own origin, and the same-origin policy stops it from reaching the portfolio's DOM. What the sandbox still blocks: top-level navigation of the portfolio (the main benefit), popups, form submission, modals, downloads and pointer lock. Clicks never reach the frame anyway (`.mac__frame { pointer-events: none }`, `app/globals.css:1029-1034`). The parent's `Permissions-Policy` also denies camera, microphone, geolocation, payment and usb to the frame.

Residual risk:
- The framed site runs its own scripts with its own storage and network access. Firefox showed it trying to set Google Analytics cookies (rejected). That is a privacy consideration for visitors who press `run`, mitigated by `referrerPolicy="no-referrer"` and by framing only on demand.
- It could `postMessage` the parent, but the app has no `message` listener (grep found none).
- If any project URL ever becomes same-origin with this site, the sandbox becomes escapable. Worth a one-line comment at `MacScreen.tsx:256`.

The `loading="lazy"` attribute does little, because the iframe only mounts after the user runs a project, but it is harmless (the frame still loaded in the test).

**(e) Frame protection.** The response carries only CSP `frame-ancestors 'none'`, with no XFO. That is adequate for current browsers and not for IE11 or legacy WebViews; see F2.

**(f) Syntax and coverage.** The 12 directives are joined with `"; "`, keywords are correctly single-quoted, and there are no typos. Browsers accepted the policy (no parse warnings in the Firefox log). `source: "/:path*"` matched `/`, the API routes, `/_next/static`, `public/` files and the 404. Header order has no effect. The Permissions-Policy features (`camera`, `microphone`, `geolocation`, `payment`, `usb`) are all valid, with the correct `()` empty-allowlist syntax. HSTS is absent; `04-build.md` already records it as a follow-up.

**(g) Unrelated changes and secrets.** None. The diff is limited to the two declared files plus 04-build.md. A grep of the diff for key/secret/token/password found nothing. The working tree is clean after the build (`.next` is ignored).

**(h) Leftover ref.** `refs/heads/worktree-agent-a38312879c5b78ad1` points at 135f1e8 (the base commit). It has no unique commits, so it can be deleted safely. I did not delete it.

## Traceability matrix

| # | Acceptance criterion | Code | Test / evidence | Verdict |
|---|---|---|---|---|
| 1 | `/` returns CSP, nosniff, Referrer-Policy, Permissions-Policy, `frame-ancestors 'none'` | `next.config.ts:14-27,30-46` | Reviewer `curl -sI` on prod :3518 and dev :3517 (quoted above). No automated test (S8, F5) | Met |
| 2 | iframe `sandbox="allow-scripts allow-same-origin"`, `referrerPolicy="no-referrer"`, `loading="lazy"`; `frame-src` only project origins | `MacScreen.tsx:256-258`; `next.config.ts:7,22` | Firefox DOM read: `{"sandbox":"allow-scripts allow-same-origin","referrerpolicy":"no-referrer","loading":"lazy"}`; frame-src = the 3 project origins. No automated test | Met (F1: github.com is never used) |
| 3 | Manual browser pass: fonts, images, MacBook `run` preview, blocked card, no CSP violations | n/a | Reviewer's scripted headless **Firefox 157** pass on dev and prod: `securitypolicyviolation` events `[]`. Chrome, Safari and a Vercel preview not done | Partially verified (Firefox only; F3 for previews) |
| 4 | CSP starts with `'unsafe-inline'`; nonce hardening recorded as follow-up | `next.config.ts:9-16` comment | `04-build.md` "Follow-ups" bullet 1 | Met |

## What I ran
- `git diff 135f1e8..HEAD`, `git log`, `git for-each-ref`, `git status`
- `npm run verify` (tsc --noEmit && eslint): exit 0, no output
- `npx next dev -p 3517` + curl + headless Firefox (WebDriver BiDi script in /tmp, with a preload `securitypolicyviolation` listener), then killed
- `npm run build`: passed
- `npx next start -p 3518` + curl on 9 paths + HTML/CSS resource inventory + headless Firefox (MacBook `run portal`/`cw`/`itch`, scroll for lazy images, contact submit, framed document inspection, resume PDF), then stopped
- `curl -sI -L` of the three project URLs for XFO, frame-ancestors and redirects (none redirect)

## Not verified
- Chrome/Edge and Safari behaviour (only Firefox was run). In particular, Safari's handling of `'self'` for websockets matters for dev HMR only. Chrome's PDF viewer under `object-src 'none'` is unverified, although the Firefox PDF viewer works.
- A real Vercel preview or production deployment: the toolbar (F3), whether Vercel adds or overrides headers, and HSTS on the custom domain.
- Typing interaction inside the framed KB site (clicks are disabled by design).
- Whether Next 15 config loading resolves `@/` path aliases (F8).
- Interactive DevTools console messages that are not delivered as `securitypolicyviolation` events or BiDi log entries.

## Resolution (conductor, 2026-10-06)

Verdict stays APPROVE (no blockers, no majors). Two minors fixed in `53a52ac`: `github.com` is excluded from `frame-src` via a one-entry `NEVER_FRAMEABLE` deny-set (the list stays derived from `projectsMeta`), and `X-Frame-Options: DENY` was added next to `frame-ancestors 'none'`. Re-verified from the implementer's `next start` output: `frame-src https://cw-research-terminal.vercel.app https://cw.kbsec.com.vn` and `X-Frame-Options: DENY`; `verify` and `build` pass. Still unverified: Chrome and Safari, and a real Vercel deployment (preview deployments will log CSP errors from the Vercel toolbar); do a manual click-through of the MacBook `run` preview on the first preview deploy. Nonce-based CSP to replace `'unsafe-inline'` remains a follow-up.
