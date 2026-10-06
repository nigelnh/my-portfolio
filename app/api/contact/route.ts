import { NextResponse } from "next/server";
import { z } from "zod";
import { CONTACT_EMAIL } from "@/lib/copy";

/**
 * Contact form delivery.
 *
 * The Resend key is server-side only — it must never reach the browser, which
 * is why the form posts here instead of straight to a provider.
 *
 * Without RESEND_API_KEY the route answers 503 and the form tells the visitor
 * to email directly, rather than pretending the message went anywhere.
 */

const TO = process.env.CONTACT_TO_EMAIL ?? CONTACT_EMAIL;
/** Resend needs a verified sender on a domain the account owns. */
const FROM = process.env.CONTACT_FROM_EMAIL ?? "portfolio@nhanxnguyen.com";

const LIMITS = { name: 120, email: 200, msg: 5000 };

/** Upper bound for the provider call, so a hung Resend cannot pin the function. */
const RESEND_TIMEOUT_MS = 8_000;

// Control characters (C0 range and DEL): header-injection hardening for the
// fields that reach the subject and reply_to. The message body may keep newlines.
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

/** Trim first, then cap, as before; the checks run on the capped value. */
const capped = (max: number) => z.string().transform((s) => s.trim().slice(0, max));

const Body = z.object({
  name: capped(LIMITS.name).pipe(
    z.string().min(1).refine((s) => !CONTROL_CHARS.test(s)),
  ),
  email: capped(LIMITS.email).pipe(
    z.string().refine((s) => !CONTROL_CHARS.test(s)).pipe(z.email()),
  ),
  msg: capped(LIMITS.msg).pipe(z.string().min(1)),
});

/**
 * Caps how many messages one IP can actually send, so the form cannot be used
 * as a relay. Only requests that pass validation count: someone mistyping their
 * address twice should not lock themselves out.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // The map is per-instance and short-lived; drop anything stale on the way past.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > MAX_PER_WINDOW;
}

/**
 * A present Origin must be one of ours. An absent Origin is allowed on
 * purpose (non-browser clients and some privacy setups omit it; browsers
 * always send it on a cross-origin POST). See ADR 0002.
 */
function originAllowed(origin: string) {
  const allowed = new Set<string>();
  const add = (url: string | undefined, scheme = "") => {
    if (!url) return;
    try {
      allowed.add(new URL(scheme + url).origin);
    } catch {
      // A malformed setting simply allows nothing.
    }
  };
  add(process.env.NEXT_PUBLIC_SITE_URL);
  add(process.env.VERCEL_PROJECT_PRODUCTION_URL, "https://");
  add(process.env.VERCEL_URL, "https://");
  if (allowed.has(origin)) return true;
  return process.env.NODE_ENV !== "production" && /^http:\/\/localhost(:\d+)?$/.test(origin);
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const origin = request.headers.get("origin");
  if (origin !== null && !originAllowed(origin)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // Honeypot: real visitors never see this field. Answer like a success so a
  // bot learns nothing, but send nothing and spend no limiter slot.
  const trap = (body as { website?: unknown } | null)?.website;
  if (typeof trap === "string" && trap.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const clean = parsed.data;

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Portfolio <${FROM}>`,
      to: [TO],
      // So a reply in the mail client goes to the visitor, not to the site.
      reply_to: clean.email,
      subject: `Portfolio — ${clean.name}`,
      text: `${clean.msg}\n\n— ${clean.name} <${clean.email}>`,
      html:
        `<p style="white-space:pre-wrap">${escape(clean.msg)}</p>` +
        `<p>— ${escape(clean.name)} &lt;${escape(clean.email)}&gt;</p>`,
    }),
      signal: AbortSignal.timeout(RESEND_TIMEOUT_MS),
    });
  } catch (err) {
    // Timeout or network failure. Log the error class only: the message can
    // carry the request URL or body, which holds the visitor's details.
    console.error("resend send failed", err instanceof Error ? err.name : "unknown");
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }


  if (!res.ok) {
    // Never echo the provider's body: it can carry account details.
    console.error("resend send failed", res.status);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
