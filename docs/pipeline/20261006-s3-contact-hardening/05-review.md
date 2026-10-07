# 05-review: S3 Contact form hardening

- Branch: `fix/contact-form-hardening`, reviewed range `bb9a540..HEAD` (4 commits: 39f8103, e2832be, 0169802, 3211aa6)
- Reviewer: Opus (implementer was Sonnet). Lenses: requirements, correctness, security (PII/secrets, infra), tests, maintainability, UI (honeypot), dependencies. No migrations or OpenAPI contract exist for this slice.
- Date: 2026-10-06

## Verdict: CHANGES REQUESTED

0 blockers, 2 majors, 6 minors, 3 nits.

The core of the slice is solid. The timeout and try/catch work (a real abort was shown to produce 502). The Origin match compares exact URL origins and no lookalike got through. The honeypot returns early. The HTML body is escaped and logs contain no PII. Most mutations turn tests red. Two things block approval:
1. Acceptance criterion (3) is only partly met. C1 control characters, U+2028/U+2029 and bidi overrides pass validation and reach the email `subject`.
2. The Origin allow-list has not been checked against the real production domain set. It fails closed and logs nothing, so a missed domain (www/apex, `*.vercel.app` alias, preview alias) silently breaks the form in production.

---

## Findings

### F1 (major): "control characters rejected in name/email" covers only C0 and DEL; C1, line separators and bidi controls reach the subject
- `app/api/contact/route.ts:26`: `const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;`
- Evidence: scratch probe (vitest, scratch copy outside the repo). Every case below returned 200 and called Resend:
  ```
  VAL name U+2028 -> 200 subject "Portfolio — Ada Bcc: x"
  VAL name U+2029 -> 200 subject "Portfolio — Ada x"
  VAL name U+0085 NEL -> 200 subject "Portfolio — Ada\u0085x"
  VAL name C1 U+009B -> 200 subject "Portfolio — Ada\u009bx"
  VAL name U+202E RLO -> 200 subject "Portfolio — Ada‮x"
  VAL name U+200B ZWSP -> 200
  ```
  U+0080 to U+009F are Unicode category Cc (control characters), so criterion (3) is not met as written. U+2028/U+2029 (Zl/Zp) are line terminators that some mail and log pipelines treat as newlines. U+202E lets a visitor display a reversed or spoofed subject in the owner's inbox. Resend takes JSON, so raw SMTP header injection is unlikely (the subject should be RFC 2047 encoded). That is unverified against Resend, though, and the slice is flagged PII/security. ADR 0002 item 4 and 04-build item 4 also overclaim ("rejects control characters").
- Email is not affected: `z.email()` rejected every Unicode and control case tried (U+2028 inside, trailing U+0085, unicode local part, IDN domain).
- Fix: `const CONTROL_CHARS = /[\p{Cc}\p{Zl}\p{Zp}‪-‮⁦-⁩]/u;` (all Cc including C1, line and paragraph separators, bidi embedding/override/isolate). Do not use all of `\p{Cf}`, which would reject ZWJ in legitimate names. Add `it.each` cases for U+0085, U+009B, U+2028, U+2029 and U+202E in name.

### F2 (major): the Origin allow-list may 403 legitimate production visitors, and the failure is silent
- `app/api/contact/route.ts:69-84` (allow-list = `NEXT_PUBLIC_SITE_URL`, `https://$VERCEL_PROJECT_PRODUCTION_URL`, `https://$VERCEL_URL`, localhost outside production). The 403 branch at the Origin check in `POST` does not log.
- Evidence: the matching is exact (good, see "Origin adversarial results" below), so any serving origin missing from the list gets 403. Origins that serve the production site but are not in the list:
  - the second of www/apex when both are attached without a redirect;
  - the project's stable `<project>.vercel.app` production alias. `VERCEL_URL` is the per-deployment URL, and `VERCEL_PROJECT_PRODUCTION_URL` is the shortest custom domain when one exists;
  - any extra custom domain;
  - preview branch aliases (`<project>-git-<branch>-<team>.vercel.app`), which differ from `VERCEL_URL`. 04-build lists only this last case.

  The client (`components/sections/Contact.tsx:45-47`) turns every non-2xx into the generic `errSend`. Because the route logs nothing on 403, the owner gets no signal that real visitors are being refused.
