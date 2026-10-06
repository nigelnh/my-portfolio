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
    const email = `a@${("d".repeat(60) + ".").repeat(4)}com`; // 249 chars, cut to 200 (still valid)
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

describe("Resend failure handling (S3, was an unhandled throw)", () => {
  it("a network failure returns 502 send_failed, logs only the error class, never throws", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed for ada@example.com"));
    const res = await POST(req(VALID));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "send_failed" });
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith("resend send failed", "TypeError");
    expect(JSON.stringify(errorSpy.mock.calls)).not.toContain("ada");
  });

  it("a timeout (TimeoutError from the abort signal) returns 502 send_failed", async () => {
    fetchMock.mockRejectedValue(new DOMException("The operation timed out.", "TimeoutError"));
    const res = await POST(req(VALID));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "send_failed" });
    expect(errorSpy).toHaveBeenCalledWith("resend send failed", "TimeoutError");
  });

  it("the Resend fetch carries an 8 s AbortSignal.timeout signal", async () => {
    const spy = vi.spyOn(AbortSignal, "timeout");
    await POST(req(VALID));
    expect(spy).toHaveBeenCalledWith(8_000);
    expect(fetchMock.mock.calls[0]![1].signal).toBeInstanceOf(AbortSignal);
    spy.mockRestore();
  });

  it("a failed send still consumes a limiter slot (kept on purpose: it reached the provider)", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));
    for (let i = 0; i < 5; i++) expect((await POST(req(VALID))).status).toBe(502);
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
    expect((await POST(req(VALID))).status).toBe(429);
  });
});

