import { apiRequest } from "@/lib/api/client";
import type {
  Appointment,
  AppointmentPayload,
  AvailabilityResponse,
  ContactPayload,
} from "@/lib/types";

/**
 * The two form endpoints, served by the route handlers in `src/app/api`.
 * Both callers are client components, so the relative base URL resolves.
 */

/** Time slots for a doctor on a date; booked and past slots come back unavailable. */
export function getAvailability(doctorId: string, date: string): Promise<AvailabilityResponse> {
  const query = new URLSearchParams({ doctorId, date });
  return apiRequest<AvailabilityResponse>(`/appointments/availability?${query}`, {
    cache: "no-store",
  });
}

export function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  return apiRequest<Appointment>("/appointments", { method: "POST", body: payload });
}

export function sendContactEnquiry(payload: ContactPayload): Promise<{ message: string }> {
  return apiRequest<{ message: string }>("/contact", { method: "POST", body: payload });
}
