import { apiRequest, hasBackend } from "@/lib/api/client";
import {
  mockCreateAppointment,
  mockGetAvailability,
  mockSendContact,
} from "@/lib/mock";
import type {
  Appointment,
  AppointmentPayload,
  AvailabilityResponse,
  ContactPayload,
} from "@/lib/types";

/** Time slots for a doctor on a date; booked and past slots come back unavailable. */
export function getAvailability(doctorId: string, date: string): Promise<AvailabilityResponse> {
  if (!hasBackend()) return mockGetAvailability(doctorId, date);

  const query = new URLSearchParams({ doctorId, date });
  return apiRequest<AvailabilityResponse>(`/appointments/availability?${query}`, {
    cache: "no-store",
  });
}

export function createAppointment(payload: AppointmentPayload): Promise<Appointment> {
  if (!hasBackend()) return mockCreateAppointment(payload);
  return apiRequest<Appointment>("/appointments", { method: "POST", body: payload });
}

export function sendContactEnquiry(payload: ContactPayload): Promise<{ message: string }> {
  if (!hasBackend()) return mockSendContact(payload);
  return apiRequest<{ message: string }>("/contact", { method: "POST", body: payload });
}
