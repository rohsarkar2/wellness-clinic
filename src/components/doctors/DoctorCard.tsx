import Image from "next/image";
import Link from "next/link";

import { ButtonLink } from "@/components/ui/Button";
import type { Doctor } from "@/lib/types";

interface DoctorCardProps {
  doctor: Doctor;
  /** Adds a direct "Book" action — used on /doctors, omitted on the home preview. */
  showBooking?: boolean;
  priority?: boolean;
}

/**
 * Five rows — photo, name, speciality, tagline, actions — so that as a subgrid
 * (see DoctorGrid) every card's rows line up with its neighbours'.
 */
export default function DoctorCard({
  doctor,
  showBooking = false,
  priority = false,
}: DoctorCardProps) {
  return (
    <article
      data-card="doctor"
      className="rounded-card bg-white p-5 text-center shadow-card transition duration-300 hover:-translate-y-2 sm:p-6 md:grid md:row-span-5 md:grid-rows-subgrid md:gap-y-0"
    >
      <Link
        href={`/doctors/${doctor.id}`}
        aria-label={`View ${doctor.name}'s profile`}
      >
        <Image
          src={doctor.image}
          alt={doctor.name}
          width={150}
          height={150}
          sizes="150px"
          priority={priority}
          className="mx-auto mb-5 size-37.5 rounded-full object-cover"
        />
      </Link>

      <h3 className="mt-3 mb-1.5 font-display text-[1.2rem] leading-snug font-semibold text-ink">
        {doctor.name}
      </h3>

      <p className="font-semibold text-primary md:leading-normal">
        {doctor.speciality}
      </p>

      <p className="md:leading-normal">{doctor.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 self-end">
        <Link
          href={`/doctors/${doctor.id}`}
          className="inline-flex min-h-11 items-center px-1.5 font-semibold text-primary hover:underline"
        >
          View Profile
        </Link>
        {/* {showBooking ? (
          <ButtonLink
            href={`/appointment?doctor=${doctor.id}`}
            size="md"
            block={false}
          >
            Book
          </ButtonLink>
        ) : null} */}
      </div>
    </article>
  );
}
