import { NextResponse } from "next/server";
import { projectsMeta } from "@/lib/copy";

/**
 * Reports whether a project deployment allows being shown in an iframe.
 *
 * A browser gives no usable signal for this: a frame blocked by
 * `X-Frame-Options` still fires `load` (on Chrome's error page), and the
 * document is cross-origin so nothing inside it can be read. Asking the server
 * to look at the response headers is the only reliable check.
 *
 * Only URLs already listed in `projectsMeta` are fetched, so this cannot be
 * pointed at arbitrary hosts. Redirects are followed by hand and only while
 * they stay on the allow-listed host. Results are cached in memory per url.
 */

const ALLOWED = new Set<string>(
  projectsMeta.flatMap((p) => (p.url ? [p.url as string] : [])),
);

function verdict(headers: Headers): Verdict {
  const xfo = headers.get("x-frame-options")?.toLowerCase().trim();
  if (xfo === "deny" || xfo === "sameorigin") {
    return { embeddable: false, reason: `x-frame-options: ${xfo}` };
  }

  const csp = headers.get("content-security-policy");
  const ancestors = csp?.match(/frame-ancestors([^;]*)/i)?.[1]?.trim().toLowerCase();
  if (ancestors && (ancestors === "'none'" || ancestors === "'self'")) {
    return { embeddable: false, reason: `frame-ancestors ${ancestors}` };
  }

  return { embeddable: true, reason: "ok" };
}

type Verdict = { embeddable: boolean; reason: string };

const CACHE_TTL_MS = 10 * 60_000; // settled answers (ok, blocked, 4xx, off-site)
const TRANSIENT_TTL_MS = 30_000; // unreachable or 5xx: retry soon
const TIMEOUT_MS = 6000;
const MAX_REDIRECTS = 3;

// Only a handful of keys can exist (the allow-list), so a plain Map is enough.
const cache = new Map<string, { verdict: Verdict; expires: number }>();

// The User-Agent is spoofed ON PURPOSE: some sites answer unknown or bot UAs
// differently (a 403, or looser headers), which would make this check report a
// verdict a real browser would never see. Changing it to an honest UA is an
// owner decision (see the S4 build log), not something to do silently.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36";

type Hop = { res: Response } | { stop: Verdict };

/** fetch that follows up to MAX_REDIRECTS redirects, same hostname only. */
async function fetchSameHost(
  url: string,
  init: RequestInit,
): Promise<Hop> {
  const hostname = new URL(url).hostname;
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, { ...init, redirect: "manual" });
    const location = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!location) return { res };
    if (hop === MAX_REDIRECTS) break;
    let next: URL;
    try {
      next = new URL(location, current);
    } catch {
      return { stop: { embeddable: false, reason: "redirected off-site" } };
    }
    if (!/^https?:$/.test(next.protocol) || next.hostname !== hostname) {
      return { stop: { embeddable: false, reason: "redirected off-site" } };
    }
    current = next.toString();
  }
  return { stop: { embeddable: false, reason: "too many redirects" } };
}

async function probe(url: string): Promise<{ verdict: Verdict; ttl: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // Some hosts reject a bare HEAD (cw.kbsec.com.vn answers 400), so fall back
    // to a browser-shaped GET before deciding the deployment is unreachable.
    const common: RequestInit = {
      cache: "no-store",
      signal: controller.signal,
      headers: { "User-Agent": BROWSER_UA },
    };
    let hop = await fetchSameHost(url, { ...common, method: "HEAD" });
    if ("res" in hop && !hop.res.ok) hop = await fetchSameHost(url, common);
    if ("stop" in hop) return { verdict: hop.stop, ttl: CACHE_TTL_MS };

    const { res } = hop;
    if (!res.ok) {
      return {
        verdict: { embeddable: false, reason: `http ${res.status}` },
        ttl: res.status >= 500 ? TRANSIENT_TTL_MS : CACHE_TTL_MS,
      };
    }
    return { verdict: verdict(res.headers), ttl: CACHE_TTL_MS };
  } catch {
    return { verdict: { embeddable: false, reason: "unreachable" }, ttl: TRANSIENT_TTL_MS };
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !ALLOWED.has(url)) {
    return NextResponse.json({ error: "unknown project url" }, { status: 400 });
  }

  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return NextResponse.json(hit.verdict);

  const { verdict: result, ttl } = await probe(url);
  cache.set(url, { verdict: result, expires: Date.now() + ttl });
  return NextResponse.json(result);
}
