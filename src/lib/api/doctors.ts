import { apiRequest, hasBackend } from "@/lib/api/client";
import { mockGetDoctor, mockGetDoctors } from "@/lib/mock";
import type { Doctor } from "@/lib/types";

export function getDoctors(): Promise<Doctor[]> {
  if (!hasBackend()) return mockGetDoctors();
  return apiRequest<Doctor[]>("/doctors", { next: { revalidate: 300 } });
}

export function getDoctorById(id: string): Promise<Doctor> {
  if (!hasBackend()) return mockGetDoctor(id);
  return apiRequest<Doctor>(`/doctors/${encodeURIComponent(id)}`, {
    next: { revalidate: 300 },
  });
}
