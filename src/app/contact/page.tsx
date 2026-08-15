import type { Metadata } from "next";
import Image from "next/image";

import EnquiryForm from "@/components/contact/EnquiryForm";
import Hero, { HeroContent } from "@/components/layout/Hero";
import MapSection from "@/components/layout/MapSection";
import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { site, telHref, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Wellness Health Point — address, phone numbers, clinic hours and an enquiry form for appointments and questions.",
};

export default function ContactPage() {
  const details = [
    {
      icon: "fa-solid fa-location-dot",
      title: "Address",
      description: site.address,
    },
    {
      icon: "fa-solid fa-phone",
      title: "Phone",
      description: site.phonePrimary,
    },
    { icon: "fa-solid fa-envelope", title: "Email", description: site.email },
    { icon: "fa-solid fa-clock", title: "Hours", description: site.hours },
  ];

  return (
    <>
      <Hero>
        <HeroContent>
          <div className="w-full lg:max-w-150">
            <span className="text-[0.78rem] font-bold tracking-[1px] text-pink uppercase sm:text-base">
              Contact Us
            </span>
            <h1 className="my-3 font-display text-[1.95rem] leading-tight font-bold text-ink sm:text-[2.3rem] md:my-4 lg:text-[2.9rem]">
              We&apos;re Here To Help
            </h1>
            <p className="mx-auto mb-7 max-w-140 lg:mx-0">
              Reach out to our team to book appointments, ask questions, or
              learn more about our healthcare services.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:flex-row lg:justify-start">
              <ButtonLink href="#enquiry">Send a Message</ButtonLink>
              <ButtonLink href={telHref} variant="secondary">
                <i className="fa-solid fa-phone" aria-hidden="true" />
                Call Now
              </ButtonLink>
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/images/clinic.png"
              alt="Wellness Health Point reception"
              width={620}
              height={480}
              priority
              className="mx-auto h-auto max-w-full rounded-card lg:max-w-120"
            />
          </div>
        </HeroContent>
      </Hero>

      {/* Decorative blobs, hidden on phones where they crowd the form. */}
      <Section className="relative overflow-hidden bg-linear-[135deg,#eef7ff_0%,#f8fcff_45%,#ffffff_100%] md:before:absolute md:before:-top-45 md:before:-left-30 md:before:size-105 md:before:rounded-full md:before:bg-primary/8 md:after:absolute md:after:-right-25 md:after:-bottom-30 md:after:size-80 md:after:rounded-full md:after:bg-[#f48fb1]/10">
        <Container className="relative z-2">
          <SectionTitle eyebrow="Get In Touch" title="Contact Information" />

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {details.map((detail) => (
              <FeatureCard key={detail.title} {...detail} />
            ))}
          </div>

          <div className="mt-10 text-center">
            <ButtonLink
              href={whatsappHref}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa-brands fa-whatsapp" aria-hidden="true" />
              Message us on WhatsApp
            </ButtonLink>
          </div>

          <div id="enquiry" className="my-11 md:my-15">
            <EnquiryForm
              wide
              title="Send an Enquiry"
              subtitle="Fill in your details and we'll contact you shortly. To pick a specific time slot, use the booking page instead."
            />
          </div>

          <div className="text-center">
            <ButtonLink href="/appointment">Book a Time Slot</ButtonLink>
          </div>
        </Container>
      </Section>

      <MapSection />
    </>
  );
}
