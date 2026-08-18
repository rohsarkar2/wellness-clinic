/** Jumps the window back to the top, honouring the reduced-motion preference
    the way the rest of the site's motion does. */
export function scrollToTop() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}
