# S6 Vitest harness: build log

**Goal:** a working unit-test runner with coverage reporting and a CI step; closes `TODO(tests)`. Backlog slice S6 (audit Tests). Tier M, no risk flags.

## Files changed
- `package.json`, `package-lock.json`: devDependencies `vitest@5.0.3`, `@vitest/coverage-v8@5.0.3`, `jsdom@30.1.2`, `@testing-library/react@16.3.3`, `@testing-library/dom@10.4.2`; scripts `test` (`vitest run`) and `test:coverage` (`vitest run --coverage`).
- `vitest.config.ts`: jsdom environment, `@` alias to the repo root (same as tsconfig `@/*`), v8 coverage (text + html), no thresholds.
- `lib/typing.test.ts`: three tests of `lib/typing.ts` (initial state, notify only on change with dedupe, no calls after unsubscribe).
- `.github/workflows/ci.yml`: `npm test` step after lint; `TODO(tests)` removed.
- `.gitignore`, `eslint.config.mjs`: ignore `coverage/` (otherwise eslint lints generated report JS).

## Commands run
- `npm test`: 1 file, 3 tests passed.
- `npm run test:coverage`: report written to `coverage/`, exit 0, no floor (baseline 1.25% lines, only `lib/typing.ts` exercised).
- `npm run verify` (tsc + eslint): exit 0, no warnings.
- Not run: `npm run build` (not in S6 Verify), the CI workflow itself (no push).

## Deviations
- Added `@testing-library/dom@10.4.2`: required peer of `@testing-library/react` (not in the backlog list).
- Worktree was created from `main`; fast-forwarded to `chore/pipeline-bootstrap` before starting (no divergence).
- TDD note: the sample test was written before the config but the runner could not run without it; red state was not observed separately.
- Vitest prints a Vite warning that `vitest.config.ts` is ESM in a CommonJS package (`configLoader: 'native'`). Harmless now; fix later via `.mts` or `"type": "module"`.
- `@testing-library/react` and jsdom are installed but unused until S7/component tests.

## Follow-ups
- S1 also edits `package.json`, `package-lock.json` and `ci.yml` on another branch: expect a routine rebase conflict at PR time (regenerate the lockfile with `npm install` after resolving).
- Update CLAUDE.md "There is no test suite yet" line once merged.
- Raise coverage after S7; floor stays off until then.
