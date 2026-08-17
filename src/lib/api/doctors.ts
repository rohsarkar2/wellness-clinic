import { ApiError } from "@/lib/api/client";
import { doctors, findDoctor } from "@/lib/data/doctors";
import type { Doctor } from "@/lib/types";

/**
 * Doctors are seed data, not database rows — they change with a deploy, and
 * their photos live in `public/images`. These stay async so the pages that
 * await them do not need to change if they ever move to Supabase.
 */

export async function getDoctors(): Promise<Doctor[]> {
  return doctors;
}

export async function getDoctorById(id: string): Promise<Doctor> {
  const doctor = findDoctor(id);
  if (!doctor) throw new ApiError("Doctor not found.", 404);
  return doctor;
}
