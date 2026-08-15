import { site } from "@/lib/site";

/**
 * Edge-to-edge Google Map. Deliberately rendered outside any container so it
 * spans the full viewport width with no horizontal padding or margin.
 */
export default function MapSection() {
  return (
    <section className="leading-none" aria-label={`Map to ${site.name}`}>
      <iframe
        title={`Map to ${site.name}`}
        src={site.mapEmbed}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="block h-75 w-full border-0 sm:h-85 md:h-100 lg:h-115"
      />
    </section>
  );
}
