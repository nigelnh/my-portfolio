# S6 Vitest harness: build log

**Goal:** a working unit-test runner with coverage reporting and a CI step; closes `TODO(tests)`. Backlog slice S6 (audit Tests). Tier M, no risk flags.

## Files changed
- `package.json`, `package-lock.json`: devDependencies `vitest@5.0.3`, `@vitest/coverage-v8@5.0.3`, `jsdom@30.1.2`, `@testing-library/react@16.3.3`, `@testing-library/dom@10.4.2`; scripts `test` (`vitest run`) and `test:coverage` (`vitest run --coverage`).
- `vitest.config.mts` (renamed from `.ts`; `**/*.mts` added to tsconfig include): jsdom, `oxc.jsx.runtime: automatic`, default excludes kept plus `.next`, `.claude`, `coverage` environment, `@` alias to the repo root (same as tsconfig `@/*`), v8 coverage (text + html), no thresholds.
- `lib/typing.test.ts`: three tests of `lib/typing.ts` (initial state, notify only on change with dedupe, no calls after unsubscribe).
- `.github/workflows/ci.yml`: `npm test` step after lint; `TODO(tests)` removed.
- `.gitignore`, `eslint.config.mjs`: ignore `coverage/` (otherwise eslint lints generated report JS).

## Commands run
- `npm test`: 2 files, 4 tests passed (adds `components/Panel.test.tsx`, a JSX smoke test).
- `npm run test:coverage`: report written to `coverage/`, exit 0, no floor (real baseline after review fix: 0.95% lines, 1.03% statements, 0.62% branches, 2.63% functions over 1045 lines; the earlier 1.25% was wrong because 21 .tsx files were silently excluded by a JSX parse failure; zero "Failed to parse" lines now).
- `npm run verify` (tsc + eslint): exit 0, no warnings.
- Not run: `npm run build` (not in S6 Verify), the CI workflow itself (no push).

## Deviations
- Added `@testing-library/dom@10.4.2`: required peer of `@testing-library/react` (not in the backlog list).
- Worktree was created from `main`; fast-forwarded to `chore/pipeline-bootstrap` before starting (no divergence).
- TDD note: the sample test was written before the config but the runner could not run without it; red state was not observed separately.
- Review fixes F1-F4, F7, F8 applied: JSX compile, default excludes, `.mts` config (removes the ESM warning), CLAUDE.md test line, listener cleanup in afterEach, json-summary reporter. `npx vitest list` shows only the 4 real tests.
- `@testing-library/react` and jsdom are installed but unused until S7/component tests.

## Follow-ups
- S1 also edits `package.json`, `package-lock.json` and `ci.yml` on another branch: expect a routine rebase conflict at PR time (regenerate the lockfile with `npm install` after resolving).
- Update CLAUDE.md "There is no test suite yet" line once merged.
- Raise coverage after S7; floor stays off until then.
