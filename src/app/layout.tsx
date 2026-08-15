import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./globals.css";

import FloatingButtons from "@/components/layout/FloatingButtons";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { site } from "@/lib/site";

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

export const metadata: Metadata = {
  title: {
    default: `${site.name} | Compassionate Healthcare`,
    template: `${site.name} | %s`,
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a6ebd",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-scroll-behavior opts back into Next 16's scroll override so route
    // changes jump instantly while in-page anchors still scroll smoothly.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${poppins.variable}`}
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
