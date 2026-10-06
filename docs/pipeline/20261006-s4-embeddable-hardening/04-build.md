# S4 Embeddable route hardening: build log

Branch `fix/embeddable-hardening`, base bb9a540. Tier S, no risk flags.

## Slice goal
Harden `GET /api/embeddable` (audit: Security basics): cache results, no leaked abort timer, no redirects off the allow-listed host, record the User-Agent decision. Decision 2 (KB Securities preview stays) is untouched: the allow-list is unchanged.

## Files changed
- `app/api/embeddable/route.ts`
- `app/api/embeddable/route.test.ts`
- `docs/pipeline/20261006-s4-embeddable-hardening/04-build.md`

## Behavior changes
1. Cache: module-level `Map` per allow-listed url. 10 min (`CACHE_TTL_MS`) for settled answers (ok, blocked, 4xx, off-site); 30 s (`TRANSIENT_TTL_MS`) for `unreachable` and 5xx. Repeated calls make no upstream fetch. The 400 is never cached. The cache is per server instance (serverless instances do not share it); acceptable for 3 keys.
2. `clearTimeout` runs in a `finally` inside `probe()` on every path.
3. Redirects: `redirect: "manual"`, up to 3 hops, followed only while the Location hostname equals the allow-listed url's hostname and the protocol is http(s). Otherwise `{ embeddable: false, reason: "redirected off-site" }` (200). A fourth redirect gives the new reason `too many redirects`. A 3xx without Location still gives `http <status>`.
4. User-Agent: unchanged, with a code comment saying it is intentional.
5. All earlier response shapes and reason strings are kept.

## S7 tests flipped
- "timer leaks when fetch throws" became "no timer pending after success and after a fetch throw" (fake timers, `getTimerCount() === 0`).
- "init.redirect is follow" became `"manual"`.
- "nothing is cached" became "repeated calls make no further upstream fetch".

Added: per-url cache, TTL boundary (10 min), 30 s transient TTL (unreachable and 5xx), uncached 400, redirect cases (same host, off-site, non-http Location, look-alike host, 3 hops ok, 4th hop, GET fallback, no Location).

Test setup change: each test loads a fresh module (`vi.resetModules` plus dynamic import), because Next route files may not export a cache-reset helper. The "accepts every url" test now dedupes urls, since the cache correctly fetches once per distinct url.

Red phase confirmed: 14 of 35 tests failed before the implementation.

## User-Agent decision (owner)
Kept the spoofed Chrome UA. Reason: some sites answer bots differently, so an honest UA could make the check disagree with what a visitor's browser sees. The owner may decide to switch to an honest UA (for example `my-portfolio-embed-check`); it is a one-line change (`BROWSER_UA`), but retest all project urls first, since cw.kbsec.com.vn already rejects a bare HEAD.

## Commands run
- `npm ci`: ok
- `npm test`: 6 files, 120 tests passed
- `npm run test:coverage`: embeddable `route.ts` 98.27% lines, 97.56% branches, 100% functions (uncovered: the invalid-Location `catch`, line 71). Global 33% (no floor while retrofitting).
- `npm run verify` (tsc + eslint): clean
- Not run: `npm run build`, manual browser check.

## Deviations
None from the backlog. One additive reason string (`too many redirects`) was needed for the hop cap.

## Follow-ups
- Owner: confirm the redirect rule (same hostname only, so a `www.` or apex hop is treated as off-site) and the UA decision.
- The cache is per instance; a shared cache is unnecessary unless the allow-list grows.
- S9 (API contract) should document the two new reasons.