- Fix (any of these):
  - (a) Before merge, the owner lists the production domains in the Vercel dashboard and confirms that every non-canonical domain 308-redirects to `NEXT_PUBLIC_SITE_URL`.
  - (b) Add an optional `CONTACT_ALLOWED_ORIGINS` (comma-separated, each normalized through `new URL().origin`) for aliases.
  - (c) Log `console.warn("contact origin rejected", new URL(origin).host)`. The host is not visitor PII; wrap it in try/catch.

  Also add `VERCEL_BRANCH_URL` to the list so branch-alias previews work.

### F3 (minor): honeypot is bypassed by a non-string `website`
- `app/api/contact/route.ts:111-112`: `if (typeof trap === "string" && trap.trim() !== "")`
- Evidence: probe: `{...VALID, website: 1}` -> 200 and Resend called; `website: true` -> sent; `website: ["x"]` -> sent. Zod then strips the unknown key and the mail goes out.
- Fix: treat any present value other than `undefined`, `null` or a blank string as a trap hit. Add a test for `website: 1`.

### F4 (minor): truncate-then-validate silently changes the visitor's reply-to address
- `app/api/contact/route.ts:29,35` (`s.trim().slice(0, max)` before `z.email()`). This is one of the owner-confirm policy items.
- Evidence: probe `email: "ada@example.com" + "m".repeat(185) + "X"` (201 chars) -> 200 with `reply_to` = `ada@example.commmm…m` (200 chars), which is a different address from the one typed. `email: "ada@example." + "c".repeat(240)` -> 200 with a truncated TLD. `z.email()` also accepts a 188-char TLD label (DNS labels are capped at 63) and a 65-char local part (RFC 5321 caps it at 64). The existing test `route.test.ts:82-89` pins this by asserting `reply_to` has length 200. For name, CR/LF placed after character 120 is accepted, and the injected part is cut away (harmless).
- Fix: for `email`, reject instead of truncating: `z.string().trim().max(200).pipe(...)`. Keep truncation for name and msg if the owner wants it. Update the S7 truncation test for email.

### F5 (minor): client and server email rules now disagree; affected visitors see a misleading "could not send"
- `components/sections/Contact.tsx:9` `EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/` vs the server's `z.email()`.
- Evidence: the client accepts `ädä@example.com`, `a@例え.jp`, `"a b"@example.com`, `a,b@example.com` and `<ada@example.com>`; the server returns 400 for all of them (probe and `route.test.ts:252-253`). The UI shows `t.contact.errSend` (`Contact.tsx:47`) rather than `errEmail`. Holders of internationalized addresses can no longer use the form at all, which is a product decision nobody made explicitly.
- Fix: on `res.status === 400`, show `t.contact.errEmail` (or a validation message), and decide explicitly whether IDN addresses are accepted. If they are, use `z.email({ pattern: z.regexes.unicodeEmail })`, but keep the control-character refine.

### F6 (minor): mislabelled tests and an invented acceptance criterion about the limiter quirks
- `app/api/contact/route.test.ts:184` and `:196` are titled `QUIRK (flipped by S3)`, but they assert the unchanged behavior. `docs/modernization/backlog.md:43` (S7 accept 4) says "limiter counting only valid requests ... flipped by S3". 04-build ("S7 tests flipped") justifies keeping it with "accept 6 says keep it", but S3 has four acceptance criteria (`backlog.md:21`) and none says to keep it.
- Evidence: `git show bb9a540:app/api/contact/route.test.ts | grep QUIRK` shows the same two titles. The diff only removed the five quirks that were actually flipped.
- Fix: rename both to `KEPT (owner decision, ADR 0002)`. Correct 04-build so it does not cite a nonexistent "accept 6". The owner decides whether keeping validation-only counting is acceptable. The audit flagged that malformed floods go unthrottled, which is cheap but contradicts the S7 plan.

### F7 (minor): HTML escaping of name/email is untested
- `app/api/contact/route.ts:143-145` (html body); tests only assert msg escaping (`route.test.ts:71`).
- Evidence: mutation M13 (`${escape(clean.name)}` -> `${clean.name}`) survived (0 failed). A visitor could then inject `<a href=…>` or `<img>` into the owner's mail.
- Fix: add a test where name is `<img src=x onerror=1>` and assert that `sent.html` contains `&lt;img` and not `<img`.

