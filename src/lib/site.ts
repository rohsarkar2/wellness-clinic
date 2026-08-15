/**
 * Where the site is served from today. Swap this for the clinic's own domain
 * once DNS points at the deployment — canonical links and social previews are
 * only as good as this origin, and an origin that doesn't resolve is worse
 * than none.
 */
const DEFAULT_ORIGIN = "https://wellness-health-point.vercel.app";

/**
 * Where this deployment actually lives.
 *
 * Social scrapers need absolute URLs, so an origin that doesn't resolve means
 * no preview image anywhere. `.env` isn't committed, so the Vercel-provided
 * host is what production actually falls back to.
 *
 * Deliberately not `VERCEL_URL`: that's the per-deployment hostname, which
 * changes on every push and would make canonical links point at a build rather
 * than at the site.
 */
function resolveSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    DEFAULT_ORIGIN;

  const withProtocol = /^https?:\/\//.test(candidate)
    ? candidate
    : `https://${candidate}`;

  return withProtocol.replace(/\/$/, "");
}

/** Single source of truth for clinic details repeated across the site. */
export const site = {
  name: "Wellness Health Point",
  /**
   * Canonical origin, used for canonical links, OG tags and the sitemap.
   *
   * Only ever read from server-side code (metadata, robots, sitemap), which is
   * what lets the Vercel fallbacks work — those variables aren't exposed to the
   * browser. Set NEXT_PUBLIC_SITE_URL to pin it explicitly.
   */
  url: resolveSiteUrl(),
  tagline: "Care. Compassion. Excellence.",
  description:
    "Wellness Health Point — compassionate healthcare with experienced doctors, modern diagnostics and patient-focused treatment.",
  phonePrimary: "+91 6291664625",
  phoneSecondary: "+91 9836406226",
  email: "info@wellnesshealthpoint.com",
  address: "Pansila, Khardah",
  hours: "Mon–Sat: 9 AM – 8 PM",
  hoursNote: "Sunday: Emergency Only",
  whatsapp: "916291664625",
  mapEmbed:
    "https://www.google.com/maps?q=The+Wellness+Health+Point&output=embed",
} as const;

/** Digits-only number for `tel:` links. */
export const telHref = `tel:${site.phonePrimary.replace(/\s/g, "")}`;
export const whatsappHref = `https://wa.me/${site.whatsapp}`;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/doctors", label: "Doctors" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
