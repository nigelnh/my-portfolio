# 04-build: S3 Contact form hardening

Branch `fix/contact-form-hardening`, based on `bb9a540` (S6 harness + S7 characterization tests). Tier M, risk flags PII/secrets and infra.

## Slice goal
Harden `POST /api/contact`: provider timeout and failure handling, honeypot, Origin allow-list, zod validation, and an ADR for the durable limiter.

## Story IDs covered
Backlog S3 (audit: Security basics for /api/contact, Observability).

## Files changed
- `app/api/contact/route.ts`: all behavior changes below.
- `app/api/contact/route.test.ts`: S7 quirk tests flipped, new tests added (tests written first and seen failing: 20 failures before the route change).
- `components/sections/Contact.tsx`: honeypot field `website`, sent in the POST body.
- `app/globals.css`: `.contact__trap` (absolute, `left:-10000px`, 1px, overflow hidden; not `display:none`).
- `package.json`, `package-lock.json`: `zod@^4.6.5` (the registry's current version, checked with `npm view zod version`).
- `docs/adr/0002-contact-rate-limit.md`, `docs/adr/README.md`.

## Behavior changes
1. Resend `fetch` uses `AbortSignal.timeout(RESEND_TIMEOUT_MS)` (8000 ms, named constant) inside try/catch. Timeout or network failure returns 502 `{error:"send_failed"}` and logs `"resend send failed", <error class name>` only (no message, since it can contain request details). AbortSignal.timeout owns its timer, so no timer is left to clear.
2. Honeypot: a non-blank `website` string returns 200 `{ok:true}` before validation and before the limiter: no Resend call, no limiter slot. Chosen so a bot cannot tell why it was dropped and cannot exhaust the real budget of a shared IP. Cost: honeypot hits are not rate-limited, but they do nothing.
3. Origin: present and not allowed returns 403 `{error:"forbidden"}`, checked after the 503 key check and before body parsing, so it consumes no limiter slot. Allowed: origins of `NEXT_PUBLIC_SITE_URL`, `https://$VERCEL_PROJECT_PRODUCTION_URL`, `https://$VERCEL_URL`, and `http://localhost[:port]` when `NODE_ENV !== "production"`. Malformed settings allow nothing.
4. Validation with zod: name, email, msg trimmed then capped at 120/200/5000 (same order as before); name and email reject C0 control characters and DEL (CR, LF, tab, NUL); email uses `z.email()`; name and msg must be non-empty. All failures return 400 `{error:"bad_request"}`. Consequence: an address longer than 200 characters whose truncation is invalid is now a 400 (before, the regex accepted the truncated string); zod's email rule is also stricter (rejects `,`, `<>`).
5. Unchanged on purpose: 200/400/429/503 shapes, limiter 5 per 60 s sliding window, a failed send and 429 attempts still consume or extend slots.

## Origin-absent decision (accepted gap, owner to confirm)
A request with NO Origin header is allowed. Browsers always send Origin on cross-origin POST, but curl, server-side clients and some privacy setups omit it, and I could not verify that no legitimate client omits it. The check therefore stops browser-driven cross-site posting only; scripted abuse is covered by the Firewall rule in ADR 0002 (plan availability UNVERIFIED) and the in-memory limiter. Recorded in the ADR and a test (`ACCEPTED GAP`).

## S7 tests flipped
- network failure unhandled throw -> now 502 `send_failed`, logged with error class only.
- "failed attempt still consumed a slot" -> kept as an explicit expectation, now with 502 results.
- "no timeout/abort signal" -> now asserts `AbortSignal.timeout(8000)` and a signal on the fetch.
- "CR/LF in name accepted" -> now 400.
- "no Origin check" -> now 403 for a foreign Origin (plus allow-list cases).
- The two limiter quirks (validation-only counting, 429 attempts extend the lockout) are NOT flipped: they still hold. S3's four acceptance criteria do not mention them, so this is an owner decision (earlier text citing an "accept 6" was wrong). Their tests are now titled `KEPT (owner decision, ADR 0002)`. The audit notes malformed floods go unthrottled.

## Commands run and results
- `npm test`: 6 files, 132 tests, all pass (contact file: 56); after review round 1: 162 tests, contact file 86; contact route.ts coverage 94.73% stmts, 91.48% branches, 97.01% lines; verify clean; build ok.
- `npm run test:coverage`: contact `route.ts` 94.02% statements, 89.18% branches, 91.66% functions, 96.61% lines; only lines 57-58 uncovered (the pre-existing `hits.size > 500` eviction, untouched). `Contact.tsx` 0% (no component test; out of scope).
- `npm run verify` (tsc + eslint): clean.
- `npm run build`: succeeded once, `/api/contact` listed as dynamic.
- `npm ci` printed an `npm audit` notice (S1 owns it).
- No dev server was started.

## Deviations from architecture or contract
None. (No openapi or architecture doc exists for this retrofit; followed the backlog S3 Accept list.)

## UNVERIFIED
- The honeypot's visual hiding was not checked in a browser. By hand: (1) the field is not visible at 1280 and 390 px, en and zh; (2) the form layout and the gap between rows are unchanged; (3) Tab skips it; (4) a screen reader does not announce it; (5) Chrome and Safari autofill do not fill it (submit with autofill and confirm success); (6) a real submit still works end to end, and with the field filled in devtools the UI shows "sent" but no mail arrives.
- Vercel Firewall rate-limit availability on the owner's plan.
- On a Vercel preview, that `VERCEL_URL` matches the Origin the browser sends (previews behind a custom alias send the alias origin, which would get 403 unless it is `NEXT_PUBLIC_SITE_URL`).

## Follow-ups
- Expect a routine rebase conflict in `package.json` and `package-lock.json` with the S1 and S6 branches (resolve by taking both dependency sets and regenerating the lockfile with `npm install`).
- S13 should move the env reads (`NEXT_PUBLIC_SITE_URL`, `VERCEL_*`, `NODE_ENV`) into `lib/env.ts`.
- The honeypot label `Website` is a hard-coded English string (aria-hidden, never shown); move it to `lib/copy.ts` if the owner wants zero inline strings.
- Add a Contact component test and an e2e check in S8 (honeypot hidden, submit works).
- Set a Firewall rule and confirm the plan (ADR 0002).

## Review round 1 fixes (05-review.md)
- F1: `CONTROL_CHARS` is now `/[\p{Cc}\p{Zl}\p{Zp}\u202a-\u202e\u2066-\u2069]/u` for name and email. Tests cover U+0080, U+0085, U+009B, U+009F, U+2028, U+2029, U+202A, U+202E, U+2066, U+2069 in name and U+0085/U+2028/U+202E in email; a ZWJ/ZWSP name and a message with tab, newline and U+2028 stay accepted.
- F2: origin allow-list now also takes `CONTACT_ALLOWED_ORIGINS` (name added to `.env.example`), `VERCEL_BRANCH_URL`, and the `www.`/apex twin of the site and production URLs (exact comparison). Every rejection logs `console.warn("contact origin rejected", origin (max 200 chars), "not_allowed")`.
- Allowed origins: `NEXT_PUBLIC_SITE_URL`, `https://$VERCEL_PROJECT_PRODUCTION_URL` (both with www/apex twin), `https://$VERCEL_URL`, `https://$VERCEL_BRANCH_URL`, entries of `CONTACT_ALLOWED_ORIGINS`, `http://localhost[:port]` outside production. Absent Origin is still allowed (accepted gap, owner to confirm).
- Owner checklist for the first preview and production deploy: see the end of ADR 0002.
- F3: any present `website` value except null or a blank string is a trap hit (tests for number, true, array, object).
- F5 (partly): the client shows the email error on a 400 instead of "could not send". Whether to accept internationalized addresses is left to the owner.
- F6: limiter test titles renamed, wrong "accept 6" citation corrected above.
- F7: new test that the name and email are HTML-escaped; mutation M13 (drop `escape` on name) now fails it (checked by hand).
- F8: `console.warn("contact honeypot hit")`, no field values.
- F9: fetch block re-indented. F10: comment added on the redundant email refine.
- Mutation M5 (drop the email control refine) STILL survives: `z.email()` already rejects those characters, so no input can distinguish it. It is kept as documented defense in depth.

### Skipped, needs an owner decision
- F4: reject instead of truncate an over-long email (and zod accepting 188-char TLDs / 65-char local parts). Truncation is today's pinned S7 behavior.
- F5: accept IDN addresses (`z.regexes.unicodeEmail`) or not.
- F11: hard-coded honeypot label.
- Validation-only limiter counting (F6) stays until the owner decides.
