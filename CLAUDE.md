# my-portfolio

Personal portfolio for Nhan Nguyen: a pixel-art / retro-window design in English and Chinese (`en`, `zh`; the README still says Vietnamese, which the code no longer has), deployed on Vercel. Implemented from a Claude Design artboard (see README).

## Stack
Next.js 15 (App Router), React 19, TypeScript, plain CSS with design tokens in `app/globals.css`, `next/font`. The contact form sends mail through Resend, server-side only.

## Commands
- `npm run dev`: dev server on http://localhost:3000
- `npm run verify`: typecheck plus lint. Use this while the dev server is running.
- `npm run build` then `npm run start`: production build
- `npm test` runs the Vitest unit tests; `npm run test:coverage` writes a coverage report (no global floor yet).

## Gotchas
- **Never run `npm run build` while `npm run dev` is running.** Both write `.next/` and the dev server breaks. Recovery is in README.
- `RESEND_API_KEY` is server-side only. Never prefix it with `NEXT_PUBLIC_`, never commit a real value (pull with `vercel env pull`). Variable names live in `.env.example`.
- Styling is plain CSS with tokens: do not hard-code colors or spacing in components.
- Two languages (`LANGS` in `lib/copy.ts`): visible text goes through `lib/copy.ts` and `lib/i18n.tsx`, not inline strings. Add a key to both `en` and `zh`.
- The README is partly stale (it lists `SoundToggle.tsx`, which does not exist, and an old contact rate limit). Trust the code; the contact form allows 5 requests per minute per IP.
- Icons come from the registry in `components/icons.tsx`.

## Standards and pipeline
Follow the `standards-web` skill. Run `cc-pipe` for tiered, gated delivery; per-feature artifacts go in `docs/pipeline/<yyyymmdd>-<slug>/`, retrofit notes in `docs/modernization/`, decisions in `docs/adr/`.
