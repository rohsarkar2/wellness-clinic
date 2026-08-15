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

/** The artwork in /public/images is all 3:2; doctor portraits are 4:5. */
export const OG_IMAGES = {
  home: { url: "/images/heroimg.png", width: 1536, height: 1024 },
  clinic: { url: "/images/clinic.png", width: 1536, height: 1024 },
  services: { url: "/images/services.png", width: 1536, height: 1024 },
  doctors: { url: "/images/collage.png", width: 1536, height: 1024 },
  about: { url: "/images/abouts.png", width: 1536, height: 1024 },
} as const;

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
