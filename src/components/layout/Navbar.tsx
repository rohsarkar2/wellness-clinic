"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { navLinks, site } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  const close = () => setOpen(false);

  // Escape and taps outside the header dismiss the drawer.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-999 bg-white shadow-[0_2px_15px_rgb(0_0_0/0.05)]"
    >
      <div className="container-page flex items-center justify-between gap-4 py-3.5 lg:py-4.5">
        <Link
          href="/"
          onClick={close}
          className="flex min-w-0 items-center gap-3 text-ink"
          aria-label={`${site.name} — home`}
        >
          <i
            className="fa-solid fa-heart-pulse text-[1.7rem] text-primary sm:text-[2rem]"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <h2 className="font-display text-[1.1rem] leading-tight font-bold sm:text-[1.4rem]">
              {site.name}
            </h2>
            <span className="hidden text-[0.72rem] text-[#777] min-[361px]:block sm:text-[0.8rem]">
              {site.tagline}
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex size-11.5 shrink-0 cursor-pointer items-center justify-center rounded-xl text-[1.4rem] text-ink transition-colors hover:bg-mist lg:hidden"
        >
          <i
            className={open ? "fa-solid fa-xmark" : "fa-solid fa-bars"}
            aria-hidden="true"
          />
        </button>

        {/* Below lg this is an absolutely-positioned drawer anchored to the
            sticky header, so it spans the full viewport width. */}
        <nav
          id="primary-navigation"
          aria-label="Primary"
          className={cn(
            "absolute top-full right-0 left-0 overflow-hidden border-t border-[#eef2f7] bg-white shadow-[0_18px_30px_rgb(0_0_0/0.08)] transition-[max-height,visibility] duration-350",
            "lg:static lg:visible lg:max-h-none lg:overflow-visible lg:border-0 lg:shadow-none",
            open ? "visible max-h-130" : "invisible max-h-0",
          )}
        >
          <ul className="lg:flex lg:items-center lg:gap-6 xl:gap-8.5">
            {navLinks.map((link) => (
              <li
                key={link.href}
                className="border-t border-[#f1f5f9] first:border-t-0 lg:border-0"
              >
                <Link
                  href={link.href}
                  onClick={close}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "group relative block px-[6%] py-3.75 font-semibold transition-colors lg:px-0 lg:py-0",
                    isActive(link.href)
                      ? "bg-mist text-primary shadow-[inset_3px_0_0_var(--color-primary)] lg:bg-transparent lg:shadow-none"
                      : "text-ink hover:text-primary",
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      "absolute -bottom-2.5 left-0 hidden h-0.75 rounded-[10px] bg-primary transition-[width] duration-350 lg:block",
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full",
                    )}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>

          <div className="px-[6%] py-4.5 lg:hidden">
            <ButtonLink
              href="/appointment"
              onClick={close}
              block={false}
              className="w-full"
            >
              <i className="fa-solid fa-calendar-check" aria-hidden="true" />
              Book Appointment
            </ButtonLink>
          </div>
        </nav>

        {/* `max-lg:hidden`, not `hidden lg:inline-flex` — an unprefixed `hidden`
            ties with the button's base `inline-flex` and loses on source order. */}
        <ButtonLink
          href="/appointment"
          onClick={close}
          block={false}
          className="max-lg:hidden"
        >
          Book Appointment
        </ButtonLink>
      </div>
    </header>
  );
}
