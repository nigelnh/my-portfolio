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
 * pointed at arbitrary hosts.
 */

const ALLOWED = new Set<string>(
  projectsMeta.flatMap((p) => (p.url ? [p.url as string] : [])),
);

function verdict(headers: Headers): { embeddable: boolean; reason: string } {
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

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url || !ALLOWED.has(url)) {
    return NextResponse.json({ error: "unknown project url" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });
    // Some hosts do not answer HEAD; retry once with a GET.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        redirect: "follow",
        cache: "no-store",
        signal: controller.signal,
      });
    }
    clearTimeout(timeout);

    if (!res.ok) {
      return NextResponse.json({ embeddable: false, reason: `http ${res.status}` });
    }
    return NextResponse.json(verdict(res.headers));
  } catch {
    return NextResponse.json({ embeddable: false, reason: "unreachable" });
  }
}
