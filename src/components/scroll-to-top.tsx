"use client";

import { scrollToTop } from "@/lib/scroll";
import { cn } from "@/lib/utils";

/**
 * Back-to-top control.
 *
 * It lives in the footer, which a reader only reaches by scrolling to the very
 * bottom — so there is nothing to decide about when to offer it, and it needs
 * neither a scroll listener nor an appear/disappear transition. The colour is
 * inherited rather than set, so it sits correctly on the footer's navy.
 */
export function ScrollToTop({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={cn(
        "flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-white/20 px-4.5 py-2.25 text-[0.9rem] font-semibold transition duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white",
        className,
      )}
    >
      <i className="fa-solid fa-arrow-up" aria-hidden="true" />
      Back to top
    </button>
  );
}
