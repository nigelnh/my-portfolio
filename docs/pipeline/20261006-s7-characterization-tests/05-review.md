# S7 Characterization tests: review

Reviewer: Opus, a different model from the Sonnet implementer. Branch `test/characterization-tests`, range `ff72c57..HEAD` (600555f, 39ab723, 0b6e31a). Tier M, tests only.

## Verdict: CHANGES REQUESTED

Blockers: 0. Majors: 1. Minors: 6. Nits: 5.

Most of the suite is strong: 34 of 37 mutants turned it red, including every mutant on the assertions the backlog cares most about (limiter threshold and window edges, each embeddable reason, the 400, terminal commands, food points, the win threshold, the unhandled Resend rejection). One problem holds back approval. Two limiter tests say in their titles that they pin a behavior, but they stop just before the step that would show it, so they pass against code that does not have that behavior (mutants C8 and C11 stayed green). The whole point of this slice is to let S3 rewrite this limiter safely, so a test that pins nothing gives false confidence in exactly the place it is needed. The fix is about 10 lines and no source change.

## Findings

### F1 (major): two limiter tests pass whether or not the behavior in their title exists
`app/api/contact/route.test.ts:172-180` and `:194-201`.

- `"is a sliding window: slots free one by one as old hits age out"` only checks that the 6th request at t=50 s is a 429. It never moves past t=60 s, so no slot is ever shown freeing up. Mutant C11 replaced the sliding filter with a fixed window (all hits dropped once the oldest is stale), and the file stayed **green (28/28)**.
- `"QUIRK: rejected 429 attempts are recorded too, so hammering extends the lockout"` records one 429 at t=30 s and then expects a 200 at t=60 s. A limiter that does not record rejected attempts also returns 200 at that point, because the window holds 0 entries instead of 1. Mutant C8 stopped recording the rejected attempt, and the file stayed **green (28/28)**. The build log (`04-build.md`, quirk 3) says this behavior is pinned. It is not.

Evidence (run in a scratch copy):
```
C8-no-429-record: GREEN [ Tests 28 passed (28)]
C11-fixed-window: GREEN [ Tests 28 passed (28)]
```
Suggested fix (tests only):
- Sliding window: send valid hits at t=0, 10, 20, 30, 40 s and make no attempt at t=50. Advance to t=60 s and expect a 200: the t=0 hit has aged out, leaving 4 in the window. Then send one more at t=60 s and expect a 429. A fixed window resets at t=60 and returns 200 here, so this step catches the difference.
- 429 recorded: send 5 at t=0. At t=30 s send **5** more and expect 429 on each. Advance to t=60 s and expect a **429**: the five t=30 entries are still in the window. Today's code fails this check under C8; the current test does not.

### F2 (minor): three contact quirk tests do not name the slice that flips them
`app/api/contact/route.test.ts:194`, `:213` and `:220` are titled `"QUIRK: ..."`. The enclosing describe at `:204` says only "a later slice flips these". The requirement is that every pinned quirk names its slice. `:213` (a failed send uses up a slot) and `:220` (no `AbortSignal`) are flipped directly by S3 Accept (1), which adds `AbortSignal.timeout` plus try/catch. `:182` and `:205` are labelled correctly ("flipped by S3"), and so is embeddable `:166` ("S4 changes it"). Fix: rename to `QUIRK (flipped by S3): ...` and name S3 in the describe at `:204`. Also note in `:213` that once S3 lands, its `rejects.toThrow()` fails first, before the slot behavior is checked. The S3 implementer then has to decide again whether a failed send should use up a slot.

### F3 (minor): "keeps duplicates" in the terminal history test pins nothing
`components/mac/useTerminal.test.ts:266-272`. The commands are `"  nonsense  ", "", "nonsense"`, and the test expects three `recall(-1)` calls to return `"nonsense"`. A history that drops repeated commands holds a single `"nonsense"`, and because recall stops at the oldest entry, the result is the same. Mutant T6 (drop repeated commands) stayed **green (33/33)**. Fix: submit `"ls", "nonsense", "nonsense"` and expect `nonsense`, `nonsense`, `ls`.

