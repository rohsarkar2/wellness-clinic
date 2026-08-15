/** Single source of truth for clinic details repeated across the site. */
export const site = {
  name: "Wellness Health Point",
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
  mapEmbed: "https://www.google.com/maps?q=The+Wellness+Health+Point&output=embed",
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
