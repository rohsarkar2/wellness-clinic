import type { Metadata } from "next";
import Image from "next/image";

import Hero, { HeroContent } from "@/components/layout/Hero";
import ServiceCard from "@/components/services/ServiceCard";
import Alert from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { toErrorMessage } from "@/lib/api/client";
import { getServices } from "@/lib/api/services";
import type { Service } from "@/lib/types";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Comprehensive healthcare under one roof — general medicine, cardiology, gynecology, orthopedics, diagnostics and preventive health checkups.",
};

const PROCESS = [
  { icon: "fa-solid fa-calendar-plus", title: "Book", description: "Choose a convenient appointment slot." },
  { icon: "fa-solid fa-user-doctor", title: "Consult", description: "Meet our experienced medical team." },
  { icon: "fa-solid fa-file-medical", title: "Diagnosis", description: "Receive accurate reports and advice." },
  { icon: "fa-solid fa-heart", title: "Follow-up", description: "Ongoing care for better health." },
];

export default async function ServicesPage() {
  let services: Service[] = [];
  let error: string | undefined;

  try {
    services = await getServices();
  } catch (caught) {
    error = toErrorMessage(caught);
  }

  return (
    <>
      <Hero>
        <HeroContent>
          <div className="w-full lg:max-w-150">
            <span className="text-[0.78rem] font-bold tracking-[1px] text-pink uppercase sm:text-base">
              Our Services
            </span>
            <h1 className="my-3 font-display text-[1.95rem] leading-tight font-bold text-ink sm:text-[2.3rem] md:my-4 lg:text-[2.9rem]">
              Comprehensive Healthcare Under One Roof
            </h1>
            <p className="mx-auto mb-7 max-w-140 lg:mx-0">
              From preventive health checkups to specialized consultations, Wellness Health Point
              offers expert medical care with modern facilities, experienced doctors, and
              compassionate treatment for patients of every age.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:flex-row lg:justify-start">
              <ButtonLink href="/appointment">Book Appointment</ButtonLink>
              <ButtonLink href="#services" variant="secondary">
                View Services
              </ButtonLink>
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/images/services.png"
              alt="Healthcare services at Wellness Health Point"
              width={620}
              height={480}
              priority
              className="mx-auto h-auto max-w-full rounded-card lg:max-w-120"
            />
          </div>
        </HeroContent>
      </Hero>

      <Section id="services">
        <Container>
          <SectionTitle
            eyebrow="Our Specialities"
            title="Healthcare Services"
            description="Quality care delivered by experienced professionals."
          />

          {error ? (
            <Alert variant="error">{error}</Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </Container>
      </Section>

      <Section className="bg-mist">
        <Container>
          <SectionTitle eyebrow="Our Process" title="Getting Care Is Simple" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {PROCESS.map((step) => (
              <FeatureCard key={step.title} {...step} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-linear-[135deg,#0a6ebd,#0c4f84] text-white">
        <Container className="flex flex-col items-center gap-6.5 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="font-display text-[1.65rem] font-bold sm:text-[1.9rem] md:text-[2.3rem]">
              Need Expert Medical Care?
            </h2>
            <p>Book an appointment today with our specialists.</p>
          </div>
          <ButtonLink href="/appointment" variant="onDark">
            Book Appointment
          </ButtonLink>
        </Container>
      </Section>
    </>
  );
}
