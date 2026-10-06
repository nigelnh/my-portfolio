// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { projectsMeta } from "@/lib/copy";
import { GET } from "./route";

/**
 * Characterization tests for GET /api/embeddable (slice S7).
 * Pins every reason produced by the verdict logic through the exported
 * handler. fetch is mocked; no network.
 */

const URL_OK = projectsMeta[0].url; // an allow-listed project url

const call = (url?: string) => {
  const qs = url === undefined ? "" : `?url=${encodeURIComponent(url)}`;
  return GET(new Request(`http://localhost/api/embeddable${qs}`));
};

const reply = (status: number, headers: Record<string, string> = {}) =>
  new Response(null, { status, headers });

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
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
    for (const p of projectsMeta) {
      expect((await call(p.url)).status).toBe(200);
    }
    expect(fetchMock).toHaveBeenCalledTimes(projectsMeta.length);
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
    expect(init.redirect).toBe("follow");
    expect(init.cache).toBe("no-store");
    expect(init.headers["User-Agent"]).toMatch(/^Mozilla\/5\.0/); // browser-shaped UA (S4 decides)
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

  it("QUIRK (S4 changes it): every call makes a fresh upstream fetch, nothing is cached", async () => {
    await call(URL_OK);
    await call(URL_OK);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