### F8 (minor): no PII-free signal for honeypot hits or 403s, so false positives cannot be detected
- `app/api/contact/route.ts:110-114` (honeypot), plus the 403 branch (see F2).
- Evidence: if a password manager or autofill fills `website` for a real visitor, the UI shows "sent" (200) and the mail is silently dropped. `autoComplete="off"` (`Contact.tsx:121`) is honored inconsistently by password managers, and this was not checked in a browser (04-build UNVERIFIED item 5).
- Fix: `console.warn("contact honeypot hit")` with no field values, so the owner can count hits in the Vercel logs.

### F9 (nit): formatting in the fetch block
- `app/api/contact/route.ts:~127-147`: the options object inside `try` is not re-indented, and there is a double blank line after the catch. Fix in S9 (Prettier) or now.

### F10 (nit): the email control-character refine is redundant, so its test is vacuous
- `app/api/contact/route.ts:35-37`: mutation M5 (drop the refine on email) survived because `z.email()` already rejects control characters. Keeping it as defense in depth is fine; add a comment saying so.

### F11 (nit): hard-coded English honeypot label
- The honeypot label "Website" is hard-coded (`Contact.tsx:115`). It is already listed in 04-build follow-ups; acceptable because it is aria-hidden.

---

## Origin adversarial results (check b)

Setup: scratch copy, `NODE_ENV=production`, `NEXT_PUBLIC_SITE_URL=https://site.example`. The implementation builds a `Set` of `new URL(x).origin` values and calls `allowed.has(origin)`, an exact string compare against the raw header. It never uses startsWith or includes. Localhost is checked with an anchored regex outside production only.

| Origin header | Status | Correct? |
|---|---|---|
| `https://site.example` | 200 | yes |
| `null` | 403 | yes |
| `https://evil.com` | 403 | yes |
| `https://site.example.evil.com` | 403 | yes |
| `https://evil.com/site.example` | 403 | yes |
| `https://evilsite.example` | 403 | yes |
| `http://localhost:3000` (production) | 403 | yes |
| `https://site.example/` (trailing slash) | 403 | yes (browsers never send it; fails closed) |
| `https://SITE.example`, `HTTPS://site.example` | 403 | yes (browsers send it lowercase; fails closed) |
| `https://site.example:443` | 403 | acceptable (browsers omit the default port) |
| `https://site.example:8443` | 403 | yes |
| `https://user@site.example` | 403 | yes |
| `https://site.example, https://evil.com` | 403 | yes |
| `""` (empty) | 403 | yes |
| `" https://site.example"` | 200 | yes (Fetch `Headers` strips surrounding whitespace) |
| absent header | 200 | accepted gap, owner to confirm (ADR 0002 §5) |

The env side normalizes correctly. `NEXT_PUBLIC_SITE_URL=https://Site.Example/` allows `https://site.example` (200), and so does `https://site.example:443/x`. A scheme-less `site.example` allows nothing (403; documented). If `NODE_ENV` is unset, localhost is allowed; that is harmless, because an attacker cannot make a victim's browser send a localhost Origin from a remote page. `http://127.0.0.1:3000` is refused in dev (minor dev inconvenience).

## Mutation results (check g)

Scratch copy `/tmp/s3rev.0XjK` (git archive of HEAD, node_modules symlinked), `npx vitest run app/api/contact/route.test.ts` per mutation:

| Mutation | Failed tests | Result |
|---|---|---|
| M1 drop `signal: AbortSignal.timeout(...)` | 1 | killed |
| M2 drop the Origin check (`if (false)`) | 6 | killed |
| M3 Origin `startsWith` instead of exact | 1 | killed |
| M4 loosen CR/LF (allow `\t\n\r`) | 3 | killed |
| M5 drop the control refine on email only | 0 | survived (redundant with `z.email()`, F10) |
| M6 drop the honeypot early return | 3 | killed |
| M7 name cap 120 -> 121 | 1 | killed |
| M8 email cap 200 -> 201 | 2 | killed |
| M9 rethrow inside the catch | 3 | killed |
| M10 limiter before the honeypot | 5 | killed |
| M11 drop the localhost production guard | 1 | killed |
| M12 log `err.message` instead of `err.name` | 2 | killed |
| M13 drop `escape()` on name in the html | 0 | survived (F7) |

## Other checks

