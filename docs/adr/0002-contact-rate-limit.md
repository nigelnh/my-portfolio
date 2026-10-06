# 0002. Contact form abuse controls and the durable rate limit

- Status: Proposed (owner to confirm the Origin-absent gap and the Firewall rule)
- Date: 2026-10-06

## Context
`POST /api/contact` sends mail to the owner through Resend. Its only rate limit is an in-memory `Map` (5 per 60 s per first `x-forwarded-for` IP). On Vercel each serverless instance has its own map and cold starts reset it, so the limit holds only per warm instance. The audit also found no Origin check, no honeypot, no timeout on the provider call and loose email validation. Real abuse has not been observed; the exposure is a flooded inbox and a burned Resend quota.

## Decision
1. **Durable limit: a Vercel Firewall rate-limit rule** on `POST /api/contact` (for example 5 requests per minute per IP, action deny or challenge). It needs no code and no dependency. **Availability of rate-limit rules on the owner's Vercel plan is UNVERIFIED**; check Project, Firewall in the dashboard before relying on it.
2. **Keep the in-memory limiter as best effort** (unchanged: 5 per 60 s, sliding window). It still stops a naive loop on one warm instance and works on any host.
3. **Add Upstash Redis or Vercel KV only if abuse is actually observed** (spam reaching the inbox despite 1 and 2).
4. **Cheap layers added with this ADR** (slice S3): a honeypot field (a filled field gets 200 and no send, and spends no limiter slot), an Origin allow-list, zod validation that rejects control characters and invalid emails, and an 8 s timeout on the Resend call (failure answers 502 `send_failed`).
5. **Origin check policy.** A present Origin that is not allowed gets 403 `forbidden`. Allowed: `NEXT_PUBLIC_SITE_URL`, `https://$VERCEL_PROJECT_PRODUCTION_URL`, `https://$VERCEL_URL` (so previews can submit), and `http://localhost:*` outside production. **An absent Origin is allowed. This is an accepted gap**: non-browser clients and some privacy setups omit the header, and browsers always send it on a cross-origin POST, so the check blocks browser-driven cross-site abuse but not a script that omits the header. The owner should confirm this is acceptable; the Firewall rule is what covers scripted abuse.

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
