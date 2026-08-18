import { cn } from "@/lib/utils";

/**
 * The gradient hero band, with the two soft radial washes from the original
 * design layered on via a pseudo-element.
 */
export default function Hero({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-linear-[135deg,#eef7ff,#fff] py-9 sm:py-11 md:py-14 lg:py-20",
        "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgb(10_110_189/0.12),transparent_35%),radial-gradient(circle_at_bottom_right,rgb(0_184_169/0.12),transparent_35%)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Two columns from `lg` up, stacked and centred below. */
export function HeroContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="container-page relative z-2 grid items-start justify-items-center gap-11 text-center lg:grid-cols-[1.1fr_0.9fr] lg:justify-items-stretch lg:gap-12.5 lg:text-left">
      {children}
    </div>
  );
}
