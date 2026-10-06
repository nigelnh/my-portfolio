// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CONTACT_EMAIL } from "@/lib/copy";

/**
 * Characterization tests for POST /api/contact (slice S7).
 * They pin today's behavior, including known quirks, so S3 can change it on
 * purpose. All env values are fake; no network is touched.
 */

type Post = (req: Request) => Promise<Response>;

const VALID = { name: "Ada", email: "ada@example.com", msg: "Hello there" };

function req(body: unknown, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

let POST: Post;
let fetchMock: ReturnType<typeof vi.fn>;
let errorSpy: ReturnType<typeof vi.spyOn>;

async function load(env: Record<string, string | undefined> = {}) {
  vi.resetModules(); // fresh module-level limiter Map and TO/FROM constants
  vi.stubEnv("RESEND_API_KEY", "re_fake_key");
  vi.stubEnv("CONTACT_TO_EMAIL", "to@example.com");
  vi.stubEnv("CONTACT_FROM_EMAIL", "from@example.com");
  for (const [k, v] of Object.entries(env)) {
    vi.stubEnv(k, v);
  }
  POST = (await import("./route")).POST;
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  await load();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  errorSpy.mockRestore();
});

describe("POST /api/contact responses", () => {
  it("200 {ok:true} and sends one Resend request with the cleaned fields", async () => {
    const res = await POST(req({ name: "  Ada  ", email: " ada@example.com ", msg: " Hi <b> " }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe("https://api.resend.com/emails");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("Bearer re_fake_key");
    const sent = JSON.parse(init.body);
    expect(sent.from).toBe("Portfolio <from@example.com>");
    expect(sent.to).toEqual(["to@example.com"]);
    expect(sent.reply_to).toBe("ada@example.com");
    expect(sent.subject).toBe("Portfolio — Ada");
    expect(sent.text).toBe("Hi <b>\n\n— Ada <ada@example.com>");
    expect(sent.html).toContain("Hi &lt;b&gt;"); // HTML is escaped
  });

  it("uses the default sender and CONTACT_EMAIL recipient when env is unset", async () => {
    await load({ CONTACT_TO_EMAIL: undefined, CONTACT_FROM_EMAIL: undefined });
    await POST(req(VALID));
    const sent = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(sent.from).toBe("Portfolio <portfolio@nhanxnguyen.com>");
    expect(sent.to).toEqual([CONTACT_EMAIL]);
  });

  it("truncates name, email and message to 120/200/5000 characters", async () => {
    const email = `${"a".repeat(190)}@example.com`; // 202 chars, cut to 200
    await POST(req({ name: "n".repeat(500), email, msg: "m".repeat(9000) }));
    const sent = JSON.parse(fetchMock.mock.calls[0]![1].body);
    expect(sent.subject).toBe(`Portfolio — ${"n".repeat(120)}`);
    expect(sent.reply_to).toHaveLength(200);
    expect(sent.text.startsWith("m".repeat(5000) + "\n\n")).toBe(true);
  });

  it("503 not_configured when RESEND_API_KEY is missing, without calling fetch", async () => {
    await load({ RESEND_API_KEY: undefined });
    const res = await POST(req(VALID));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("503 is checked before the body: an unparsable body with no key is still 503", async () => {
    await load({ RESEND_API_KEY: undefined });
    expect((await POST(req("not json"))).status).toBe(503);
  });

  it.each([
    ["malformed JSON", "{nope"],
    ["JSON null", "null"],
    ["missing fields", {}],
    ["non-string name", { ...VALID, name: 5 }],
    ["non-string email", { ...VALID, email: null }],
    ["non-string msg", { ...VALID, msg: ["x"] }],
    ["blank name", { ...VALID, name: "   " }],
    ["blank msg", { ...VALID, msg: "" }],
    ["email without @", { ...VALID, email: "ada.example.com" }],
    ["email without dot in domain", { ...VALID, email: "ada@example" }],
    ["email with inner space", { ...VALID, email: "a da@example.com" }],
  ])("400 bad_request for %s", async (_label, body) => {
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "bad_request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("502 send_failed when Resend answers non-2xx, and never echoes the provider body", async () => {
    fetchMock.mockResolvedValue(new Response("secret account details", { status: 500 }));
    const res = await POST(req(VALID));
    expect(res.status).toBe(502);
    const text = await res.text();
    expect(JSON.parse(text)).toEqual({ error: "send_failed" });
    expect(text).not.toContain("secret");
    expect(errorSpy).toHaveBeenCalledWith("resend send failed", 500);
  });
});

describe("rate limiter (in memory, 5 per 60 s per first x-forwarded-for IP)", () => {
  const ip = (addr: string) => ({ "x-forwarded-for": addr });

  it("allows 5 requests then answers 429 rate_limited on the 6th, without calling Resend", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await POST(req(VALID, ip("1.1.1.1")))).status).toBe(200);
    }
    const res = await POST(req(VALID, ip("1.1.1.1")));
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("keys on the first x-forwarded-for entry, trimmed", async () => {
    for (let i = 0; i < 5; i++) await POST(req(VALID, ip(" 2.2.2.2 , 9.9.9.9")));
    // Same first IP, different proxy chain: still limited.
    expect((await POST(req(VALID, ip("2.2.2.2, 8.8.8.8")))).status).toBe(429);
    // Different first IP: independent bucket.
    expect((await POST(req(VALID, ip("3.3.3.3, 2.2.2.2")))).status).toBe(200);
  });

  it("buckets requests without x-forwarded-for together under 'unknown'", async () => {
    for (let i = 0; i < 5; i++) await POST(req(VALID));
    expect((await POST(req(VALID))).status).toBe(429);
  });

  it("window boundary: a hit is live at 59 999 ms", async () => {
    for (let i = 0; i < 5; i++) await POST(req(VALID, ip("5.5.5.5"))); // all at t=0
    await vi.advanceTimersByTimeAsync(59_999);
    expect((await POST(req(VALID, ip("5.5.5.5")))).status).toBe(429);
  });

  it("window boundary: a hit is stale at exactly 60 000 ms", async () => {
    for (let i = 0; i < 5; i++) await POST(req(VALID, ip("6.6.6.6"))); // all at t=0
    await vi.advanceTimersByTimeAsync(60_000);
    expect((await POST(req(VALID, ip("6.6.6.6")))).status).toBe(200);
  });

  it("is a sliding window: slots free one by one as old hits age out", async () => {
    for (let i = 0; i < 5; i++) {
      await POST(req(VALID, ip("4.4.4.4"))); // hits at t=0,10,20,30,40 s
      await vi.advanceTimersByTimeAsync(10_000);
    }
    // t=50 s: no attempt made; all five hits are inside the window.
    await vi.advanceTimersByTimeAsync(10_000); // t=60 s: only the t=0 hit has aged out
    expect((await POST(req(VALID, ip("4.4.4.4")))).status).toBe(200); // 4 live + this = 5
    // A fixed window would have reset completely and still allow this one.
    expect((await POST(req(VALID, ip("4.4.4.4")))).status).toBe(429);
  });

  it("QUIRK (flipped by S3): only requests that passed validation are counted", async () => {
    // 20 invalid requests never consume the budget...
    for (let i = 0; i < 20; i++) {
      expect((await POST(req({ ...VALID, email: "bad" }, ip("7.7.7.7")))).status).toBe(400);
    }
    // ...so all 5 valid ones still go through, and the 6th is limited.
    for (let i = 0; i < 5; i++) {
      expect((await POST(req(VALID, ip("7.7.7.7")))).status).toBe(200);
    }
    expect((await POST(req(VALID, ip("7.7.7.7")))).status).toBe(429);
  });

  it("QUIRK (flipped by S3): rejected 429 attempts are recorded, so hammering extends the lockout", async () => {
    for (let i = 0; i < 5; i++) await POST(req(VALID, ip("8.8.4.4"))); // t=0
    await vi.advanceTimersByTimeAsync(30_000);
    for (let i = 0; i < 5; i++) {
      expect((await POST(req(VALID, ip("8.8.4.4")))).status).toBe(429); // 5 recorded at t=30 s
    }
    await vi.advanceTimersByTimeAsync(30_000); // t=60 s: the original five are stale
    // The five t=30 s rejections still fill the window, so the caller stays locked out.
    expect((await POST(req(VALID, ip("8.8.4.4")))).status).toBe(429);
  });
});

describe("known quirks (S3 flips these)", () => {
  it("QUIRK (flipped by S3): a network failure of the Resend fetch is an unhandled throw", async () => {
    // Today the handler has no try/catch around fetch, so the promise rejects
    // with the underlying error instead of returning 502 {error:"send_failed"}.
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    await expect(POST(req(VALID))).rejects.toThrow("fetch failed");
    expect(errorSpy).not.toHaveBeenCalled(); // not even logged
  });

  it("QUIRK (flipped by S3): the failed attempt still consumed a limiter slot", async () => {
    // Once S3 catches the failure, rejects.toThrow() fails first; S3 must then
    // decide again whether a failed send should use up a slot.
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    for (let i = 0; i < 5; i++) await expect(POST(req(VALID))).rejects.toThrow();
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    expect((await POST(req(VALID))).status).toBe(429);
  });

  it("QUIRK (flipped by S3): the Resend fetch has no timeout/abort signal", async () => {
    await POST(req(VALID));
    expect(fetchMock.mock.calls[0]![1].signal).toBeUndefined();
  });

  it("QUIRK (flipped by S3): CR/LF in name is accepted and lands in the subject", async () => {
    const res = await POST(req({ ...VALID, name: "Ada\r\nBcc: x" }));
    expect(res.status).toBe(200);
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body).subject).toBe("Portfolio — Ada\r\nBcc: x");
  });

  it("QUIRK (flipped by S3): there is no Origin check (a foreign Origin still gets 200)", async () => {
    const res = await POST(req(VALID, { origin: "https://evil.example" }));
    expect(res.status).toBe(200);
  });
});
