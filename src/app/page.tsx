import Image from "next/image";

import EnquiryForm from "@/components/contact/EnquiryForm";
import DoctorGrid from "@/components/doctors/DoctorGrid";
import Hero, { HeroContent } from "@/components/layout/Hero";
import ServiceCard from "@/components/services/ServiceCard";
import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import FeatureCard from "@/components/ui/FeatureCard";
import Reveal, { RevealGroup } from "@/components/ui/Reveal";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { getDoctors } from "@/lib/api/doctors";
import { getServices } from "@/lib/api/services";
import { OG_IMAGES, pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";

/** No `title`, so the landing page keeps the layout's untemplated default. */
export const metadata = pageMetadata({
  description: site.description,
  path: "/",
  image: { ...OG_IMAGES.home, alt: `${site.name} — ${site.tagline}` },
});

const HERO_FEATURES = [
  {
    icon: "fa-solid fa-user-doctor",
    title: "Expert Doctors",
    description: "Experienced Specialists",
  },
  {
    icon: "fa-solid fa-heart-pulse",
    title: "Advanced Care",
    description: "Modern Equipment",
  },
  {
    icon: "fa-solid fa-clock",
    title: "Quick Support",
    description: "Easy Appointments",
  },
];

const STATS = [
  { value: "10,000+", label: "Happy Patients" },
  { value: "25+", label: "Doctors" },
  { value: "5+", label: "Departments" },
  { value: "4.9", suffix: "/5", label: "Patient Rating", rating: 4.9 },
];

const WHY_US = [
  {
    icon: "fa-solid fa-user-doctor",
    title: "Experienced Doctors",
    description: "Qualified specialists providing trusted care.",
  },
  {
    icon: "fa-solid fa-microscope",
    title: "Advanced Technology",
    description: "Modern equipment and diagnostics.",
  },
  {
    icon: "fa-solid fa-heart",
    title: "Patient-Centered Care",
    description: "Compassion at every step.",
  },
  {
    icon: "fa-solid fa-calendar-check",
    title: "Easy Appointments",
    description: "Simple booking and timely consultations.",
  },
];

export default async function HomePage() {
  const [doctors, services] = await Promise.all([getDoctors(), getServices()]);

  return (
    <>
      <Hero className="lg:min-h-212.5">
        <HeroContent>
          <div className="w-full lg:max-w-150">
            <span className="text-[0.78rem] font-bold tracking-[1px] text-pink uppercase sm:text-base">
              Your health. Our priority.
            </span>

            <h1 className="my-3 font-display text-[1.95rem] leading-tight font-bold text-ink sm:text-[2.3rem] md:my-4 lg:text-[2.9rem] xl:text-[3.3rem] xl:leading-[1.1]">
              Compassionate Care
              <br />
              For A Healthier
              <br />
              Tomorrow
            </h1>

            <p className="mx-auto mb-7 max-w-140 lg:mx-0">
              Delivering quality healthcare with experienced doctors, modern
              diagnostics and patient-focused treatment.
            </p>

            <div className="mb-9 flex flex-col items-center justify-center gap-3 sm:gap-4 md:flex-row lg:mb-11 lg:justify-start">
              <ButtonLink href="/appointment">Book Appointment</ButtonLink>
              <ButtonLink href="/services" variant="secondary">
                Our Services
              </ButtonLink>
            </div>

            {/* On mount rather than on scroll — this sits above the fold. The
                headline and CTAs above are left alone so the largest paint
                isn't waiting on an animation. */}
            <RevealGroup className="grid gap-6 md:grid-cols-3" onMount>
              {HERO_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-card bg-white p-4.5 text-center shadow-card"
                >
                  <i
                    className={`mb-3.75 text-[2rem] text-primary ${feature.icon}`}
                    aria-hidden="true"
                  />
                  <h4 className="mb-1.5 text-ink">{feature.title}</h4>
                  <p className="text-[0.9rem]">{feature.description}</p>
                </div>
              ))}
            </RevealGroup>
          </div>

          {/* Decorative only — hidden on phones where it is just noise. */}
          <Image
            src="/images/heroimg.png"
            alt=""
            aria-hidden="true"
            width={900}
            height={1200}
            priority
            className="pointer-events-none absolute bottom-0 hidden h-[88%] w-auto -translate-x-1/2 object-contain opacity-[0.18] mask-[linear-gradient(to_left,transparent_0%,rgb(0_0_0/0.8)_18%,black_35%)] md:left-[52%] md:block lg:-right-10 lg:left-auto lg:h-[110%] lg:translate-x-0 lg:opacity-35 lg:mask-[linear-gradient(to_left,black_65%,rgb(0_0_0/0.6)_80%,transparent_100%)]"
          />

          {/* `w-full` because the reveal wrapper, not the card, is now the
              grid item HeroContent lays out. */}
          <Reveal className="w-full" delay={0.15} onMount>
            <EnquiryForm subtitle="Fill in your details and we'll contact you shortly." />
          </Reveal>
        </HeroContent>

        <Reveal>
          <Container className="relative z-3 mt-10 grid gap-px overflow-hidden rounded-[22px] bg-[#edf2f7] shadow-card sm:grid-cols-2 lg:mt-12.5 xl:grid-cols-4">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white px-3 py-5.5 text-center lg:p-7"
              >
                <h3 className="text-[2rem] text-primary">
                  {stat.value}
                  {stat.suffix ? (
                    <span className="text-[0.6em]">{stat.suffix}</span>
                  ) : null}
                </h3>

                <span className="text-[#666]">{stat.label}</span>
              </div>
            ))}
          </Container>
        </Reveal>
      </Hero>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="OUR MEDICAL TEAM"
            title="Meet Our Providers"
            description="Our experienced specialists are committed to providing compassionate, personalized and evidence-based healthcare."
          />
          <DoctorGrid doctors={doctors} />
          <Reveal className="mt-10 text-center">
            <ButtonLink href="/doctors" variant="secondary">
              View All Doctors
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-mist">
        <Container>
          <SectionTitle eyebrow="WHAT WE OFFER" title="Our Services" />
          <RevealGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </RevealGroup>
          <Reveal className="mt-10 text-center">
            <ButtonLink href="/services" variant="secondary">
              Explore All Services
            </ButtonLink>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container>
          <SectionTitle
            eyebrow="WHY CHOOSE US"
            title="Why Choose Wellness Health Point?"
          />
          <RevealGroup className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {WHY_US.map((item) => (
              <FeatureCard key={item.title} {...item} />
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <Section className="bg-linear-[135deg,#0a6ebd,#0c4f84] text-white">
        <Reveal>
          <Container className="flex flex-col items-center gap-6.5 text-center lg:flex-row lg:justify-between lg:gap-7.5 lg:text-left">
            <div>
              <h2 className="font-display text-[1.65rem] font-bold sm:text-[1.9rem] md:text-[2.3rem]">
                Your Health Is Our Commitment
              </h2>
              <p>
                Book your appointment today and take the first step toward
                better health.
              </p>
            </div>
            <ButtonLink href="/appointment" variant="onDark">
              Book Appointment
            </ButtonLink>
          </Container>
        </Reveal>
      </Section>
    </>
  );
}