### F4 (minor): "with a titles fallback" in the `ls` test is never exercised
`components/mac/useTerminal.test.ts:88-92`. The local `titles` map (`:12`) has an entry for every project id, so the `?? p.id` fallback at `useTerminal.ts:74` never runs. Mutant T7 (fallback changed to `"?"`) stayed **green**. The expectation also builds its value from the test's own `titles[p.id]`. If a 4th project is added, the test expects the literal `"undefined"` while the code prints the id. Fix: render once with `titles: {}` and expect `p.id.padEnd(8) + p.id`. Alternatively, drop "fallback" from the title.

### F5 (minor): hooks are never unmounted between tests
The S6 config has no `globals: true` and no `setupFiles`. `@testing-library/react` only registers its automatic cleanup when a global `afterEach` exists (`node_modules/@testing-library/react/dist/index.js:26`). So every `renderHook` in `useTerminal.test.ts` and `useFeedGame.test.ts` stays mounted for the rest of the file. In the game file each one leaves a `window` resize listener behind, and its `stop()` cleanup never runs. I found no failure today: 3 shuffled seeds all passed 102/102. But leftover mounted hooks are the classic source of order-dependent failures once a test fires `resize` or relies on global listeners. Fix: add `afterEach(cleanup)` in the two hook files, or better, add a `vitest.setup.ts` with `cleanup` in the harness.

### F6 (minor): the S3 and S4 quirks the slice could cheaply pin are left out
These are not required by the S7 acceptance criteria. Each is a behavior S3 or S4 will change on purpose, and pinning it now makes that change visible:
- Contact: CR/LF and control characters in `name` are accepted and land in `subject` (S3 Accept 3 rejects them). Today `name: "Ada\r\nBcc: x"` returns 200.
- Contact: there is no Origin check (S3 Accept 2 adds a 403).
- Embeddable: `clearTimeout` is skipped when fetch throws, so the 6 s timer leaks (S4 Accept 2). With fake timers this can be pinned as `vi.getTimerCount() === 1` after an `unreachable`.
- Embeddable: redirects are followed with no host check (S4 Accept 3). At the moment only `redirect: "follow"` is asserted (`:151`), which is enough as a pin. It just needs an S4 label.

### F7 (nit): the hard-coded owner email couples the test to copy text
`app/api/contact/route.test.ts:79` expects `"xuannhan.nguyen2001@gmail.com"`. Import `CONTACT_EMAIL` from `@/lib/copy` instead, as the route does, so changing the copy does not break a test about env defaults.

### F8 (nit): a timer regression fails by timeout, not by an assertion
`app/api/embeddable/route.test.ts:128-141`. Under mutant E8 (abort at 7000 ms) the test is red only because `await pending` never settles and the default 5 s test timeout fires (`5009ms`). It is still red, but the failure message is unclear. Fix: `await expect(Promise.race([pending, Promise.resolve("pending")])).resolves.not.toBe("pending")` before reading the JSON.

### F9 (nit): misleading helper doc comment
`components/mac/useTerminal.test.ts:23` says "Text of every line printed after the last echoed prompt line", but `output()` returns every line. Callers work around this with `.slice(1)` and `.at(-1)`.

### F10 (nit): `delete process.env[k]` instead of `vi.stubEnv(k, undefined)`
`app/api/contact/route.test.ts:32`. This is safe today only because the same three keys are always stubbed first, so `vi.unstubAllEnvs()` restores them. Any other key passed in as `undefined` would be deleted for the rest of the worker. Vitest 5 supports `vi.stubEnv(k, undefined)`, which is tracked and restored.

### F11 (nit): untracked `.vitest/json/output.json` in the worktree
It is not in the diff and not git-ignored (`git check-ignore .vitest` returns nothing), and it was created at 19:30, before my runs. Delete it or ignore it so it does not get committed by accident.

## Checks

