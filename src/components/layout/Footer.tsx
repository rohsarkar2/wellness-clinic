import Link from "next/link";

import { navLinks, site } from "@/lib/site";

const HEADING = "mb-[18px] font-display font-semibold text-white";

export default function Footer() {
  return (
    <footer className="bg-navy pt-13.75 pb-5 text-[#d9e2ef] md:pt-22.5">
      <div className="container-page grid gap-8 text-center md:grid-cols-2 md:gap-10 md:text-left lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <div>
          <h3 className={HEADING}>{site.name}</h3>
          <p>Compassionate healthcare with modern technology.</p>
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

      <div className="container-page mt-8.75 border-t border-white/15 pt-5 text-center md:mt-12.5">
        <p>
          &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
