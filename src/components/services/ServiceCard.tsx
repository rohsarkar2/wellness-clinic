import type { Service } from "@/lib/types";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="rounded-card bg-white p-5 text-center shadow-card transition duration-300 hover:-translate-y-2 sm:p-6">
      <i className={`text-[2.3rem] text-primary ${service.icon}`} aria-hidden="true" />
      <h3 className="my-3 font-display text-[1.2rem] font-semibold text-ink">{service.title}</h3>
      <p>{service.description}</p>
    </article>
  );
}
