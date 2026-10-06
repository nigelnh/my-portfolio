# 05 Review: S1 Clear npm audit and in-range bumps

Reviewer: Claude Opus 5.5 (implementer was Sonnet 5.5). Branch `chore/npm-audit-clear` at `9e57850`, base `135f1e8`. Reviewed diff: `git diff 135f1e8..HEAD` (4 files, +697/-208).

## Verdict: CHANGES REQUESTED

Blockers: 0. Majors: 1. Minors: 2. Nits: 1.

The dependency work itself is correct. Every pinned version exists and is the highest in its major. The lockfile churn is fully explained. The tree is peer-clean, and verify, build and a production smoke all pass. The one major is `engines.node: ">=22"`: on Vercel this setting lets the production Node major float above the Node 22 that CI tests. The fix is one line. If Nhan wants `>=22` on purpose (the backlog text says `(>=22)`), recording that decision downgrades the finding, and the slice can then be approved once the two doc corrections are made.

## Findings

### M1 (major): `engines.node ">=22"` lets the Vercel build and runtime float to a Node major CI never tests
- Location: `package.json:5-7`
- Evidence:
  ```json
  "engines": {
    "node": ">=22"
  },
  ```
  CI pins `node-version: 22` (`.github/workflows/ci.yml:21-23`). `@types/node` is `^22.15.3`. Backlog S5 says "keep aligned with CI Node 22". The repo has no `.nvmrc`, `.node-version` or `vercel.json` (`git ls-files | grep -iE 'vercel|nvmrc|node-version'` returns nothing). That makes `engines.node` the only Node signal Vercel reads. Vercel lets `engines.node` override the Node version set in the project. For an open range like `>=22`, Vercel picks the newest major it supports and warns that the version "will automatically upgrade when a new major Node.js version is released". From this deploy onward, production would probably build and run on Node 24.x, and later on whatever newer major Vercel adds, while CI and local development stay on 22.x (local is v22.23.1).
- Why it matters: a framework bump PR should not also change the production runtime major without saying so. Node 22 to 24 rarely breaks a Next 15 app, but the change would be untested and silent, and later jumps would happen without any commit.
- Suggested fix: declare `"node": "22.x"`. It matches CI, `@types/node` 22 and S5's "keep aligned" note, and Vercel treats it as a pin to the 22 major. Plain `npm install` only warns on an engines mismatch (`engine-strict` is off by default), so local developers on newer Node are not blocked. Move to `24.x` deliberately in a later slice that also bumps CI and `@types/node`. If `>=22` is kept on purpose, record it as a gate decision and check the Node version in the Vercel preview build log.
- Not verified: the Node version currently set in the Vercel project settings, and the Vercel build log for this branch. Both are needed to confirm which major the preview resolves to.

### m1 (minor): 04-build.md wrongly says the dev-only braces advisory "clears with eslint-config-next 16 in S5"
- Location: `docs/pipeline/20261006-s1-npm-audit/04-build.md:29`
- Evidence: the advisory covers every version that exists. `npm audit --json` gives `braces GHSA-vfj7-8cjw-p6xm range <=3.0.3`, and `npm view braces version` gives `3.0.3`, so there is no patched braces. The v16 chain still pulls it in:
  ```
  npm view @next/eslint-plugin-next@16.3.8 dependencies  -> { "fast-glob": "3.3.1", ... }
  npm view fast-glob@3.3.1 dependencies                  -> { "micromatch": "^4.0.4", ... }
  npm view micromatch@4.0.8 dependencies                 -> { "braces": "^3.0.3", ... }
  ```
  `npm audit`'s only suggested "fix" is to downgrade to `eslint-config-next@14.2.35`.
- Impact: this does not affect S1 or S5 acceptance, because both use `--omit=dev`. A future full `npm audit` gate, or a reader who trusts this note, would be misled.
- Suggested fix: rewrite line 29 to say that braces has no upstream fix as of 2026-10-06, is dev-only (lint-time glob patterns come from repo config, not from untrusted input), and is accepted until a fix ships. Keep the CI step at `--omit=dev`.

