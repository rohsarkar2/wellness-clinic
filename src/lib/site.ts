const DEFAULT_ORIGIN = "https://wellness-health-point.vercel.app";

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
  url: resolveSiteUrl(),
  tagline: "Care. Compassion. Excellence.",
  description:
    "Wellness Health Point — compassionate healthcare with experienced doctors, modern diagnostics and patient-focused treatment.",
  phonePrimary: "+91 6291664625",
  phoneSecondary: "+91 9836406226",
  email: "thewellnesshealthpoint@gmail.com",
  address: "Pansila, Khardah",
  hours: "Mon–Sat: 9 AM – 8 PM",
  hoursNote: "Sunday: Emergency Only",
  whatsapp: "916291664625",
  /** Social profiles — set to "" to hide the icon in the footer. */
  instagram: "https://www.instagram.com/wellnesshealthpoint/?hl=en",
  facebook: "",
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
  { href: "/contact", label: "Contact Us" },
] as const;
