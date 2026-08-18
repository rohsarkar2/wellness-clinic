import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { OG_IMAGES, pageMetadata } from "@/lib/metadata";
import { site, telHref } from "@/lib/site";

/** Noindex: this page only means anything straight after a submission. */
export const metadata: Metadata = pageMetadata({
  title: "Thank You",
  description: "Your appointment request has been received.",
  path: "/appointment/success",
  image: { ...OG_IMAGES.clinic, alt: site.name },
  noindex: true,
});

export default function AppointmentSuccessPage() {
  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-160 rounded-[16px] bg-white p-9 text-center shadow-card sm:rounded-[22px] sm:p-[55px_40px]">
          <div className="mx-auto mb-6.5 flex size-19.5 items-center justify-center rounded-full bg-[#e8f8f2] text-[2.2rem] text-[#1aa87a] sm:size-24 sm:text-[2.8rem]">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
          </div>

          <h1 className="mb-3 font-display text-[1.6rem] font-bold text-ink sm:text-[2rem]">
            Thank You!
          </h1>
          <p className="mx-auto max-w-110">
            Your request has been received. Our team at {site.name} will contact
            you shortly to confirm your appointment.
          </p>

          <p className="mt-4 text-[0.95rem] text-[#7a8794]">
            Need us sooner? Call the clinic on {site.phonePrimary}.
          </p>

          <div className="mt-7.5 flex flex-wrap justify-center gap-3.5">
            <ButtonLink href="/" block={false}>
              Back to Home
            </ButtonLink>
            <ButtonLink href={telHref} variant="secondary" block={false}>
              <i className="fa-solid fa-phone" aria-hidden="true" />
              Call the Clinic
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
