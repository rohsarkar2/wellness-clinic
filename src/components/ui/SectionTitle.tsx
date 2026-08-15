interface SectionTitleProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="mb-10 text-center md:mb-14">
      <span className="text-[0.85rem] font-bold tracking-[2px] text-pink">{eyebrow}</span>
      <h2 className="my-2.5 font-display text-[1.65rem] font-bold text-ink sm:text-[1.9rem] md:text-[2.3rem]">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto max-w-180 text-[0.95rem] md:text-base">{description}</p>
      ) : null}
    </div>
  );
}
