import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "onDark";
type Size = "md" | "sm";

const BASE =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition duration-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:-translate-y-[3px]",
  secondary:
    "bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white",
  // Used on the dark blue CTA band.
  onDark: "bg-white text-primary hover:-translate-y-[3px] whitespace-nowrap",
};

const SIZES: Record<Size, string> = {
  md: "px-7 py-3.5 text-base",
  sm: "px-5 py-2.5 text-[0.9rem]",
};

/**
 * On phones a lone button stretches to a capped width so it reads as a primary
 * action; buttons sitting inline with others keep their intrinsic size.
 */
const BLOCK_ON_MOBILE = "w-full max-w-80 mx-auto md:w-auto md:max-w-none md:mx-0";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Stretch to full width on phones (default for standalone buttons). */
  block?: boolean;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  block = true,
  className,
  children,
  ...rest
}: CommonProps & { href: string; onClick?: () => void; target?: string; rel?: string }) {
  const classes = cn(BASE, VARIANTS[variant], SIZES[size], block && BLOCK_ON_MOBILE, className);

  // Plain anchor for tel:/https: targets, next/link for in-app routes.
  if (/^(https?:|tel:|mailto:|#)/.test(href)) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  children,
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], SIZES[size], block && BLOCK_ON_MOBILE, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
