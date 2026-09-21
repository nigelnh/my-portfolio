import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Pixelify_Sans } from "next/font/google";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

const pixelify = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-pixelify",
  display: "swap",
});

const TITLE = "Nhan Nguyen — Software Engineer & Quantitative Finance";
const DESCRIPTION =
  "Portfolio of Nhan Nguyen: real-time market data systems, covered warrants pricing, and full-stack engineering. Gettysburg College, class of 2027.";

/**
 * Absolute URLs for link previews. Vercel fills
 * `VERCEL_PROJECT_PRODUCTION_URL` at build; set `NEXT_PUBLIC_SITE_URL` once
 * there is a custom domain.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Nhan Nguyen",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["vi_VN", "zh_CN"],
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Nhan Nguyen — Software Engineer & Quantitative Finance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#a8c9e4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexMono.variable} ${pixelify.variable}`}>
      <body>{children}</body>
    </html>
  );
}