- **(c) Message body.** Newlines are allowed (`route.test.ts:266-269`). In the probe, msg `line1\nline2 <img src=x onerror=alert(1)> "'&` was escaped to `&lt;img … &gt; &quot;&#39;&amp;` in the html. The text part carries raw msg, which is correct for text/plain. `to` and `from` are server constants (`TO`, `FROM` from env/copy) and no visitor string reaches them. `reply_to` is a single validated string: `a@example.com;b@example.com`, `a,b@…`, `<…>` and multiple `@` are all 400.
- **(d) Timeout/error.** Real abort path: a fetch that honors the signal, with `AbortSignal.timeout` shortened to 20 ms, returned 502 and logged `["resend send failed","TimeoutError"]`. A non-Error rejection gives 502 and logs `"unknown"`. Resend 429 gives 502. Resend 200 with a malformed JSON body gives 200, because the route never parses the provider body, so it cannot throw. `AbortSignal.timeout` has no timer to clear. The only two `console.*` calls are `route.ts:152` (`err.name`) and `:159` (`res.status`), with no name, email or message; `Contact.tsx` has none.
- **(e) Honeypot client.**
  - The real client sends the field: `JSON.stringify({ ...form, website })` (`Contact.tsx:42`).
  - It is kept out of assistive tech and the tab order: wrapper `aria-hidden="true"`, input `tabIndex={-1}` (axe `aria-hidden-focus` accepts tabindex -1).
  - CSS hides it offscreen with `position:absolute; left:-10000px; 1px; overflow:hidden`, not `display:none`. Absolute positioning removes it from the flex column and gap of `.contact__form`. A negative left offset does not create a horizontal scrollbar in an LTR document (en and zh are both LTR).
  - `autoComplete="off"` is set; see F8 for its limits.
  - Not checked in a browser.
- **(f) Limiter.**
  - Honeypot hits skip the limiter (test `route.test.ts:291`). The abuse potential is nil because a hit sends nothing. It cannot drain a shared IP's budget, and it only gives a bot unlimited free 200s, which costs a function invocation each. The Firewall rule covers that.
  - Failed sends consume slots (`:235`), and 429 attempts extend the lockout (`:196`).
  - S7-pinned behaviors still pass: 200/400/429/503 shapes, sliding window, 59 999/60 000 ms boundary, `x-forwarded-for` keying, the `unknown` bucket.
  - Flipped quirks are asserted: unhandled throw -> 502, no timeout -> `AbortSignal.timeout(8000)`, CR/LF in name -> 400, no Origin check -> 403. The kept quirks are mislabelled (F6).
- **(h) ADR 0002.** Follows the 0001 shape (Status/Date/Context/Decision/Consequences) and adds an Options table. Status is "Proposed", with the owner-confirm items named. It is honest that Firewall rate-rule availability on the plan is UNVERIFIED and states the absent-Origin gap plainly. Inaccuracy: "rejects control characters" (F1). The README index is updated.
- **(i) zod.** `npm view zod@4.6.5` exists, `dist-tags.latest` = 4.6.5, and the integrity matches the lockfile (`sha512-v5l/aFXZ…`). It is listed under `dependencies` only, which is correct because it is used at runtime by the route. The lockfile diff is 11 lines: the root `dependencies` entry plus `node_modules/zod` (MIT, no transitive deps). Nothing else changed.
- **(j) Secrets.** Tests stub `RESEND_API_KEY=re_fake_key` and example.com addresses only. `git diff bb9a540..HEAD | grep -E "re_[A-Za-z0-9]{8,}|sk-|API_KEY=|Bearer [A-Za-z0-9]{12,}"` returned nothing, and no env files changed.

## Traceability matrix