### (a) Gates
- `npm test`: `Test Files 6 passed (6)`, `Tests 102 passed (102)`, 2.89 s.
- `npm run test:coverage`: passes. `app/api/contact/route.ts` lines 94.59% (uncovered 37-38). `app/api/embeddable/route.ts` 100% (branch 94.73%, line 17). `components/mac/useTerminal.ts` 97.72% (152-153). `components/game/useFeedGame.ts` 92%. Global 31.38% (no floor, per standards).
- `npm run verify` (`tsc --noEmit && eslint`): exit 0, no output.
- Shuffled order (`--sequence.shuffle`, seeds 1, 42, 1337): 102/102 each time. Route files run without file parallelism: 48/48. No React `act()` warnings in the hook runs.

### (b) No source change
`git diff --name-only ff72c57..HEAD` lists the 4 test files plus `04-build.md`. `git diff ff72c57 --stat -- . ':!*.test.ts' ':!docs'` is empty.

### (c) Non-vacuity (mutation testing)
A scratch copy was made outside the repo (`git archive HEAD` into `/tmp/s7mut.p5o7`, with `node_modules` symlinked). Each mutant was applied to a pristine copy of the file, only the affected test file was run, and the file was restored afterwards. The repo was never touched.

| ID | Mutation | Result |
|---|---|---|
| C1 | `MAX_PER_WINDOW` 5 to 6 | RED (8 failed) |
| C2 | `MAX_PER_WINDOW` 5 to 4 | RED (3) |
| C3 | `WINDOW_MS` 60_000 to 59_999 | RED (`live at 59 999 ms`) |
| C4 | `WINDOW_MS` 60_000 to 60_001 | RED (`stale at exactly 60 000 ms` and 1 more) |
| C5 | `now - t < WINDOW_MS` to `<=` | RED (2) |
| C6 | try/catch around the Resend fetch (S3's fix) | RED (`QUIRK (flipped by S3): ... unhandled throw` and the slot quirk) |
| C7 | limiter also counts invalid requests | RED (`QUIRK (flipped by S3): only requests that passed validation are counted` and 2 more) |
| C8 | rejected 429 attempts not recorded | **GREEN** (F1) |
| C9 | key on the last XFF entry | RED (1) |
| C10 | 502 to 500 | RED (1) |
| C11 | fixed window instead of sliding | **GREEN** (F1) |
| E1 | drop `sameorigin` | RED (2) |
| E2 | drop `'none'` | RED (1) |
| E3 | drop `'self'` | RED (1) |
| E4 | `"ok"` to `"okay"` | RED (2) |
| E5 | `http <status>` to `unreachable` | RED (1) |
| E6 | `unreachable` to `down` | RED (2) |
| E7 | remove the GET fallback | RED (2) |
| E8 | abort 6000 to 7000 ms | RED (by 5 s timeout, F8) |
| E9 | drop `.toLowerCase()` on XFO | RED (2) |
| E10 | 400 to 404 | RED (4) |
| E11 | XFO reason format | RED (5) |
| T1 | `ls` padEnd 8 to 9 | RED (1) |
| T2 | `cd ..` keeps the project running | RED (3) |
| T3 | `run` does not set running | RED (6) |
| T4 | `help` drops `clear` | RED (1) |
| T5 | history clamp floor 0 to 1 | RED (3) |
| T6 | history drops repeated commands | **GREEN** (F3) |
| T7 | `ls` titles fallback changed | **GREEN** (F4) |
| T8 | `cd` error text | RED (1) |
| G1 | boba points 2 to 3 | RED (`boba is worth +2`, win test) |
| G2 | donut 1 to 2 | RED (2) |
| G3 | coffee -1 to -2 | RED (2) |
| G4 | win `>=` to `>` | RED (`reaching 100 ... win`) |
| G5 | `WIN_SCORE` 100 to 99 | RED (3) |
| G6 | end the round as soon as 100 is reached | RED (2) |

### (d) Do the tests match what the code does today?
- Contact: the assertions match `route.ts`. The 503 check comes before parsing (`:50-53`), the 400 cases match the three guards (`:58`, `:63`, `:72`), truncation happens after trimming, and the IP is the first XFF entry, trimmed, falling back to `unknown` (`:76-77`). The limiter Map lives at module level, and `vi.resetModules()` plus a dynamic import inside `load()` (`:26-36`, run in `beforeEach`) gives each test its own Map and its own `TO`/`FROM` values. Time is fixed with `setSystemTime` and fake timers, and `afterEach` restores timers, env, globals and the console spy. Nothing depends on wall-clock time.
- Embeddable: matches `verdict()` and the HEAD-then-GET flow. Statically importing `GET` is fine, because `ALLOWED` depends only on `projectsMeta`. The test at `:47` assumes every project has a `url`, which is true today (`lib/copy.ts:682-697`) and matches the uncovered branch at `route.ts:17`. Fake timers are used only in `:128` and are restored in `afterEach`.
- Terminal: matches. `projectsMeta[0]` being `cw` and `[1]` being `portal` is pinned data order, which is acceptable.
- Game: the `Math.random` stub assumes exactly 4 draws per spawn, in this order: roll, x, vy, jitter (`useFeedGame.ts:33,105,107,112`). That is correct today and documented in the test (`:70`). If someone reorders the draws, the test fails loudly rather than silently. `vi.restoreAllMocks()` and `vi.useRealTimers()` run in `afterEach`.
- Mocked fetch: none of the mocks hides behavior the code depends on. The contact route only reads `res.ok`, and the embeddable route only reads `ok`, `status` and `headers`. What the mocks cannot show is real redirect following, which S4 changes (F6).

### (e) Quirk labels
Both acceptance-criterion quirks are present, labelled with S3, and shown to flip (C6, C7). The embeddable no-cache quirk is labelled with S4. Three contact quirks are unlabelled (F2), and one of them pins nothing (F1).

### (f) Coverage follow-ups
I agree with the implementer that the `hits.size > 500` cleanup (`route.ts:36-40`) cannot be observed from outside: removing stale keys never changes a verdict, so it needs an exported seam or nothing at all. The terminal's "not deployed" branch (`useTerminal.ts:152`) and the `ls` dim flag (`:73-74`) can be reached with `vi.mock("@/lib/copy", ...)` adding a project without a `url`, which is worth doing before S11 or S14. Also uncovered: the game's resize clamp (`useFeedGame.ts:311-313`), and the error line for `open` on a selected but not running project (`useTerminal.test.ts:179` checks only that `window.open` was not called). See F6 for the S3 and S4 pins.

### (g) Env hygiene
Only fake values are used (`re_fake_key`, `to@example.com`, `from@example.com`). A grep for secret-like strings found nothing else. `vi.unstubAllEnvs()` runs in `afterEach` (see F10 for the `delete` caveat).

### (h) Style
Same style as the S6 tests (explicit `vitest` imports, `describe`/`it`, `@/` alias), and lint is clean. Some lines are over 100 characters. Prettier is S9's job, so these are not findings.

## Traceability matrix

| Acceptance criterion | Code | Test | Verdict |
|---|---|---|---|
| (1) contact 200 | `route.ts:82-107` | `route.test.ts:55-89` | Pinned (C10 and payload asserts) |
| (1) contact 400 | `route.ts:56-74` | `route.test.ts:104-121` | Pinned (11 cases) |
| (1) contact 429 | `route.ts:78-80` | `route.test.ts:137-158` | Pinned (C1, C2, C9) |
| (1) contact 502 | `route.ts:101-105` | `route.test.ts:123-131` | Pinned (C10) |
| (1) contact 503 | `route.ts:50-53` | `route.test.ts:91-102` | Pinned |
| (1) limiter window | `route.ts:26-42` | `route.test.ts:160-201` | Edges pinned (C3, C4, C5). Sliding behavior and 429 recording **not** pinned (C8, C11 green, F1) |
| (2) embeddable reason `ok` | `route.ts:32` | `route.test.ts:56-75` | Pinned (E4) |
| (2) `x-frame-options: deny/sameorigin` | `route.ts:21-24` | `:61-70`, `:106-114` | Pinned (E1, E9, E11) |
| (2) `frame-ancestors 'none'/'self'` | `route.ts:26-30` | `:77-104` | Pinned (E2, E3) |
| (2) `http <status>` | `route.ts:59-61` | `:116-119` | Pinned (E5, E7) |
| (2) `unreachable` | `route.ts:63-65` | `:121-141` | Pinned (E6, E8) |
| (2) 400 through GET | `route.ts:36-39` | `:35-45` | Pinned (E10) |
| (3) terminal `ls` | `useTerminal.ts:70-80` | `useTerminal.test.ts:88-92` | Pinned (T1). Fallback not exercised (F4) |
| (3) terminal `cd` | `:121-136` | `:108-141` | Pinned (T2, T8) |
| (3) terminal `run` | `:138-158` | `:143-170` | Pinned (T3). Not-deployed branch unreachable (f) |
| (3) terminal `help` | `:98-107` | `:78-86` | Pinned (T4) |
| (3) terminal history | `:88-91`, `:189-195` | `:231-280` | Pinned (T5). Repeated-command claim vacuous (F3) |
| (3) game +2 / +1 / -1 | `sprites.tsx:31,52,75`, `useFeedGame.ts:178-181` | `useFeedGame.test.ts:171-196` | Pinned (G1, G2, G3) |
| (3) game win at 100 | `useFeedGame.ts:133-139` | `:229-260` | Pinned (G4, G5, G6) |
| (4) quirk: unhandled network throw (S3) | `route.ts:82` | `route.test.ts:205-211` | Pinned and labelled (C6) |
| (4) quirk: limiter counts only valid requests (S3) | `route.ts:72-78` | `route.test.ts:182-192` | Pinned and labelled (C7) |
| Tests only, no source change | n/a | `git diff --name-only` | Met |

## What I ran
- `npm test`, `npm run test:coverage`, `npm run verify` in the worktree.
- `npx vitest run --sequence.shuffle --sequence.seed={1,42,1337}`, and the route files without file parallelism.
- 37 mutants in `/tmp/s7mut.p5o7` (a copy from `git archive HEAD`, outside the repo), driven by a script in `/tmp/s7tools.QvVy`.
- A grep of the test files for secret-like strings. `git check-ignore` for `.vitest`.

## What I did NOT verify
- `npm run build` and the dev server (not run, as instructed).
- CI behavior: no CI run was observed.
- Whether the tests stay stable across many repeated runs. I did 1 normal run, 3 shuffled runs and the mutant runs, all green on unmodified code, but no loop of 50 or more runs.
- The `hits.size > 500` cleanup path, and how the hooks behave in the real components (`MacScreen.tsx`, `FeedGame.tsx` are 0% covered).
- The implementer's mutation claims in `04-build.md`. I ran my own instead, and they overlap theirs (C1, E1, G1 all red, matching).

## Resolution (conductor, 2026-10-06)

The major and all minors were fixed in `f4587c8` (tests and build log only; no application source changed). The sliding-window and "429 attempts recorded" limiter tests now run to the step their titles claim: per the implementer's scratch-copy mutations, a no-429-recording change fails 1 test and a fixed-window change fails 2. The terminal history-duplicates and `ls` title-fallback tests now fail against wrong code. Every contact quirk names S3, the embeddable caching quirk names S4, hooks are cleaned up between tests, and three more quirks are pinned (CR/LF accepted in the name, no Origin check, a leaked 6 s timer when the fetch throws). Re-verified independently: 106 tests pass in 6 files and `npm run verify` passes. Skipped nit: `.vitest/` is not git-ignored (noted in the build log; add it to `.gitignore` in a later slice). Open follow-ups: the limiter's >500-entry cleanup and the terminal's "not deployed" branch are uncovered.
