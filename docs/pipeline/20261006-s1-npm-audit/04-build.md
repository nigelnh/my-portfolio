# 04 Build: S1 Clear npm audit and in-range bumps

Branch: `chore/npm-audit-clear` (created from `chore/pipeline-bootstrap`). Tier M, risk none, no characterization tests (config and dependency change only).

## Slice goal and IDs
Slice S1 (audit "Dependencies"). Apply the highest in-range versions, clear whatever `npm audit` clears without a major bump, declare `engines.node`, add the CI audit step only if clean.

## Files changed
- `package.json`: next and eslint-config-next `^15.5.27`; react, react-dom, @types/react, @types/react-dom `^19.3.0`; `engines.node ^22.22.2` (owner decision: stays on the Node 22 line CI and the owner use, and satisfies jsdom 30, added by a later slice, which needs >=22.22.2).
- `package-lock.json`: regenerated. Includes `npm audit fix` without `--force` (sharp 0.35.5, source-map-js 1.2.2, brace-expansion 1.1.18 to 1.1.21 and nested 5.0.9 to 5.0.12), scheduler 0.27.0 to 0.28.0 (required by react-dom 19.3.0), the next SWC platform binaries for 15.5.27, and the restored `@img/sharp-*` optional platform packages (the old lockfile recorded only darwin-arm64 and wasm32, so the Linux binaries CI and Vercel need were missing).
- `.github/workflows/ci.yml`: audit step NOT added; `TODO(audit)` comment updated with the reason.
- This file.

## Registry check
`npm view` / `npm outdated` confirmed the auditor's versions exist: next and eslint-config-next 15.5.27 (highest 15.x), react and react-dom 19.3.0, @types/react and @types/react-dom 19.3.0. Not applied (out of scope, major): next 16.3.8, eslint 10, typescript 7, @types/node 26.

## Commands and results
- `npm ci`: ok.
- `npm audit fix` (no force): fixed sharp and source-map-js.
- `npm run verify` (tsc + eslint): exit 0.
- `npm run build`: compiled successfully, exit 0.
- `npm audit --omit=dev --audit-level=high`: exit 1 (before: 4 vulnerabilities in prod deps; after: 2).
- Not run: `npm run dev`, browser check (no runtime code changed beyond patch/minor bumps).

## Remaining advisories (all closed by S5, Next 16)
Production:
- postcss <=8.5.22 (high) bundled at 8.4.31 inside next 15: GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849.
- next itself (moderate, flagged only through the postcss dependency). `npm audit` says the fix is next@16.3.8, a major.
Dev-only (`npm audit` full, not in `--omit=dev`): braces GHSA-vfj7-8cjw-p6xm via micromatch, fast-glob, @next/eslint-plugin-next, eslint-config-next. No fixed braces version exists as of 2026-10-06 and eslint-config-next 16 still depends on it, so S5 does not close it. It stays accepted: dev-only, and lint-time globs come from repo config. The CI gate stays at `--omit=dev`.
Exposure note: the postcss issues concern CSS stringify and source maps of untrusted CSS; the site processes only its own CSS at build time.

## Deviations
- The worktree was created from `main`, not `chore/pipeline-bootstrap`; I reset my empty branch to the bootstrap branch before starting (no work lost).
- CI audit step not added (accept 4 says only once it exits 0). Accept 1 is met through the "each remaining advisory listed, S5 closes it" branch.
- Considered an npm `overrides` for postcss; rejected as out of scope (would force a postcss version Next 15 was not tested with).

## Follow-ups
- S5 must add the CI audit step and remove `TODO(audit)`.
- S6 (vitest) edits package.json, package-lock.json and ci.yml on another branch: expect a routine rebase conflict at PR time; regenerate the lockfile with `npm install` after resolving package.json.
