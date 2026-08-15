interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-card bg-white p-5 text-center shadow-card transition duration-300 hover:-translate-y-2 sm:p-6">
      <i className={`text-[2.3rem] text-primary ${icon}`} aria-hidden="true" />
      <h3 className="my-3 font-display text-[1.2rem] font-semibold text-ink">{title}</h3>
      <p>{description}</p>
    </div>
  );
}
