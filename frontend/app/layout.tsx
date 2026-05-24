import type { Metadata } from "next";
import {
  Fraunces,
  Geist,
  IBM_Plex_Sans_Arabic,
  JetBrains_Mono,
} from "next/font/google";
import { getLocale } from "next-intl/server";
import "./globals.css";

/**
 * Typography — DESIGN.md spec, wired via next/font (zero external requests).
 *
 * Variables exposed on <body>:
 *   --font-fraunces            display only (wordmark, page titles, sections)
 *   --font-geist               body + UI Latin
 *   --font-ibm-plex-arabic     body + UI Arabic
 *   --font-jetbrains-mono      prices, SKUs, stock counts
 *
 * globals.css aliases these to canonical --font-display / --font-body /
 * --font-arabic / --font-mono and switches body to the Arabic family
 * under [dir="rtl"]. Components consume the canonical names.
 */

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-fraunces",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "V-fixer",
  description: "V-fixer",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${geist.variable} ${plexArabic.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
