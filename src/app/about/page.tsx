import type { Metadata } from "next";
import Image from "next/image";

import Hero, { HeroContent } from "@/components/layout/Hero";
import MapSection from "@/components/layout/MapSection";
import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "Wellness Health Point is dedicated to trusted healthcare through experienced doctors, modern technology and compassionate patient care.",
};

const HIGHLIGHTS = [
  {
    icon: "fa-solid fa-hospital",
    title: "Modern Facility",
    description: "Well-equipped clinic designed for patient comfort.",
  },
  {
    icon: "fa-solid fa-user-doctor",
    title: "Expert Doctors",
    description: "Experienced specialists across multiple departments.",
  },
  {
    icon: "fa-solid fa-microscope",
    title: "Advanced Diagnostics",
    description: "Reliable testing and accurate reports.",
  },
  {
    icon: "fa-solid fa-hand-holding-heart",
    title: "Compassionate Care",
    description: "Personalized treatment with a patient-first approach.",
  },
];

const VALUES = [
  {
    title: "Our Mission",
    description: "To provide accessible, affordable, and high-quality healthcare for every patient.",
  },
  {
    title: "Our Vision",
    description:
      "To become a trusted healthcare destination through innovation, excellence, and compassion.",
  },
  {
    title: "Our Promise",
    description:
      "Delivering ethical, patient-centered healthcare with professionalism and integrity.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Hero>
        <HeroContent>
          <div className="w-full lg:max-w-150">
            <span className="text-[0.78rem] font-bold tracking-[1px] text-pink uppercase sm:text-base">
              About Us
            </span>
            <h1 className="my-3 font-display text-[1.95rem] leading-tight font-bold text-ink sm:text-[2.3rem] md:my-4 lg:text-[2.9rem]">
              Committed To Better Healthcare Every Day
            </h1>
            <p className="mx-auto mb-7 max-w-140 lg:mx-0">
              {site.name} is dedicated to delivering trusted healthcare through experienced doctors,
              modern technology, and compassionate patient care.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 md:flex-row lg:justify-start">
              <ButtonLink href="/contact">Contact Us</ButtonLink>
              <ButtonLink href="/doctors" variant="secondary">
                Meet the Team
              </ButtonLink>
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/images/abouts.png"
              alt="Inside the Wellness Health Point clinic"
              width={620}
              height={480}
              priority
              className="mx-auto h-auto max-w-full rounded-card lg:max-w-120"
            />
          </div>
        </HeroContent>
      </Hero>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="Our Story"
            title="Who We Are"
            description="A neighbourhood clinic built around one idea — that good healthcare should be close by, affordable and genuinely caring."
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {HIGHLIGHTS.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-mist">
        <Container>
          <SectionTitle eyebrow="Mission & Vision" title="Our Core Values" />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {VALUES.map((value) => (
              <article
                key={value.title}
                className="rounded-card bg-white p-5 text-center shadow-card transition duration-300 hover:-translate-y-2 sm:p-6"
              >
                <h3 className="my-3 font-display text-[1.2rem] font-semibold text-ink">
                  {value.title}
                </h3>
                <p>{value.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="pb-0">
        <Container>
          <SectionTitle
            eyebrow="Find Us"
            title="Visit The Clinic"
            description={`${site.address} · ${site.hours}`}
          />
        </Container>
      </Section>

      <MapSection />
    </>
  );
}
