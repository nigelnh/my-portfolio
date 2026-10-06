// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { projectsMeta } from "@/lib/copy";

/**
 * Characterization tests for GET /api/embeddable (slice S7).
 * Pins every reason produced by the verdict logic through the exported
 * handler. fetch is mocked; no network.
 */

const URL_OK = projectsMeta[0].url; // an allow-listed project url
const URL_OTHER = projectsMeta.find((p) => p.url !== URL_OK)!.url;

// The route keeps a module-level cache, so every test gets a fresh module.
let GET: (req: Request) => Promise<Response>;

const call = (url?: string) => {
  const qs = url === undefined ? "" : `?url=${encodeURIComponent(url)}`;
  return GET(new Request(`http://localhost/api/embeddable${qs}`));
};

const reply = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();
  ({ GET } = await import("./route"));
  fetchMock = vi.fn().mockResolvedValue(reply(200));
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("GET /api/embeddable input", () => {
  it.each([
    ["missing url", undefined],
    ["empty url", ""],
    ["unknown url", "https://evil.example.com/"],
    ["allowed url with a trailing difference", `${URL_OK}x`],
  ])("400 for %s, and nothing is fetched", async (_l, url) => {
    const res = await call(url);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "unknown project url" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("accepts every url listed in projectsMeta", async () => {
    const urls = new Set(projectsMeta.map((p) => p.url));
    for (const u of urls) {
      expect((await call(u)).status).toBe(200);
    }
    expect(fetchMock).toHaveBeenCalledTimes(urls.size);
  });
});

describe("verdict reasons", () => {
  it("embeddable ok when no blocking headers are present", async () => {
    const res = await call(URL_OK);
    expect(await res.json()).toEqual({ embeddable: true, reason: "ok" });
  });

  it.each(["DENY", "deny", "SameOrigin"])(
    "x-frame-options %j blocks, reported lower-cased",
    async (value) => {
      fetchMock.mockResolvedValue(reply(200, { "x-frame-options": value }));
      expect(await (await call(URL_OK)).json()).toEqual({
        embeddable: false,
        reason: `x-frame-options: ${value.toLowerCase()}`,
      });
    },
  );

  it("x-frame-options ALLOW-FROM (or other values) does not block", async () => {
    fetchMock.mockResolvedValue(reply(200, { "x-frame-options": "allow-from https://a.b" }));
    expect(await (await call(URL_OK)).json()).toEqual({ embeddable: true, reason: "ok" });
  });

  it("frame-ancestors 'none' blocks", async () => {
    fetchMock.mockResolvedValue(
      reply(200, { "content-security-policy": "default-src 'self'; frame-ancestors 'none'; img-src *" }),
    );
    expect(await (await call(URL_OK)).json()).toEqual({
      embeddable: false,
      reason: "frame-ancestors 'none'",
    });
  });

  it("frame-ancestors 'self' blocks (matched case-insensitively, reported lower-cased)", async () => {
    fetchMock.mockResolvedValue(reply(200, { "content-security-policy": "Frame-Ancestors 'SELF'" }));
    expect(await (await call(URL_OK)).json()).toEqual({
      embeddable: false,
      reason: "frame-ancestors 'self'",
    });
  });

  it("frame-ancestors with a host list does not block, nor does 'self' plus hosts", async () => {
    fetchMock.mockResolvedValue(
      reply(200, { "content-security-policy": "frame-ancestors https://a.example" }),
    );
    expect((await (await call(URL_OK)).json()).embeddable).toBe(true);
    fetchMock.mockResolvedValue(
      reply(200, { "content-security-policy": "frame-ancestors 'self' https://a.example" }),
    );
    expect((await (await call(URL_OK)).json()).embeddable).toBe(true);
  });

  it("x-frame-options wins over a CSP that would also block", async () => {
    fetchMock.mockResolvedValue(
      reply(200, {
        "x-frame-options": "deny",
        "content-security-policy": "frame-ancestors 'none'",
      }),
    );
    expect((await (await call(URL_OK)).json()).reason).toBe("x-frame-options: deny");
  });

  it("not-ok HEAD and not-ok GET report `http <status>` of the GET", async () => {
    fetchMock.mockResolvedValueOnce(reply(405)).mockResolvedValueOnce(reply(503));
    expect(await (await call(URL_OK)).json()).toEqual({ embeddable: false, reason: "http 503" });
  });

  it("unreachable when fetch throws (still HTTP 200)", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    const res = await call(URL_OK);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ embeddable: false, reason: "unreachable" });
  });

  it("S4: no timer is left pending after a success or after a fetch throw", async () => {
    vi.useFakeTimers();
    await call(URL_OK);
    expect(vi.getTimerCount()).toBe(0);
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await call(URL_OTHER);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("unreachable when the 6 s abort timer fires", async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_u: string, init: RequestInit) =>
        new Promise((_res, rej) => {
          init.signal!.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")));
        }),
    );
    const pending = call(URL_OK);
    await vi.advanceTimersByTimeAsync(5999);
    expect(fetchMock).toHaveBeenCalledTimes(1); // still waiting
    await vi.advanceTimersByTimeAsync(1);
    await expect(Promise.race([pending, Promise.resolve("pending")])).resolves.not.toBe("pending");
    expect(await (await pending).json()).toEqual({ embeddable: false, reason: "unreachable" });
  });
});

