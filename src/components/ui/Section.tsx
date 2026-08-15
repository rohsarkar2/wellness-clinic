import { cn } from "@/lib/cn";

interface SectionProps {
  className?: string;
  /** Drops the built-in vertical rhythm (used by the full-bleed map). */
  flush?: boolean;
  children: React.ReactNode;
  "aria-label"?: string;
  id?: string;
}

/** Standard page section, carrying the site's vertical rhythm. */
export default function Section({
  className,
  flush = false,
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={cn(!flush && "py-[38px] md:py-[50px]", className)} {...rest}>
      {children}
    </section>
  );
}