### m2 (minor): 04-build.md and the commit message under-report the lockfile churn
- Location: `docs/pipeline/20261006-s1-npm-audit/04-build.md:10` and `:19`. The commit `9e57850` body says only "Clears the sharp and source-map-js advisories".
- Evidence (my parse of both lockfiles with `python3 -I`): 24 packages changed version, 23 were added, 0 were removed. Changes the document does not mention:
  - `brace-expansion` 1.1.18 -> 1.1.21 and `@typescript-eslint/typescript-estree/node_modules/brace-expansion` 5.0.9 -> 5.0.12 (dev). `npm audit fix` also cleared these, closing GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7 and GHSA-6j4f-fj2g-mc7p. Base audit: 10 advisories (1 moderate, 9 high). Head: 7 (1 moderate, 6 high).
  - `scheduler` 0.27.0 -> 0.28.0. This is a 0.x "major", but it is required: `npm view react-dom@19.3.0 dependencies` gives `{"scheduler":"^0.28.0"}`.
  - 23 new optional `@img/sharp-*` platform packages (linux-x64, linuxmusl, win32, darwin-x64 and others), all 0.35.5 / libvips 1.3.4. The base lockfile listed all 25 platform packages in sharp's `optionalDependencies` but recorded only `sharp-darwin-arm64` and `sharp-wasm32`, the known pruned-lockfile problem (npm cli #4828). The new lockfile restores the Linux binaries that CI and Vercel need. This is an improvement, but it is undocumented.
- Suggested fix: add these three bullets to 04-build.md and to the PR description, so the reviewer of the squash merge knows they are intended.

### n1 (nit): `npm ls` reports two extraneous packages
- Evidence: `npm ls` prints `@emnapi/runtime@1.11.3 extraneous` and `@img/sharp-wasm32@0.35.5 extraneous`. They come from the cross-platform lockfile: on Linux the packages that depend on them (`@img/sharp-freebsd-wasm32` and `@img/sharp-webcontainers-wasm32`, both platform-restricted) are skipped, but the wasm32 package itself has no `os`/`cpu` field, so it is still installed. The base lockfile had the same two entries. No action needed. Mention it only if someone asks about the `npm ls` noise.

### Info (no action on this slice)
- A PR to `main` would also carry the bootstrap commit `135f1e8` (`git log main..HEAD` shows 2 commits). Merge `chore/pipeline-bootstrap` first, or target it.
- `next start` warned "inferred your workspace root" because this worktree sits inside the main checkout, which has its own lockfile. That comes from the environment, not the slice.

## Checks requested by the orchestrator

(a) Versions exist and are the highest in their majors. Each list was semver-sorted with prereleases excluded:
```
react            stable 19.x max 19.3.0   (published 2026-09-09; also npm `latest`)
react-dom        stable 19.x max 19.3.0
@types/react     stable 19.x max 19.3.0
@types/react-dom stable 19.x max 19.3.0
next             stable 15.x max 15.5.27  (published 2026-09-30; dist-tag `backport`)
eslint-config-next stable 15.x max 15.5.27
next dist-tags: latest 16.3.8, canary 16.4.0-canary.62
```
None of the versions is missing or looks wrong. Installed versions match (`npm ls`: next@15.5.27, react@19.3.0, react-dom@19.3.0, @types/react@19.3.0, @types/react-dom@19.3.0, eslint-config-next@15.5.27).

(b) Lockfile churn. lockfileVersion 3 in both. The root entry changes only the bumped ranges plus `engines`. Changed: the 13 `@next/*` and next / eslint-config-next packages 15.5.25 -> 15.5.27; react / react-dom 19.2.8 -> 19.3.0; @types/react 19.2.18 -> 19.3.0; @types/react-dom 19.2.7 -> 19.3.0; scheduler 0.27.0 -> 0.28.0; sharp and its present binaries 0.35.4 -> 0.35.5 (libvips 1.3.3 -> 1.3.4); source-map-js 1.2.1 -> 1.2.2; brace-expansion x2 (see m2). Added: 23 optional @img/sharp-* packages. Removed: none. No package kept its version while its integrity or resolved URL changed. Every `resolved` points to `https://registry.npmjs.org/`, and every non-link entry has an `integrity`. The only "major" is scheduler 0.x, which react-dom requires. Each change is explained by the intended bumps or by `npm audit fix`.

