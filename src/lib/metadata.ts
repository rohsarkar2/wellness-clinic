import type { Metadata } from "next";

import { site } from "@/lib/site";

/**
 * Metadata helpers.
 *
 * Every page passes through `pageMetadata` so canonical URLs, Open Graph and
 * Twitter cards stay in sync with the title and description instead of being
 * hand-rolled per route. Relative URLs are resolved against the `metadataBase`
 * set in the root layout.
 */

/** Used when a page doesn't set its own title (i.e. the home page). */
export const DEFAULT_TITLE = `${site.name} | Compassionate Healthcare`;

interface OgImage {
  url: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Social previews come from /public/og, not /public/images: the source artwork
 * is 1.5–2.2 MB and 3:2, and WhatsApp drops any preview image much over 300 KB.
 * `scripts/generate-og-images.mjs` builds these 1200×630 derivatives.
 */
const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_IMAGES = {
  home: { url: "/og/heroimg.jpg", ...OG_SIZE },
  clinic: { url: "/og/clinic.jpg", ...OG_SIZE },
  services: { url: "/og/services.jpg", ...OG_SIZE },
  doctors: { url: "/og/collage.jpg", ...OG_SIZE },
  about: { url: "/og/abouts.jpg", ...OG_SIZE },
} as const;

/**
 * The social crop of a doctor's portrait. Falls back to the team image for a
 * doctor whose photo isn't one of the local files — a remote URL from the
 * backend, say — since no derivative would exist for it.
 */
export function doctorOgImage(portrait: string) {
  if (!portrait.startsWith("/images/")) return OG_IMAGES.doctors;

  return {
    url: portrait
      .replace("/images/", "/og/")
      .replace(/\.(png|jpe?g)$/i, ".jpg"),
    ...OG_SIZE,
  };
}

export interface PageMetadataOptions {
  /** Page title without the clinic name — the layout template prepends it. */
  title?: string;
  description: string;
  /** Route the page is served from, e.g. "/doctors". Sets the canonical URL. */
  path: string;
  image: OgImage;
  /** `profile` for a person (doctor pages), `website` for everything else. */
  type?: "website" | "profile";
  /** Keeps transient, query-driven screens out of search results. */
  noindex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  type = "website",
  noindex = false,
}: PageMetadataOptions): Metadata {
  // Social cards have no title template applied to them, so spell it out.
  const socialTitle = title ? `${site.name} | ${title}` : DEFAULT_TITLE;

  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type,
      title: socialTitle,
      description,
      url: path,
      siteName: site.name,
      locale: "en_IN",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [image.url],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}
