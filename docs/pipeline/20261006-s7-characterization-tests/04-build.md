# S7 Characterization tests: build log

Branch `test/characterization-tests`, base `ff72c57`. Tier M, tests only: no application source file changed.

## Slice goal
Pin today's behavior of the four highest-value untested targets so S3 (contact hardening), S4 (embeddable hardening) and later refactors change it on purpose. Stories: backlog S7 (Accept 1 to 4).

## Files added
- `app/api/contact/route.test.ts` (node env)
- `app/api/embeddable/route.test.ts` (node env)
- `components/mac/useTerminal.test.ts` (jsdom, `renderHook`)
- `components/game/useFeedGame.test.ts` (jsdom, `renderHook`)

## What each file pins
- **contact** (with embeddable, 48 tests): 200 with the exact Resend payload (cleaned fields, HTML escaped, env sender/recipient, defaults when env unset, 120/200/5000 truncation); 503 when `RESEND_API_KEY` is missing (checked before the body); 400 for 11 invalid bodies; 502 with the provider body never echoed. Limiter: 5 per 60 s per first `x-forwarded-for` entry (trimmed), shared `unknown` bucket, window live at 59 999 ms and stale at 60 000 ms, sliding window. Limiter state is reset per test with `vi.resetModules()` plus dynamic import; env via `vi.stubEnv`; time via fake timers.
- **embeddable**: 400 for missing, empty, unknown and near-miss urls (no fetch); every verdict reason (`x-frame-options` deny and sameorigin, case and trim; `frame-ancestors` 'none' and 'self'; host lists not blocking; header precedence; `http <status>` of the GET after a failed HEAD; `unreachable` on throw and on the 6 s abort); HEAD then GET fallback; request shape.
- **terminal** (33 tests): `help`, `ls`, `whoami`, `pwd`, `cd <id>`, `cd`, `cd ~`, `cd ..`, unknown id, `run` (selected, by id, none, unknown), `open` (only when running; `window.open` with `noopener,noreferrer`), `clear`, `exit` and `shutdown`, unknown command, whitespace handling, `reset`, and arrow-key history (clamping, blank past the newest, cursor reset on submit, blank input skipped, survives `clear`).
- **game** (17 tests): start state, 60 s clock, loss at 0, +2 boba, +1 donut, -1 coffee (negative allowed, angry for 550 ms), floats (750 ms), missed food, win decided only when the clock hits 0 (100 wins, 99 loses, dropping back under 100 loses), restart, unmount clears timers, drag clamping. Deterministic through fake timers (rAF and `performance` included), a queue-driven `Math.random` stub, a fake arena geometry and a mocked `@/lib/sfx`.

## Quirks pinned (each commented in the tests, flipped by a later slice)
1. Network failure of the Resend fetch is an unhandled throw: `POST` rejects with the fetch error, nothing logged (S3 flips to 502 `send_failed`).
2. The limiter counts only requests that passed validation (20 invalid requests do not consume the budget).
3. 429 attempts are recorded too, so hammering extends the lockout.
4. A failed (throwing) send still consumes a limiter slot.
5. The Resend fetch has no `AbortSignal`.
6. Embeddable: every call fetches upstream (no cache), HEAD uses a browser-shaped User-Agent (S4).
7. Reaching 100 points does not end the round early.

## Commands run and results
- `npm ci`: ok.
- `npm test`: 6 files, 102 tests passed (2 existing S6 files with 4 tests plus 98 new: 48 route, 33 terminal, 17 game).
- `npm run test:coverage`: passes, 102 tests. Real coverage (lines): contact `route.ts` 94.59% (uncovered 37-38, the `hits.size > 500` cleanup, not observable from outside), embeddable `route.ts` 100% (branch 94.7%), `useTerminal.ts` 97.72% (152-153, the unreachable "not deployed" branch), `useFeedGame.ts` 92% (lines 92-301 gaps: resize and a few sfx/guard paths). Global is 31% (no floor).
- `npm run verify` (tsc and eslint): passes with the new files.
- Not run: `npm run build` (not needed for tests only).

## Non-vacuity check
Mutations applied in a scratch copy under `/tmp` (deleted afterwards), the repo itself untouched: `MAX_PER_WINDOW` 5 to 6 (8 contact tests fail), dropping `sameorigin` (2 embeddable tests fail), `whoami` output and history clamp (3 terminal tests fail), boba points 2 to 3 (2 game tests fail). Every file went red.

## Deviations
None from the architecture or contract. No source changed.

## Follow-ups
- The `run: <id>: not deployed yet` branch of the terminal is unreachable while every project has a URL; not pinned.
- Pin the `hits.size > 500` limiter cleanup if S3 keeps the in-memory limiter.
- Game tests cover scoring, timer and drag; keyboard control (decision 1) will need its own tests when it lands.

## Review round 1 (05-review.md, CHANGES REQUESTED) and resolution
- F1 (major) fixed: the sliding-window test now idles to t=60 s and expects 200 then 429; the "429 recorded" test sends 5 rejections at t=30 s and expects 429 at t=60 s. Proven in a scratch copy (deleted): mutant C8 (no 429 recording) now fails 1 test, C11 (fixed window) fails 2.
- F2: all contact quirks name S3 ("flipped by S3"), embeddable no-cache says S4; note added that the slot quirk fails after the throw quirk once S3 lands.
- F3, F4: history duplicates test uses `ls, nonsense, nonsense` and expects `nonsense, nonsense, ls`; `ls` expects literal rows plus a separate test with `titles: {}` for the id fallback. Mutants T6 and T7 now fail 1 test each.
- F5: `cleanup()` in `afterEach` of both hook files.
- F6: pinned CR/LF accepted in name, no Origin check (both S3), leaked 6 s timer on fetch throw (`vi.getTimerCount() === 1`, S4); redirect follow labelled S4.
- Nits applied: F7 (`CONTACT_EMAIL` import), F8 (race assertion before reading JSON), F9 (helper comment), F10 (`vi.stubEnv(k, undefined)`). Skipped: F11 (`.vitest/` is untracked and left uncommitted; ignoring it belongs to the harness slice).
- Results: `npm test` 6 files, 106 tests pass; `npm run verify` clean; coverage lines unchanged (contact 94.59%, embeddable 100%, terminal 97.72%, game 92%; terminal branch 92.59%).
- Still open from the review: reach the terminal "not deployed" branch via `vi.mock`, game resize clamp, `open` error line for selected-not-running.
