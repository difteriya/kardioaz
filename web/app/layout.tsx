import type { Metadata } from "next";
import { Fraunces, Inter, Space_Grotesk } from "next/font/google";
import { SITE, DOCTOR, PHOTOS } from "@/lib/site";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CookieBanner } from "@/components/cookie-banner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const label = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-label",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${DOCTOR.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: DOCTOR.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "az_AZ",
    siteName: SITE.name,
    url: SITE.url,
    title: `${DOCTOR.name} — ${SITE.tagline}`,
    description: SITE.description,
    // Shared links (WhatsApp especially) previewed with no image until now.
    // The close-up, not the full-length portrait: social cards crop to a wide
    // strip, and a standing shot arrives as a headless torso.
    images: [
      {
        url: PHOTOS.hero.src,
        width: 1800,
        height: 2700,
        alt: `${DOCTOR.name} — ${DOCTOR.title}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${DOCTOR.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [PHOTOS.hero.src],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="az" className={`${fraunces.variable} ${inter.variable} ${label.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