(c) Peers. `npm ls` exits 0 with no `invalid`, `missing` or `UNMET PEER`. The `UNMET OPTIONAL DEPENDENCY` lines are only platform binaries for `@unrs/resolver-binding-*` plus `eslint-plugin-import-x@*`, all optional. Peer ranges checked: next@15.5.27 needs react/react-dom `^18.2.0 || ^19.0.0` and 19.3.0 is installed; eslint-config-next@15.5.27 needs eslint `^7.23.0 || ^8.0.0 || ^9.0.0` and 9.39.5 is installed; @types/react-dom@19.3.0 needs @types/react `^19.3.0` and 19.3.0 is deduped.

(d) `npm run verify` gives `tsc --noEmit && eslint` with exit 0 and no output. `npm run build` (run once, no dev server) prints `Next.js 15.5.27`, `Compiled successfully`, `Generating static pages (7/7)`, routes `/`, `/_not-found`, `/api/contact`, `/api/embeddable`, `/icon.svg`, First Load JS shared 103 kB, exit 0.

(e) Audit. `npm audit --omit=dev --audit-level=high` exits 1 with 2 vulnerabilities (1 moderate, 1 high): `postcss <=8.5.22` (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849) at `node_modules/next/node_modules/postcss` 8.4.31, and `next 9.3.4-canary.0 - 16.3.0-preview.10` through postcss. This matches the implementer's claim exactly. S5 genuinely closes it: `npm view next@16.3.8 dependencies.postcss` gives `8.5.23` (above 8.5.22); `npm view postcss version` gives 8.5.29; `next@15.5.27` still pins `8.4.31`, so no in-major fix exists. Exposure is limited because the build processes only first-party CSS, though I did not audit the CSS pipeline. A full `npm audit` shows 7 (1 moderate, 6 high): the postcss pair plus the braces chain (dev). S5 does not close braces (m1).

(f) engines: see M1. `22.x` is the safer declaration.

(g) ci.yml: the only change is the comment on line 30 (`TODO(audit)`). No audit step was added, which is correct because accept (4) is not met while the production audit exits 1. The `TODO(audit)` cites the 04-build doc as its reference. The standard asks for an issue reference, but the existing bootstrap convention cites backlog slice IDs, so this matches.

(h) S6 conflict confirmed. `git merge-tree --write-tree --name-only HEAD chore/vitest-harness` (merge-base `135f1e8`) reports `CONFLICT (content)` in `.github/workflows/ci.yml`, `package-lock.json` and `package.json`. Resolution: keep both script and devDependency blocks in package.json; in ci.yml keep S6's `npm test` step and S1's `TODO(audit)` text; then regenerate the lockfile with `npm install` and re-run `npm audit` (S6 adds vitest 5, jsdom 30 and @testing-library). By contrast, `feat/security-headers` (S2) merges cleanly.

(i) No unrelated change: the diff touches only the 4 listed files. A secret-pattern scan of the slice diff (`api_key|secret|token|password|bearer|re_…|sk_…|ghp_|AKIA…|BEGIN`) found nothing. There are no non-registry tarballs. The commit author is the repo owner's noreply address and the subject follows Conventional Commits.

## Traceability matrix

