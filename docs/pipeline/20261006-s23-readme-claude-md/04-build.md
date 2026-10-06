# S23 README and CLAUDE.md correction: build log

**Slice goal:** make README.md and CLAUDE.md match the code after gate decision 3 (Vietnamese and screen-pet removal were intentional). Docs only; Tier S; no characterization tests required.

**Stories:** backlog S23 (gate decision 3, audit Docs).

## Files changed
- `README.md`: removed Vietnamese (intro, `lib/copy.ts` note), `SoundToggle.tsx`, the "screen pet, cursor chasing" section (replaced by "Free roaming"), the PET button text; sound switch now points to `components/blob/BlobSettings.tsx`; contact rate limit corrected to 5 per 60 s per IP (`MAX_PER_WINDOW = 5`, `WINDOW_MS = 60_000`, in memory); layout tree gained `components/game/*`, `app/api/contact/`, `lib/typing.ts`; sprite table rewritten to real usages (the old one named `blob-idle`, `blob-wink`, `blob-wave` as icons, which are not in `ICONS`); removed the claim that the Contact box uses the `wave` pose (no component renders it) and the "kit HUD" claim.
- `CLAUDE.md`: dropped the stale-README notes; Gotchas now states the real rate limit and the sound switch location. 23 lines.
- `docs/pipeline/20261006-s23-readme-claude-md/04-build.md`: this file.

## Commands run and results
- `grep -nE 'Vietnamese|SoundToggle|\bPET\b|screen-pet|chas(e|ing)' README.md CLAUDE.md`: no output (exit 1).
- Path check: every backticked path in README.md and every layout-tree entry resolved with `ls`; the only non-resolving names are bare basenames shown under a directory in the tree (`globals.css`, `useBlobBrain.ts`, ...) and the two external design source files (`Portfolio.dc.html`, `pixel_blob_icon_kit_interactive_showcase.html`).
- No application code, package file or `.github` file changed. typecheck/lint/tests not run (docs only).

## Deviations
- The worktree was created from `main`, not `chore/pipeline-bootstrap`; I reset the empty branch to `chore/pipeline-bootstrap` to get CLAUDE.md and `docs/modernization/`. No other effect.
- The README sections on blob vitals and the MacBook shell were left as is; they were not part of the stated defects, and the vitals constants matched `RULES` where spot-checked.

## Follow-ups
- Housekeeping slice still owns the stale comment at `components/blob/useBlobBrain.ts:15` and the dead `chasing` branch in `useBlobBrain.ts`; `ICON_META` in `components/icons.tsx` still carries Vietnamese names.
- Re-check the rate-limit sentence if S3 changes the limiter.
