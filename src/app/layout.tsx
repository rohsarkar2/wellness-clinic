import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

import FloatingButtons from "@/components/layout/FloatingButtons";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { DEFAULT_TITLE, OG_IMAGES } from "@/lib/metadata";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

/**
 * Site-wide defaults. Every page overrides the title, description, canonical
 * URL and social card via `pageMetadata`; what's left here is what's shared.
 */
export const metadata: Metadata = {
  // Lets pages express canonical/OG URLs as plain paths like "/doctors".
  metadataBase: new URL(site.url),
  title: { default: DEFAULT_TITLE, template: `${site.name} | %s` },
  description: site.description,
  applicationName: site.name,
  category: "health",
  keywords: [
    site.name,
    "clinic in Khardah",
    "doctor appointment Khardah",
    "paediatrician",
    "gynaecologist",
    "ENT specialist",
    "general surgeon",
    "diabetologist",
    "diagnostics",
    "health checkup",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: DEFAULT_TITLE,
    description: site.description,
    url: "/",
    siteName: site.name,
    locale: "en_IN",
    images: [{ ...OG_IMAGES.home, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: site.description,
    images: [OG_IMAGES.home.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a6ebd",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior opts back into Next 16's scroll override so route
    // changes jump instantly while in-page anchors still scroll smoothly.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={cn(inter.variable, poppins.variable, "font-sans")}
    >
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