| Acceptance criterion | Code | Test | Verdict |
|---|---|---|---|
| (1a) Resend fetch has `AbortSignal.timeout` | `route.ts:147` (`RESEND_TIMEOUT_MS = 8_000`) | `route.test.ts:227-233` (M1 killed) | Met |
| (1b) try/catch; timeout and network failure -> 502 `send_failed`, never an unhandled throw | `route.ts:~126-154` | `route.test.ts:209-225` (M9 killed); real abort probe 502 | Met |
| (2a) filled honeypot -> 200 `{ok:true}`, no Resend call | `route.ts:110-114`; client `Contact.tsx:15,42,113-125`; CSS `.contact__trap` | `route.test.ts:278-302` (M6 killed) | Met for string values; non-string bypass (F3); client and CSS not browser-checked |
| (2b) Origin not on allow-list -> 403 | `route.ts:69-84` and the Origin check in `POST` | `route.test.ts:305-376` (M2, M3, M11 killed); adversarial table above | Met (exact match); production domain coverage unverified (F2); absent Origin allowed (owner) |
| (3a) zod `.email()` | `route.ts:35-37` (`z.email()`) | `route.test.ts:113-115,250-253` | Met; client mismatch (F5); truncation rewrites address (F4) |
| (3b) CR/LF and control characters rejected in name/email | `route.ts:26,32-37` | `route.test.ts:245-251` (M4 killed) | **Partially met**: C0/DEL only; C1, U+2028/2029 and bidi accepted (F1) |
| (3c) caps 120/200/5000 kept | `route.ts:19,29` | `route.test.ts:82-89,261-264` (M7, M8 killed) | Met |
| (4) ADR 0002 decides the durable limiter | `docs/adr/0002-contact-rate-limit.md`, README index | n/a (doc) | Met; Firewall availability honestly marked UNVERIFIED; overclaim on control characters (F1) |
| S7 accept 4: limiter "counting only valid requests" flipped by S3 | unchanged on purpose | `route.test.ts:184` (mislabelled) | Not flipped; needs owner decision (F6) |

## What I ran

- `npm test`: 6 files, 132 tests passed (exit 0).
- `npm run test:coverage`: `app/api/contact/route.ts` 94.02% statements, 89.18% branches, 91.66% functions, 96.61% lines, with only 57-58 (the pre-existing `hits.size > 500` eviction) uncovered. All-files totals are 32.88% statements (no global floor, per standards). `Contact.tsx` is not covered by any test.
- `npm run verify` (tsc --noEmit && eslint): exit 0, no output.
- Scratch copy `/tmp/s3rev.0XjK`: an adversarial probe vitest file (Origin, validation, Resend edge cases, real abort), then a 13-mutation run with `route.test.ts`. The repo was untouched.
- `npm view zod@4.6.5 version dist.integrity`, `npm view zod dist-tags`; lockfile diff; secret-pattern grep over the diff; `console.*` grep.

## What I did NOT verify

- No build and no dev server. The honeypot's visual hiding, layout, tab order, screen-reader silence and autofill behavior (Chrome, Safari, password managers) were not checked in a browser.
- How Resend encodes the subject or `reply_to` when they contain non-ASCII or Unicode line separators, which bears on F1's real-world impact.
- The owner's actual Vercel domain set, redirects, preview aliases, and whether `VERCEL_URL` equals the browser Origin on previews (F2).
- Vercel Firewall rate-rule availability on the owner's plan.
- Whether Vercel overwrites a client-supplied `x-forwarded-for` (pre-existing; affects the limiter key).
- Lint or type state of other worktrees, and rebase conflicts with S1/S6 branches.

## Resolution (conductor, 2026-10-06)

Both majors and most minors were fixed in `206fc4d`. F1: `name` and `email` now reject all Unicode Cc controls (including U+0080-U+009F), U+2028/U+2029, and the bidi embeddings, overrides and isolates (U+202A-U+202E, U+2066-U+2069); zero-width joiners stay allowed, and the message keeps newlines and tabs. F2: the Origin allow-list also accepts `CONTACT_ALLOWED_ORIGINS` (comma-separated; name added to `.env.example`), the `www`/apex twin of the site origin, and `VERCEL_BRANCH_URL`; every rejection logs one non-PII warning line; ADR 0002 carries the owner checklist. Matching stays exact (`new URL(origin).origin`, no `startsWith` or `includes`; checked in the code). Re-verified independently: 162 tests pass in 6 files, `npm run verify` passes, the diff touches only the expected files.
Accepted: mutation M5 (drop the email control-character refine) still survives because `z.email()` already rejects those characters; the refine is kept as defense in depth. Left for the OWNER: reject-instead-of-truncate for an over-long email (F4), IDN addresses, validation-only limiter counting, and the earlier confirmations (a missing Origin header is allowed; Vercel Firewall availability on the plan is unverified). Before merging: set `CONTACT_ALLOWED_ORIGINS` if the production domain is not covered, and follow the ADR 0002 checklist on the first preview and production deploys.
