# S6 Vitest harness: review

Reviewer: Claude Opus 5.5 (implementer was Sonnet). Branch `chore/vitest-harness`, range `135f1e8..a6bf14d` (2 commits, 8 files).

## Verdict: CHANGES REQUESTED

Blockers: 0. Majors: 2. Minors: 3. Nits: 4.

All three acceptance criteria pass as literally written. Two config defects still need fixing before merge. First, the harness cannot compile JSX. No `.tsx` test can run, a `.ts` test fails if it imports a `.tsx` module (S7's planned `useFeedGame.test.ts` does), and the coverage report silently drops 21 of 31 source files. Second, the custom `exclude` replaces Vitest's defaults, so `npm test` run in the main checkout also collects tests from `.claude/worktrees/*`, including tests inside their `node_modules`. Each fix is about two lines in `vitest.config.ts`. I verified both fixes in a scratch copy (see below).

## Findings

### F1 (major): JSX is not transformed. TSX tests cannot run and coverage silently drops every `.tsx` file
- Location: `vitest.config.ts:5-20`. tsconfig has `"jsx": "preserve"` (Next.js requires it). Vite 8 / oxc respects that setting, so JSX is left untransformed.
- Evidence 1, coverage (worktree, `npm run test:coverage`). The run prints 21 errors like the one below and still exits 0:
  ```
  Failed to parse file:///.../components/Panel.tsx. Excluding it from coverage.
   Error [RolldownError]: Parse failed with 1 error:
  ```
  The 21 files are every `.tsx` under `app/`, `components/` and `lib/` (`git ls-files` counts 10 `.ts` and 21 `.tsx` non-test sources). The reported "Lines 1.25% (9/720)" leaves those files out of the denominator. With the fix below it becomes 1045 lines. The build log's "baseline 1.25% lines" figure is therefore wrong.
- Evidence 2, component test (scratch copy `/tmp/s6review.IhNS`, outside the repo; `components/Panel.test.tsx` renders `<Panel title="Hello">`):
  ```
  FAIL  components/Panel.test.tsx
  Error: Failed to parse source for import analysis because the content contains invalid JS syntax. If you use tsconfig.json, make sure to not set jsx to preserve.
  ```
- Evidence 3, a `.ts` test fails through a transitive import (scratch `components/game/useFeedGame.test.ts`, which only imports the module). `useFeedGame.ts:5` imports `./sprites`, which is a `.tsx` file:
  ```
  FAIL  components/game/useFeedGame.test.ts
    File: /tmp/s6review.IhNS/components/game/sprites.tsx:46:6
  ```
  So S7 target `components/game/useFeedGame.test.ts` (backlog S7, Files) cannot pass on this harness. `@testing-library/react` and `jsdom` were added "for component tests" but cannot be used yet.
- Suggested fix (verified in scratch: 3 files / 5 tests pass, 0 parse failures in coverage, and the Panel test passes):
  ```ts
  export default defineConfig({
    oxc: { jsx: { runtime: "automatic" } },
    ...
  ```
  `@vitejs/plugin-react` would also work, but it adds a dependency. Add one tiny `.tsx` smoke test, such as rendering `Panel`, so a regression here fails CI.

### F2 (major): overriding `exclude` drops Vitest's defaults, so nested worktrees and their `node_modules` get collected
- Location: `vitest.config.ts:11-12`
  ```ts
  include: ["**/*.test.{ts,tsx}"],
  exclude: ["node_modules/**", ".next/**"],
  ```
  `configDefaults.exclude` is `["**/node_modules/**","**/.git/**"]`. The new `node_modules/**` pattern is anchored to the root only.
- Evidence (scratch copy with a fake `.claude/worktrees/fake/lib/x.test.ts` and a fake `.claude/worktrees/fake/node_modules/pkg/y.test.ts`; `npx vitest list`):
  ```
  lib/typing.test.ts > typing state > starts as not typing
  ...
  .claude/worktrees/fake/lib/x.test.ts > nested worktree test
  .claude/worktrees/fake/node_modules/pkg/y.test.ts > nested node_modules test
  ```
  The main checkout currently has four worktrees under `.claude/worktrees/`. Each `node_modules` contains 7 stray `*.test.ts` files (`node_modules/tsconfig-paths/src/__tests__/...`). `npm test` in `/home/nhannguyen/dev/my-portfolio` would run every worktree's tests plus those package tests. That is slow at best and gives false failures at worst. CI is not affected (fresh checkout).
- Suggested fix (verified in scratch: only `lib/typing.test.ts` is listed):
  ```ts
  import { configDefaults, defineConfig } from "vitest/config";
  exclude: [...configDefaults.exclude, ".next/**", ".claude/**", "coverage/**"],
  ```
  Alternatively, narrow `include` to `["{app,components,lib}/**/*.test.{ts,tsx}"]`.

### F3 (minor): ESM config loaded as CommonJS warning. Fix it now, since it costs one rename
- Location: `vitest.config.ts:1`. Every run prints `(!) ... ESM syntax in a file loaded as CommonJS (vitest.config.ts:1:1)`. Vite says this loader becomes the default in a future major. At that point the config would stop loading.
- Evidence: in scratch, renaming to `vitest.config.mts` removed the warning, and `npm test` / `--coverage` behaved the same.
- Suggested fix: rename to `vitest.config.mts`, and add `"**/*.mts"` to `tsconfig.json:19` `include`. Without that, `tsc --noEmit` would stop type-checking the config, which it does today via `**/*.ts`. Do not set `"type": "module"` in `package.json`: it changes resolution for every `.js` file in the repo, which is out of scope for this slice.

### F4 (minor): CLAUDE.md still says there are no tests
- Location: `CLAUDE.md:12`: `- There is no test suite yet.`
- The build log lists this as a follow-up. It is one line, and the slice creates the suite, so change it here: replace it with `npm test` / `npm run test:coverage` in Commands. Otherwise agents reading CLAUDE.md will skip running tests.

### F5 (minor): jsdom 30.1.2 raises the effective Node floor to 22.22.2
- Evidence: `npm view jsdom@30.1.2 engines` gives `"node": "^22.22.2 || ^24.15.0 || >=26.0.0"`, and `vitest@5.0.3` gives `^22.12.0 || ^24.0.0 || >=26.0.0`. CI (`node-version: 22` resolves to the latest 22.x) and local Node v22.23.1 both satisfy this. A contributor on Node 22.12 to 22.22.1 gets EBADENGINE warnings and possibly a broken jsdom.
- Suggested fix: when S1 adds `engines.node`, use `">=22.22.2"` (or the jsdom range), not `>=22`. Note this in the S1 handoff.

### F6 (nit): `jsdom` is the global environment, including for pure logic and route tests
- Location: `vitest.config.ts:10`. Environment setup takes 92% of the 1.52 s run. I probed the jsdom environment for Fetch API breakage (`new Request(url, { signal: AbortSignal.timeout(1000) })`, `NextResponse.json`). All passed, so this is about speed and clarity, not correctness.
- Suggestion: default to `environment: "node"`, and opt in per file with `// @vitest-environment jsdom` (or use `projects`) for component tests.

### F7 (nit): listener leaks if the assertion fails
- Location: `lib/typing.test.ts:20`. `unsubscribe()` runs after `expect`, so a failure leaves the listener in the module-level `Set`, where later tests' `setTyping` calls hit it. Move the cleanup into `afterEach` or a `try/finally`.

### F8 (nit): coverage reporters lack machine-readable output
- Location: `vitest.config.ts:15`, `reporter: ["text", "html"]`. The standard's "80% on changed code" check will need `json-summary` or `lcov` later. Add it then, or now at no cost.

### F9 (nit): out-of-scope transitive bumps in the lockfile. Mention them in the PR body
- Evidence (node script diffing `packages` of `135f1e8:package-lock.json` against HEAD): 113 entries added (all `dev: true`; 27 are optional platform binaries), 2 removed, 2 version changes:
  ```
  node_modules/nanoid 3.3.18 -> 3.3.20
  node_modules/source-map-js 1.2.1 -> 1.2.2
  removed node_modules/@emnapi/runtime 1.11.3
  removed node_modules/@img/sharp-wasm32 0.35.4
  ```
  Both bumps are in-range patches. The two removed entries were orphans: no package in the old lockfile depended on `@img/sharp-wasm32`, and `sharp`'s `optionalDependencies` did not list it. `next`, `react`, `react-dom`, `eslint`, `typescript`, `eslint-config-next` and `@types/react` did not change (15.5.25 / 19.2.8 / 19.2.8 / 9.39.5 / 5.9.3 / 15.5.25 / 19.2.18). `npm audit` goes from 10 to 9 findings (the `source-map-js` high advisory is gone). The 2,461-line churn is plausible for vitest + vite 8 + rolldown + jsdom. It is harmless, but say so in the PR so S1's rebase is not surprised by it.

## Checks the conductor asked for

| Item | Result |
|---|---|
| (a) `npm test` | Exit 0: 1 file, 3 tests passed (with the Vite CJS warning) |
| (a) `npm run test:coverage` | Exit 0: text table plus `coverage/index.html` written, no thresholds. 21 `.tsx` files excluded by parse errors (F1) |
| (a) `npm run verify` | Exit 0, no output from tsc or eslint |
| (b) versions exist | `vitest` 5.0.3, `@vitest/coverage-v8` 5.0.3, `jsdom` 30.1.2, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2: each is the current `latest` on the registry and none is deprecated. No typos. Resolved `vite` is 8.3.3 (vitest peer `^6.4.0 \|\| ^7.0.0 \|\| ^8.0.0`) |
| (b) peers | RTL 16.3.3 peers `react`/`react-dom` `^18 \|\| ^19` (installed 19.2.8) and `@testing-library/dom ^10` (10.4.2). `@vitest/coverage-v8` peers `vitest 5.0.3` exactly. `vitest` peers `@types/node ^22 \|\| >=24` (22.20.1). `npm ls --all` exits 0. Node: see F5 |
| (b) freshness | jsdom 30.1.2 was published 2026-10-04 and vitest 5.0.3 on 2026-09-30, both a few days old. The lockfile pins them with integrity hashes. Acceptable |
| (c) sample test meaningful | Yes. All 8 mutants of `lib/typing.ts` were killed in scratch: dedupe removed, wrong value notified, unsubscribe no-op, `isTyping` constant false, state not stored (2 failures), subscribe no-op, initial state true, no notify. It also passed 3 runs with `--sequence.shuffle` |
| (d) alias | `@` maps to `<root>/`, which matches tsconfig `@/*` to `./*`. Scoped packages (`@testing-library/...`) are not affected. include/exclude: F2. Warning: F3 |
| (e) ignores | `.gitignore` `coverage/` is the standard pattern. No tracked path contains `coverage` (`git ls-files \| grep -i coverage` is empty). The eslint `coverage/**` ignore is root-anchored and correct; without it eslint would lint the generated `prettify.js` and related files |
| (f) ci.yml | Steps run `npm ci`, typecheck, lint, `npm test`, build. `TODO(tests)` removed, `TODO(audit)` unchanged (diff is +1/-1) |
| (g) package.json | Only the `test` and `test:coverage` scripts and 5 devDependencies were added. `dependencies` unchanged. Lockfile: F9 |
| (h) secrets | Pattern scan of the non-lockfile diff for key, token, password, `re_` and private-key patterns found nothing |
| (i) S1 conflict | Confirmed. `04-build.md` Follow-ups says S1 edits `package.json`, `package-lock.json` and `ci.yml`, and recommends regenerating the lockfile with `npm install` after resolving |

## Traceability matrix

| Criterion | Code | Test / evidence | Verdict |
|---|---|---|---|
| (1) `npm test` runs and passes | `package.json` `"test": "vitest run"`, `vitest.config.ts` | `npm test` exit 0, 3/3. `lib/typing.test.ts` kills 8/8 mutants | Pass. Harness cannot run TSX yet (F1) |
| (2) `npm run test:coverage` writes a report, no global floor | `package.json` `"test:coverage"`, `vitest.config.ts:13-18` (no `thresholds`) | Exit 0, `coverage/index.html` present, gitignored (`.gitignore:20`) | Pass, but the report omits all 21 `.tsx` files (F1) |
| (3) CI runs `npm test`, `TODO(tests)` removed | `.github/workflows/ci.yml:28` | Diff shows the step added and the TODO line removed. `TODO(audit)` retained | Pass (not executed in Actions) |

## What I ran
- `git diff 135f1e8..HEAD` (stat, full non-lockfile diff), `git log`, `git status` (clean before and after my review, apart from this file).
- `npm test`, `npm run test:coverage` (3 times), `npm run verify`, `npm ls --depth=0`, `npm ls --all`, `npm audit --json` (HEAD, and the base lockfile in a scratch directory).
- `npm view` for version, engines, peerDependencies, publish time and deprecation of all 5 packages plus vite.
- Scratch copy `/tmp/s6review.IhNS`: the tracked files, with `node_modules` symlinked to the worktree's. In it I ran the mutation tests, the TSX component test, the transitive-import test, the nested-worktree collection test, the jsdom Fetch API probe, and verified the F1, F2 and F3 fixes. The worktree itself was not modified.

## What I did not verify
- The GitHub Actions run itself (no push). Whether `npm ci` succeeds on a fresh runner was inferred from `npm ls --all` exit 0 and the lockfile root matching `package.json`.
- `npm run build` (excluded by instruction). The new devDependencies cannot reach the Next bundle, but I did not prove it.
- Running `npm test` in the main checkout. F2 was reproduced in scratch with fake nested worktrees, not against the real `/home/nhannguyen/dev/my-portfolio`.
- Windows or macOS behavior of the alias path (`fileURLToPath(new URL("./", ...))` yields a trailing separator and works on Linux).
- Whether the `oxc` JSX fix interacts with future `next/jest`-style mocks of `next/image` or `next/font`. That belongs to S7.

## Resolution (conductor, 2026-10-06)

F1-F4, F7 and F8 were fixed in `fe600d7` and re-verified independently in the slice worktree: `npm test` passes (2 files, 4 tests); `npm run test:coverage` prints zero "Failed to parse" lines and reports the real baseline of 0.95% lines (the earlier 1.25% excluded 21 `.tsx` files); `npm run verify` passes; `npx vitest list` shows only the real tests (no `.claude` or `node_modules` paths).
Carried forward: F5 (jsdom 30 raises the effective Node floor to 22.22.2) into the S1 `engines.node` decision; F6 (default jsdom environment) and F9 (transitive lockfile bumps) for the PR body.
