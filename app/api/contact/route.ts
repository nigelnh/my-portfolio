import { NextResponse } from "next/server";
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

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const LIMITS = { name: 120, email: 200, msg: 5000 };

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

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export async function POST(request: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const { name, email, msg } = (body ?? {}) as Record<string, unknown>;
  if (typeof name !== "string" || typeof email !== "string" || typeof msg !== "string") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const clean = {
    name: name.trim().slice(0, LIMITS.name),
    email: email.trim().slice(0, LIMITS.email),
    msg: msg.trim().slice(0, LIMITS.msg),
  };
  if (!clean.name || !clean.msg || !EMAIL_RE.test(clean.email)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const res = await fetch("https://api.resend.com/emails", {
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
  });

  if (!res.ok) {
    // Never echo the provider's body: it can carry account details.
    console.error("resend send failed", res.status);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