describe("validation (S3, zod)", () => {
  it.each([
    ["CR/LF in name", { ...VALID, name: "Ada\r\nBcc: x" }],
    ["LF in name", { ...VALID, name: "Ada\nx" }],
    ["tab in name", { ...VALID, name: "Ada\tx" }],
    ["NUL in name", { ...VALID, name: "Ada\u0000x" }],
    ["DEL in name", { ...VALID, name: "Ada\u007fx" }],
    ["CR/LF in email", { ...VALID, email: "ada@example.com\r\nBcc: x@y.zz" }],
    ["control char inside email", { ...VALID, email: "ad\u0001a@example.com" }],
    ["comma in email local part", { ...VALID, email: "a,b@example.com" }],
    ["angle brackets in email", { ...VALID, email: "<ada@example.com>" }],
  ])("400 bad_request for %s", async (_label, body) => {
    const res = await POST(req(body));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "bad_request" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("an email whose 200-character cut is no longer a valid address is a 400 (checks run after the cap)", async () => {
    const email = `${"a".repeat(190)}@example.com`; // 202 chars; the cut leaves "@example.c"
    expect((await POST(req({ ...VALID, email }))).status).toBe(400);
  });

  it("still allows newlines in the message body", async () => {
    const res = await POST(req({ ...VALID, msg: "line one\r\nline two" }));
    expect(res.status).toBe(200);
  });

  it("trims surrounding whitespace, including a trailing newline, before checking", async () => {
    const res = await POST(req({ ...VALID, name: "Ada\n", email: "ada@example.com\r\n" }));
    expect(res.status).toBe(200);
  });
});

describe("honeypot (S3)", () => {
  it("a filled `website` field returns 200 {ok:true} without calling Resend", async () => {
    const res = await POST(req({ ...VALID, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("answers 200 even when the other fields are invalid (the bot learns nothing)", async () => {
    const res = await POST(req({ name: "", email: "x", msg: "", website: "x" }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("does not consume limiter slots: 20 honeypot hits leave all 5 real sends available", async () => {
    for (let i = 0; i < 20; i++) await POST(req({ ...VALID, website: "x" }, { "x-forwarded-for": "9.9.9.9" }));
    for (let i = 0; i < 5; i++) {
      expect((await POST(req(VALID, { "x-forwarded-for": "9.9.9.9" }))).status).toBe(200);
    }
  });

  it("an empty or whitespace website field is a normal submission", async () => {
    expect((await POST(req({ ...VALID, website: "" }))).status).toBe(200);
    expect((await POST(req({ ...VALID, website: "   " }))).status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

describe("Origin check (S3)", () => {
  const origin = (o: string) => ({ origin: o });

  it("403 forbidden for a foreign Origin, without calling Resend or consuming the limiter", async () => {
    await load({ NEXT_PUBLIC_SITE_URL: "https://site.example" });
    for (let i = 0; i < 10; i++) {
      const res = await POST(req(VALID, origin("https://evil.example")));
      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ error: "forbidden" });
    }
    expect(fetchMock).not.toHaveBeenCalled();
    expect((await POST(req(VALID, origin("https://site.example")))).status).toBe(200);
  });

  it("allows the NEXT_PUBLIC_SITE_URL origin (a path in the setting is ignored)", async () => {
    await load({ NEXT_PUBLIC_SITE_URL: "https://site.example/some/path" });
    expect((await POST(req(VALID, origin("https://site.example")))).status).toBe(200);
  });

  it("allows https://$VERCEL_PROJECT_PRODUCTION_URL when no site URL is set", async () => {
    await load({
      NEXT_PUBLIC_SITE_URL: undefined,
      VERCEL_PROJECT_PRODUCTION_URL: "prod.example.com",
    });
    expect((await POST(req(VALID, origin("https://prod.example.com")))).status).toBe(200);
  });

  it("allows the current deployment origin https://$VERCEL_URL (previews)", async () => {
    await load({ VERCEL_URL: "my-portfolio-git-x.vercel.app" });
    expect((await POST(req(VALID, origin("https://my-portfolio-git-x.vercel.app")))).status).toBe(200);
  });

  it("does not match by prefix or scheme", async () => {
    await load({ NEXT_PUBLIC_SITE_URL: "https://site.example" });
    expect((await POST(req(VALID, origin("https://site.example.evil.com")))).status).toBe(403);
    expect((await POST(req(VALID, origin("http://site.example")))).status).toBe(403);
    expect((await POST(req(VALID, origin("null")))).status).toBe(403);
  });

  it("allows http://localhost:* outside production", async () => {
    await load({ NODE_ENV: "development" });
    expect((await POST(req(VALID, origin("http://localhost:3000")))).status).toBe(200);
    expect((await POST(req(VALID, origin("http://localhost")))).status).toBe(200);
    expect((await POST(req(VALID, origin("https://localhost:3000")))).status).toBe(403);
    expect((await POST(req(VALID, origin("http://localhost.evil.com")))).status).toBe(403);
  });

  it("rejects http://localhost:* in production", async () => {
    await load({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://site.example" });
    expect((await POST(req(VALID, origin("http://localhost:3000")))).status).toBe(403);
  });

  it("with nothing configured, a present non-local Origin is refused", async () => {
    await load({ NODE_ENV: "production" });
    expect((await POST(req(VALID, origin("https://anything.example")))).status).toBe(403);
  });

  it("ACCEPTED GAP: an absent Origin header is allowed (non-browser clients, privacy setups)", async () => {
    await load({ NODE_ENV: "production", NEXT_PUBLIC_SITE_URL: "https://site.example" });
    expect((await POST(req(VALID))).status).toBe(200);
  });

  it("a malformed NEXT_PUBLIC_SITE_URL allows nothing and does not throw", async () => {
    await load({ NEXT_PUBLIC_SITE_URL: "not a url", NODE_ENV: "production" });
    expect((await POST(req(VALID, origin("https://site.example")))).status).toBe(403);
    expect((await POST(req(VALID))).status).toBe(200);
  });

  it("503 is still checked first, before the Origin", async () => {
    await load({ RESEND_API_KEY: undefined });
    expect((await POST(req(VALID, origin("https://evil.example")))).status).toBe(503);
  });
});
