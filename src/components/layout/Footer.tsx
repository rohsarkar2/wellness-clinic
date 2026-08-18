import Link from "next/link";

import { ScrollToTop } from "@/components/scroll-to-top";
import { navLinks, site } from "@/lib/site";

const HEADING = "mb-[18px] font-display font-semibold text-white";

const SOCIAL_BUTTON =
  "flex size-10 items-center justify-center rounded-full border border-white/20 text-[18px] text-white transition duration-300 hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/10";

const socials = [
  { href: site.instagram, label: "Follow us on Instagram", icon: "fa-instagram" },
  { href: site.facebook, label: "Follow us on Facebook", icon: "fa-facebook-f" },
].filter((social) => social.href);

export default function Footer() {
  return (
    <footer className="bg-navy pt-13.75 pb-5 text-[#d9e2ef] md:pt-22.5">
      <div className="container-page grid gap-8 text-center md:grid-cols-2 md:gap-10 md:text-left lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <h3 className={HEADING}>{site.name}</h3>
          <p>Compassionate healthcare with modern technology.</p>

          {socials.length > 0 && (
            <div className="mt-4.5 flex justify-center gap-3 md:justify-start">
              {socials.map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={SOCIAL_BUTTON}
                  aria-label={social.label}
                >
                  <i className={`fa-brands ${social.icon}`} aria-hidden="true" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className={HEADING}>Quick Links</h4>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="block py-2.25 hover:text-white md:py-0.75">
              {link.label}
            </Link>
          ))}
        </div>

        <div>
          <h4 className={HEADING}>Contact</h4>
          <p>{site.phonePrimary}</p>
          <p>{site.phoneSecondary}</p>
          <p>{site.email}</p>
        </div>

        <div>
          <h4 className={HEADING}>Clinic Hours</h4>
          <p>{site.hours}</p>
          <p>{site.hoursNote}</p>
        </div>
      </div>

      <div className="container-page mt-8.75 flex flex-col items-center gap-4.5 border-t border-white/15 pt-5 text-center md:mt-12.5 md:flex-row md:justify-between md:gap-5 md:text-left">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <ScrollToTop />
      </div>
    </footer>
  );
}