| # | Acceptance criterion | Code | Test / evidence | Verdict |
|---|---|---|---|---|
| 1 | `npm audit --omit=dev --audit-level=high` exits 0, or each remaining advisory is listed with S5 as closer; no blind `--force` | `package-lock.json` (audit fix applied, no force) | My audit exits 1 with exactly postcss (4 GHSAs) and next-via-postcss, both listed in 04-build.md:26-28 with S5 as closer; next@16.3.8 ships postcss 8.5.23 > 8.5.22; next stayed in 15.x, so no `--force` was used | PASS via the "listed" branch. Doc error on the dev-only braces item (m1) |
| 2 | next/eslint-config-next 15.5.27, react/react-dom/@types/react 19.3.0 applied | `package.json:17-19,23-24,26`; lockfile | `npm ls` shows those exact versions; registry shows each is the highest in its major | PASS |
| 3 | `engines.node` (>=22) declared | `package.json:5-7` | Declared literally as specified | PASS per the letter. CHANGES REQUESTED on the value (M1: `22.x` is safer on Vercel) |
| 4 | Audit step added to CI only once it exits 0 | `.github/workflows/ci.yml:30` | Production audit exits 1, so no step is added and the TODO is updated | PASS |
| Verify | `npm ci && npm audit … && npm run verify && npm run build` | n/a | `npm ci` exit 0; audit exit 1 (expected, criterion 1 alternative branch); verify exit 0; build exit 0 | PASS (with the expected audit exit) |

No automated test covers any criterion. That is expected for a config-only slice with no test runner yet (S6). The evidence is the command output above.

## What I ran
- `git status`, `git log`, `git diff --stat` and `git diff 135f1e8..HEAD` on package.json and ci.yml; read 04-build.md, backlog S1 and S5, ci.yml.
- `npm view` for next, eslint-config-next, react, react-dom, @types/react and @types/react-dom (version lists sorted by semver in python3 -I), dist-tags, publish times, peerDependencies, `next@15.5.27` / `next@16.3.8` postcss pins, postcss, braces, fast-glob, micromatch, @next/eslint-plugin-next@16.3.8, react-dom 19.2.8 / 19.3.0 dependencies, sharp 0.35.4 / 0.35.5 optionalDependencies.
- A lockfile diff script (`python3 -I`, in /tmp/s1review) comparing versions, flags, integrity, resolved URLs, and added and removed packages.
- `npm audit --package-lock-only` on a /tmp copy of the base package.json and lockfile (10 advisories) for the before/after comparison.
- In the worktree: `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm audit` (full and `--json`), `npm ls`, `npm ls --all` (grepped), `npm run verify`, `npm run build` (once, no dev server running).
- `next start -p 3917` in a production smoke: `GET /` gives 200 (60.7 kB, `<html lang="en">`), `GET /nope` gives 404. The server was stopped in the same command, and `pgrep` confirmed it was gone.
- `git merge-tree` against `chore/vitest-harness` and `feat/security-headers`; `git log main..HEAD`; a secret-pattern scan of the slice diff (matches would have been redacted; there were none).

## What I did NOT verify
- The Vercel project's configured Node version, and which Node version a Vercel preview of this branch resolves to (see M1). No Vercel preview was inspected.
- A browser or visual check: no hydration-warning check in a real browser, no interaction with the terminal, game or contact form under React 19.3. The only runtime check was the HTTP smoke above.
- `npm run dev` (deliberately not run).
- The React 19.2 -> 19.3 and Next 15.5.25 -> 15.5.27 release notes for behavior changes. I relied on typecheck, lint, build and the smoke.
- Whether any build-time CSS input could be attacker-controlled (the basis of the postcss exposure note).
- macOS and Windows installs from the new lockfile (only Linux `npm ci` was exercised).

## Resolution (conductor, 2026-10-06)

Major fixed in `0a78bec`: `engines.node` is now `^22.22.2` (the owner's decision: stays on the Node 22 line that CI and the owner's machine use, and satisfies jsdom 30 from slice S6). Both minors fixed: `04-build.md` no longer claims S5 clears the dev-only `braces` advisory (accepted, unfixed, dev-only) and now lists the omitted lockfile changes. Re-verified independently: `npm run verify` passes; `npm audit --omit=dev` lists only the nested postcss advisories that come in through next 15, which S5 (the Next 16 upgrade) closes. Nit carried to the PR body: the S6 rebase conflict on package.json, package-lock.json and ci.yml is expected.
