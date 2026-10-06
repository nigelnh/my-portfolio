import type { NextConfig } from "next";
import { projectsMeta } from "./lib/copy";

const isDev = process.env.NODE_ENV !== "production";

/** Project origins for `frame-src`, derived so the list cannot go stale. */
const frameOrigins = [...new Set(projectsMeta.map((p) => new URL(p.url).origin))];

/**
 * 'unsafe-inline' is needed for Next's inline bootstrap scripts until the
 * site moves to per-request nonces (follow-up). Dev adds 'unsafe-eval' for
 * React's debugging tools only.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' data: blob:",
  "connect-src 'self'",
  `frame-src ${frameOrigins.join(" ")}`,
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
