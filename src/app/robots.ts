import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Booking confirmations are per-visitor and carry no crawlable content.
      disallow: ["/appointment/success"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
