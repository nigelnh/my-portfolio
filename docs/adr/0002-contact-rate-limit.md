# 0002. Contact form abuse controls and the durable rate limit

- Status: Proposed (owner to confirm the Origin-absent gap and the Firewall rule)
- Date: 2026-10-06

## Context
`POST /api/contact` sends mail to the owner through Resend. Its only rate limit is an in-memory `Map` (5 per 60 s per first `x-forwarded-for` IP). On Vercel each serverless instance has its own map and cold starts reset it, so the limit holds only per warm instance. The audit also found no Origin check, no honeypot, no timeout on the provider call and loose email validation. Real abuse has not been observed; the exposure is a flooded inbox and a burned Resend quota.

## Decision
1. **Durable limit: a Vercel Firewall rate-limit rule** on `POST /api/contact` (for example 5 requests per minute per IP, action deny or challenge). It needs no code and no dependency. **Availability of rate-limit rules on the owner's Vercel plan is UNVERIFIED**; check Project, Firewall in the dashboard before relying on it.
2. **Keep the in-memory limiter as best effort** (unchanged: 5 per 60 s, sliding window). It still stops a naive loop on one warm instance and works on any host.
3. **Add Upstash Redis or Vercel KV only if abuse is actually observed** (spam reaching the inbox despite 1 and 2).
4. **Cheap layers added with this ADR** (slice S3): a honeypot field (a filled field gets 200 and no send, and spends no limiter slot), an Origin allow-list, zod validation that rejects Unicode control characters (Cc including C1, U+2028/U+2029, bidi overrides and isolates; not zero-width joiners) in name and email, and invalid emails, and an 8 s timeout on the Resend call (failure answers 502 `send_failed`).
5. **Origin check policy.** A present Origin that is not allowed gets 403 `forbidden` and one `console.warn("contact origin rejected", <origin>, "not_allowed")` line (the Origin is not personal data). Allowed, by exact origin comparison only: `NEXT_PUBLIC_SITE_URL` and `https://$VERCEL_PROJECT_PRODUCTION_URL` (each with its `www.`/apex twin), `https://$VERCEL_URL` and `https://$VERCEL_BRANCH_URL` (previews), every entry of the comma-separated `CONTACT_ALLOWED_ORIGINS`, and `http://localhost[:port]` outside production. **An absent Origin is allowed. This is an accepted gap**: non-browser clients and some privacy setups omit the header, and browsers always send it on a cross-origin POST, so the check blocks browser-driven cross-site abuse but not a script that omits the header. The owner should confirm this is acceptable; the Firewall rule is what covers scripted abuse.

## Options considered
| Option | Pros | Cons |
|---|---|---|
| Vercel Firewall rate rule (chosen) | No code, enforced before the function runs, shared across instances | Plan availability unverified; Vercel-specific; coarse (per IP) |
| In-memory limiter only (kept as fallback) | Zero dependencies, portable | Per instance, reset on cold start, effectively advisory |
| Upstash Redis or Vercel KV limiter | Exact, durable, per-IP and daily caps possible | New dependency, env secrets, latency on each request, cost, more to operate; not justified without observed abuse |
| CAPTCHA or Turnstile | Strong against bots | Extra third party, UX friction, privacy notice; revisit if the honeypot proves insufficient |
| Require the Origin header | Closes the absent-Origin gap | Breaks legitimate clients that strip it; rejected for now |

## Consequences
Abuse protection is layered, with the durable layer outside the code. If the plan lacks rate-limit rules, the effective limit stays best effort until abuse justifies option 3. The limiter still counts failed sends and 429 attempts (unchanged), so hammering extends a lockout for that IP. Revisit this ADR when abuse is observed or when S13 moves env access into `lib/env.ts`.

## Owner checklist: first preview and production deploy
The real domain set is not known to the code, so a miss shows as 403 and a `contact origin rejected` line in the Vercel logs. After each deploy, submit the form from every URL below and watch the logs:
1. Custom production domain (the value of `NEXT_PUBLIC_SITE_URL`): submit succeeds.
2. The other of `www.` and apex: submit succeeds (allowed as a twin), or it redirects to the canonical domain.
3. The stable `<project>.vercel.app` production alias: if it serves the site, add it to `CONTACT_ALLOWED_ORIGINS` (it is not `VERCEL_URL`, which is per deployment).
4. Any other custom domain: add it to `CONTACT_ALLOWED_ORIGINS`.
5. A preview deployment URL (`VERCEL_URL`) and the branch alias (`VERCEL_BRANCH_URL`): submit succeeds.
6. A preview behind some other alias: add it to `CONTACT_ALLOWED_ORIGINS` or accept 403 there.
7. Confirm `NEXT_PUBLIC_SITE_URL` includes the scheme (`https://...`); a scheme-less value allows nothing.
8. Search the logs for `contact honeypot hit`; a hit during your own test means autofill filled the hidden field.
