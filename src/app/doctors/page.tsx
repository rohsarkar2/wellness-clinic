import type { Metadata } from "next";
import Image from "next/image";

import DoctorGrid from "@/components/doctors/DoctorGrid";
import Hero, { HeroContent } from "@/components/layout/Hero";
import Alert from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import { EmptyState } from "@/components/ui/Loading";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { toErrorMessage } from "@/lib/api/client";
import { getDoctors } from "@/lib/api/doctors";
import type { Doctor } from "@/lib/types";

export const metadata: Metadata = {
  title: "Doctors",
  description:
    "Meet the experienced specialists at Wellness Health Point — paediatrics, gynaecology, ENT, surgery and diabetology.",
};

const TEAM_VALUES = [
  {
    icon: "fa-solid fa-user-doctor",
    title: "Qualified Experts",
    description: "Highly trained specialists.",
  },
  {
    icon: "fa-solid fa-award",
    title: "Trusted Care",
    description: "Patient-first approach.",
  },
  {
    icon: "fa-solid fa-microscope",
    title: "Modern Diagnostics",
    description: "Advanced medical support.",
  },
  {
    icon: "fa-solid fa-heart",
    title: "Compassion",
    description: "Personalized treatment plans.",
  },
];

export default async function DoctorsPage() {
  let doctors: Doctor[] = [];
  let error: string | undefined;

  try {
    doctors = await getDoctors();
  } catch (caught) {
    error = toErrorMessage(caught);
  }

  return (
    <>
      <Hero>
        <HeroContent>
          <div className="w-full lg:max-w-150">
            <span className="text-[0.78rem] font-bold tracking-[1px] text-pink uppercase sm:text-base">
              Our Doctors
            </span>
            <h1 className="my-3 font-display text-[1.95rem] leading-tight font-bold text-ink sm:text-[2.3rem] md:my-4 lg:text-[2.9rem]">
              Meet Our Experienced Medical Team
            </h1>
            <p className="mx-auto mb-7 max-w-140 lg:mx-0">
              Our specialists combine experience, compassion and modern medicine
              to deliver exceptional patient care.
            </p>
            <div className="flex justify-center lg:justify-start">
              <ButtonLink href="/appointment">Book Consultation</ButtonLink>
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/images/collage.png"
              alt="The Wellness Health Point medical team"
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
            eyebrow="Providers"
            title="Our Specialists"
            description="Choose a doctor to view their full profile, or book directly from the card."
          />

          {error ? (
            <Alert variant="error">
              {error} Please refresh the page — if the problem continues, call
              us on +91 6291664625.
            </Alert>
          ) : doctors.length === 0 ? (
            <EmptyState
              icon="fa-solid fa-user-doctor"
              message="No doctors are listed right now. Please check back shortly."
            />
          ) : (
            <DoctorGrid doctors={doctors} showBooking />
          )}
        </Container>
      </Section>

      <Section className="bg-mist">
        <Container>
          <SectionTitle
            eyebrow="Why Our Team"
            title="Dedicated To Better Healthcare"
          />
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {TEAM_VALUES.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
