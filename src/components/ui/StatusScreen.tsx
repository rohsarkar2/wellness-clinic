import Link from "next/link";

import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import { cn } from "@/lib/utils";

interface StatusScreenProps {
  tone: "error" | "info";
  /** Font Awesome class for the halo icon. */
  icon: string;
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  /** Primary recovery buttons. */
  actions: React.ReactNode;
  /** Suggested destinations, rendered as a divided row of links. */
  links?: Array<{ href: string; icon: string; label: string }>;
  /** Support strip and any reference id. */
  footer?: React.ReactNode;
}

const TONES = {
  error: {
    halo: "bg-[#fdeced] text-[#a02733]",
    ring: "ring-[#f7cdd1]",
    eyebrow: "text-[#a02733]",
    wash: "bg-[radial-gradient(circle_at_top,rgb(209_59_74/0.10),transparent_60%)]",
  },
  info: {
    halo: "bg-mist text-primary",
    ring: "ring-line",
    eyebrow: "text-primary",
    wash: "bg-[radial-gradient(circle_at_top,rgb(10_110_189/0.10),transparent_60%)]",
  },
} as const;

export default function StatusScreen({
  tone,
  icon,
  eyebrow,
  title,
  description,
  actions,
  links,
  footer,
}: StatusScreenProps) {
  const styles = TONES[tone];

  return (
    <Section className={cn("relative overflow-hidden", styles.wash)}>
      <Container>
        <Reveal className="mx-auto max-w-170" onMount>
          <div className="rounded-[16px] bg-white p-7 text-center shadow-panel sm:rounded-[22px] sm:p-11">
            <div
              className={cn(
                "mx-auto mb-6 flex size-19.5 items-center justify-center rounded-full text-[2.2rem] ring-8 sm:size-24 sm:text-[2.6rem]",
                styles.halo,
                styles.ring,
              )}
            >
              <i className={icon} aria-hidden="true" />
            </div>

            <span
              className={cn(
                "text-[0.8rem] font-bold tracking-[2px] uppercase",
                styles.eyebrow,
              )}
            >
              {eyebrow}
            </span>

            <h1 className="mt-2 mb-3 font-display text-[1.6rem] leading-tight font-bold text-ink sm:text-[2.1rem]">
              {title}
            </h1>

            <div className="mx-auto max-w-125">{description}</div>

            <div className="mt-8 flex flex-wrap justify-center gap-3.5">
              {actions}
            </div>

            {links ? (
              <div className="mt-9 border-t border-line pt-7">
                <p className="mb-4 text-[0.85rem] font-semibold tracking-[1px] text-[#9aa5b1] uppercase">
                  Or continue to
                </p>
                <ul className="grid gap-2.5 sm:grid-cols-3">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex items-center justify-center gap-2.5 rounded-xl bg-mist px-4 py-3.5 font-semibold text-ink transition duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-primary sm:flex-col sm:gap-2 sm:py-5"
                      >
                        <i
                          className={cn(
                            "text-[1.15rem] text-primary",
                            link.icon,
                          )}
                          aria-hidden="true"
                        />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {footer ? (
              <div className="mt-8 border-t border-line pt-6 text-[0.9rem]">
                {footer}
              </div>
            ) : null}
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
