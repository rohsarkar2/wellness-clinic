import DoctorCard from "@/components/doctors/DoctorCard";
import type { Doctor } from "@/lib/types";

/**
 * From `md` up the cards are subgrids spanning five parent rows, so the name,
 * speciality, tagline and action row start at the same height across a row —
 * no matter how many lines each doctor's text runs to. Below `md` there is one
 * card per row, so there is nothing to align against.
 */
export default function DoctorGrid({
  doctors,
  showBooking = false,
}: {
  doctors: Doctor[];
  showBooking?: boolean;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
      {doctors.map((doctor, index) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          showBooking={showBooking}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