describe("upstream request shape", () => {
  it("tries HEAD first and does not fall back when HEAD is ok", async () => {
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(URL_OK);
    expect(init.method).toBe("HEAD");
    expect(init.redirect).toBe("manual"); // S4: redirects are followed by hand, same host only
    expect(init.cache).toBe("no-store");
    expect(init.headers["User-Agent"]).toMatch(/^Mozilla\/5\.0/); // browser-shaped UA (S4: kept on purpose)
  });

  it("falls back to a GET when HEAD is not ok, and uses the GET's headers for the verdict", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(400))
      .mockResolvedValueOnce(reply(200, { "x-frame-options": "sameorigin" }));
    const res = await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1]![1].method).toBeUndefined(); // plain GET
    expect(await res.json()).toEqual({ embeddable: false, reason: "x-frame-options: sameorigin" });
  });

  it("S4: repeated calls for one url make no further upstream fetch", async () => {
    const first = await (await call(URL_OK)).json();
    const second = await (await call(URL_OK)).json();
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("caching (S4)", () => {
  const TTL = 10 * 60_000;

  it("caches per url", async () => {
    await call(URL_OK);
    await call(URL_OTHER);
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("refetches after the 10 minute TTL", async () => {
    vi.useFakeTimers();
    await call(URL_OK);
    vi.advanceTimersByTime(TTL - 1);
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1);
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("caches blocking verdicts for the full TTL", async () => {
    fetchMock.mockResolvedValue(reply(200, { "x-frame-options": "deny" }));
    await call(URL_OK);
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("caches `unreachable` for only 30 s", async () => {
    vi.useFakeTimers();
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await call(URL_OK);
    vi.advanceTimersByTime(29_999);
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockResolvedValue(reply(200));
    vi.advanceTimersByTime(1);
    expect(await (await call(URL_OK)).json()).toEqual({ embeddable: true, reason: "ok" });
  });

  it("caches a 5xx for only 30 s", async () => {
    vi.useFakeTimers();
    fetchMock.mockResolvedValue(reply(503));
    await call(URL_OK);
    vi.advanceTimersByTime(30_000);
    fetchMock.mockResolvedValue(reply(200));
    expect((await (await call(URL_OK)).json()).embeddable).toBe(true);
  });

  it("does not cache the 400 for unknown urls", async () => {
    await call("https://evil.example.com/");
    await call("https://evil.example.com/");
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("redirects (S4)", () => {
  const host = new URL(URL_OK).origin;
  const redirect = (location: string, status = 302) => reply(status, { location });

  it("follows a same-host redirect by hand and judges the final response", async () => {
    fetchMock
      .mockResolvedValueOnce(redirect("/landing"))
      .mockResolvedValueOnce(reply(200, { "x-frame-options": "deny" }));
    expect(await (await call(URL_OK)).json()).toEqual({
      embeddable: false,
      reason: "x-frame-options: deny",
    });
    expect(fetchMock.mock.calls[1]![0]).toBe(`${host}/landing`);
    expect(fetchMock.mock.calls[1]![1].redirect).toBe("manual");
  });

  it("a redirect to another host returns `redirected off-site` (200) without fetching it", async () => {
    fetchMock.mockResolvedValue(redirect("https://other.example.org/"));
    const res = await call(URL_OK);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ embeddable: false, reason: "redirected off-site" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("a non-http(s) Location counts as off-site", async () => {
    fetchMock.mockResolvedValue(redirect("javascript:alert(1)"));
    expect((await (await call(URL_OK)).json()).reason).toBe("redirected off-site");
  });

  it("a look-alike host is off-site", async () => {
    const h = new URL(URL_OK).hostname;
    fetchMock.mockResolvedValue(redirect(`https://${h}.evil.example/`));
    expect((await (await call(URL_OK)).json()).reason).toBe("redirected off-site");
  });

  it("follows at most 3 hops", async () => {
    fetchMock
      .mockResolvedValueOnce(redirect("/a"))
      .mockResolvedValueOnce(redirect("/b"))
      .mockResolvedValueOnce(redirect("/c"))
      .mockResolvedValueOnce(reply(200));
    expect(await (await call(URL_OK)).json()).toEqual({ embeddable: true, reason: "ok" });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("a fourth redirect gives `too many redirects`", async () => {
    fetchMock.mockResolvedValue(redirect("/loop"));
    expect(await (await call(URL_OK)).json()).toEqual({
      embeddable: false,
      reason: "too many redirects",
    });
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("an off-site redirect on the GET fallback is also caught", async () => {
    fetchMock
      .mockResolvedValueOnce(reply(405))
      .mockResolvedValueOnce(redirect("https://other.example.org/"));
    expect((await (await call(URL_OK)).json()).reason).toBe("redirected off-site");
  });

  it("a 3xx without Location reports `http <status>`", async () => {
    fetchMock.mockResolvedValue(reply(304));
    expect((await (await call(URL_OK)).json()).reason).toBe("http 304");
  });
});
