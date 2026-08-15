import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { ApiError } from "@/lib/api/client";
import { getDoctorById, getDoctors } from "@/lib/api/doctors";
import { site } from "@/lib/site";
import type { Doctor } from "@/lib/types";

/** Pre-renders a static page per doctor; new ones are rendered on demand. */
export async function generateStaticParams() {
  try {
    const doctors = await getDoctors();
    return doctors.map((doctor) => ({ id: doctor.id }));
  } catch {
    return [];
  }
}

async function loadDoctor(id: string): Promise<Doctor> {
  try {
    return await getDoctorById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
}

export async function generateMetadata(
  props: PageProps<"/doctors/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;

  try {
    const doctor = await getDoctorById(id);
    return {
      title: doctor.name,
      description: `${doctor.name} — ${doctor.speciality} at ${site.name}. ${doctor.experienceYears} years of experience.`,
    };
  } catch {
    return { title: "Doctor" };
  }
}

const SUBHEADING =
  "mt-6.5 mb-3 font-display text-[1.2rem] font-semibold text-ink";
const PILL =
  "rounded-full bg-mist px-4 py-1.75 text-[0.9rem] font-semibold text-primary";

export default async function DoctorDetailPage(
  props: PageProps<"/doctors/[id]">,
) {
  const { id } = await props.params;
  const doctor = await loadDoctor(id);

  const meta = [
    {
      icon: "fa-solid fa-briefcase-medical",
      value: `${doctor.experienceYears} years`,
      label: "Experience",
    },
    {
      icon: "fa-solid fa-hospital",
      value: doctor.department,
      label: "Department",
    },
    {
      icon: "fa-solid fa-indian-rupee-sign",
      value: `₹${doctor.consultationFee}`,
      label: "Consultation",
    },
  ];

  return (
    <Section>
      <Container>
        <nav
          aria-label="Breadcrumb"
          className="mb-4.5 flex flex-wrap items-center gap-2 text-[0.9rem] text-[#93a1b0] md:mb-6"
        >
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <Link href="/doctors" className="hover:text-primary">
            Doctors
          </Link>
          <span aria-hidden="true">/</span>
          <span>{doctor.name}</span>
        </nav>

        <div className="grid items-start gap-7.5 lg:grid-cols-[320px_1fr] lg:gap-12.5">
          <aside className="mx-auto max-w-80 rounded-card bg-white p-6 text-center shadow-card lg:mx-0 lg:max-w-none">
            <Image
              src={doctor.image}
              alt={doctor.name}
              width={340}
              height={340}
              sizes="(max-width: 1100px) 320px, 272px"
              priority
              className="mb-5 aspect-square w-full rounded-card object-cover"
            />
            <ButtonLink
              href={`/appointment?doctor=${doctor.id}`}
              className="mx-auto"
            >
              <i className="fa-solid fa-calendar-check" aria-hidden="true" />
              Book Appointment
            </ButtonLink>
          </aside>

          <div>
            <h1 className="mb-1.5 font-display text-[1.65rem] font-bold text-ink sm:text-[1.9rem] lg:text-[2.4rem]">
              {doctor.name}
            </h1>
            <p className="text-[1.1rem] font-semibold text-primary">
              {doctor.speciality}
            </p>

            <div className="my-6 grid gap-4.5 border-y border-[#eef2f7] py-5 sm:grid-cols-3 md:flex md:flex-wrap md:gap-7.5">
              {meta.map((item) => (
                <div key={item.label} className="flex items-center gap-2.5">
                  <i
                    className={`text-[1.3rem] text-primary ${item.icon}`}
                    aria-hidden="true"
                  />
                  <span>
                    <strong className="block text-ink">{item.value}</strong>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <h3 className={SUBHEADING}>About</h3>
            <p>{doctor.description}</p>

            <h3 className={SUBHEADING}>Qualifications</h3>
            <ul className="flex flex-wrap gap-2.5">
              {doctor.qualifications.map((qualification) => (
                <li key={qualification} className={PILL}>
                  {qualification}
                </li>
              ))}
            </ul>

            <h3 className={SUBHEADING}>Available Days</h3>
            <ul className="flex flex-wrap gap-2.5">
              {doctor.availableDays.map((day) => (
                <li key={day} className={PILL}>
                  {day}
                </li>
              ))}
            </ul>

            <h3 className={SUBHEADING}>Languages</h3>
            <ul className="flex flex-wrap gap-2.5">
              {doctor.languages.map((language) => (
                <li key={language} className={PILL}>
                  {language}
                </li>
              ))}
            </ul>

            <div className="mt-7.5 flex flex-wrap items-center justify-center gap-3.5 md:justify-start">
              <ButtonLink
                href={`/appointment?doctor=${doctor.id}`}
                block={false}
              >
                Book with {doctor.name.split(" ")[1] ?? doctor.name}
              </ButtonLink>
              <ButtonLink href="/doctors" variant="secondary" block={false}>
                All Doctors
              </ButtonLink>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
