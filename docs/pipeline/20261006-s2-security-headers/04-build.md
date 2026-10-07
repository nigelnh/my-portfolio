# 04-build: S2 Security headers and iframe sandbox

## Slice goal
Send CSP, nosniff, Referrer-Policy, Permissions-Policy and frame protection on every route, and sandbox the MacBook project preview iframe. Tier M, risk: infra/production config. No characterization tests (S8 will assert these headers).

## Files changed
- `next.config.ts`: `headers()` for `/:path*`. CSP: `default-src 'self'`; `script-src 'self' 'unsafe-inline'` (plus `'unsafe-eval'` in development only); `style-src 'self' 'unsafe-inline'`; `img-src 'self' data: blob:`; `font-src 'self' data:`; `media-src 'self' data: blob:`; `connect-src 'self'`; `frame-src` derived from `projectsMeta` URLs in `lib/copy.ts` (origins, deduplicated); `frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'self'`; `form-action 'self'`. Also `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`.
- `components/mac/MacScreen.tsx`: iframe gets `sandbox="allow-scripts allow-same-origin"`, `referrerPolicy="no-referrer"`, `loading="lazy"`.

Source audit for what the site loads: next/font self-hosts (`'self'`); images are in `public/` served via `'self'`; the only client fetches are `/api/contact` and `/api/embeddable` (`connect-src 'self'`); Resend is called server-side only; audio is WebAudio (no media URLs); no external URLs in CSS.

## Commands run
- `npm ci`: ok (npm reports remaining audit advisories, owned by S1/S5).
- `npm run verify` (tsc + eslint): passes, no output.
- `npm run build`: passes; `/` static, two dynamic API routes.
- `npx next start -p 3417` then `curl -sI http://localhost:3417/`:
  - `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; media-src 'self' data: blob:; connect-src 'self'; frame-src https://cw-research-terminal.vercel.app https://cw.kbsec.com.vn https://github.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()`
  - The same CSP is present on `/api/embeddable`. Server stopped afterwards (port 3417 free).

## UNVERIFIED: manual browser pass (no browser available)
Open the production build (`npm run build && npm run start`) with DevTools Console open and confirm no "Refused to ..." CSP errors while doing each of:
1. Load `/`: fonts render, hero/profile/journey/project images show, inline styles apply.
2. Switch language en/zh, scroll all six sections, toggle sound, play the catch game and blob (WebAudio, no network).
3. MacBook: power on, `cd` into the first project (cw-research-terminal), `run`: iframe loads in the sandbox (check the page inside still works with `allow-scripts allow-same-origin`).
4. Run the KB Securities project (`cw.kbsec.com.vn`): either frames or shows the blocked card; either is acceptable, a CSP violation is not.
5. Run the GitHub project (`github.com`): expected blocked card (no iframe is attempted).
6. Submit the contact form (use a throwaway message or stop before sending): `/api/contact` request is allowed.

## Deviations
- None from the backlog. Note: the worktree started on `main`, so `chore/pipeline-bootstrap` was fast-forward merged in first (no new commit). `git branch -m` failed on a git reflog path issue, so the branch was created with `git checkout -b feat/security-headers`; the original `worktree-agent-a38312879c5b78ad1` ref remains at the old commit and can be deleted.
- Resolved after review: `frame-src` is still derived from `projectsMeta` but excludes `github.com` (always X-Frame-Options DENY, so never framed). `X-Frame-Options: DENY` was added next to `frame-ancestors 'none'` for older browsers. Re-run: verify and build pass; on `next start -p 3519` the CSP shows `frame-src https://cw-research-terminal.vercel.app https://cw.kbsec.com.vn` and `X-Frame-Options: DENY`.
- Correction: cw-research-terminal.vercel.app also sends X-Frame-Options DENY today, so manual step 3 will show the blocked card; only cw.kbsec.com.vn frames.

## Follow-ups
- Replace `'unsafe-inline'` in `script-src` with per-request nonces (needs middleware and dynamic rendering, which costs static prerender of `/`) or hash-based CSP.
- Consider `style-src` without `'unsafe-inline'` once inline `style` attributes are removed (React `style` props rely on it).
- Add `Strict-Transport-Security` (Vercel already sends HSTS on its domains; verify for the custom domain).
- S8 e2e should assert these headers; consider `Content-Security-Policy-Report-Only` first on production for a trial run.
