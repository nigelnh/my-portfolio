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

export const metadata: Metadata = {
  title: "Nhan Nguyen — Software Engineer & Quantitative Finance",
  description:
    "Portfolio of Nhan Nguyen: real-time market data systems, covered warrants pricing, and full-stack engineering. Gettysburg College, class of 2027.",
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
