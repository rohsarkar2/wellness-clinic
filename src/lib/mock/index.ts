import { doctors, findDoctor } from "@/lib/data/doctors";
import { services } from "@/lib/data/services";
import { ApiError } from "@/lib/api/client";
import type {
  Appointment,
  AppointmentPayload,
  AvailabilityResponse,
  ContactPayload,
  Doctor,
  Service,
  TimeSlot,
} from "@/lib/types";
import { formatTime, parseDateInput, toDateInput, weekdayName } from "@/lib/utils/date";

/**
 * Front-end mock layer.
 *
 * Every function here mirrors an endpoint the Node.js + Supabase backend will
 * expose. The service modules in `src/lib/api` call these only while
 * NEXT_PUBLIC_API_URL is unset, so wiring up the real API is a one-line change
 * and no component has to be touched.
 */

const CLINIC_OPEN_HOUR = 9;
const CLINIC_CLOSE_HOUR = 20;
const SLOT_MINUTES = 30;
const BOOKING_WINDOW_DAYS = 60;

/** Bookings made during this browser session, so a slot taken twice reads as booked. */
const sessionBookings = new Set<string>();

/** Small delay so loading states are exercised the same way a real API would. */
function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function generateTimes(): string[] {
  const times: string[] = [];
  for (let hour = CLINIC_OPEN_HOUR; hour < CLINIC_CLOSE_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_MINUTES) {
      times.push(`${`${hour}`.padStart(2, "0")}:${`${minute}`.padStart(2, "0")}`);
    }
  }
  return times;
}

/**
 * Deterministic stand-in for slots other patients have already taken, so the
 * disabled-slot UI is visible before real data exists. Same doctor + date
 * always produces the same pattern.
 */
function isPreBooked(doctorId: string, date: string, time: string): boolean {
  const seed = `${doctorId}|${date}|${time}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % 10 < 3;
}

export function mockGetDoctors(): Promise<Doctor[]> {
  return delay(doctors);
}

export async function mockGetDoctor(id: string): Promise<Doctor> {
  const doctor = findDoctor(id);
  if (!doctor) throw new ApiError("Doctor not found.", 404);
  return delay(doctor);
}

export function mockGetServices(): Promise<Service[]> {
  return delay(services);
}

export function mockGetAvailability(doctorId: string, date: string): Promise<AvailabilityResponse> {
  const doctor = findDoctor(doctorId);
  if (!doctor) return Promise.reject(new ApiError("Doctor not found.", 404));

  const empty = (notice: string): Promise<AvailabilityResponse> =>
    delay({ doctorId, date, slots: [], notice });

  if (!parseDateInput(date)) return empty("Please choose a valid date.");

  const now = new Date();
  const todayStr = toDateInput(now);

  if (date < todayStr) {
    return empty("That date has already passed. Please choose an upcoming date.");
  }

  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + BOOKING_WINDOW_DAYS);
  if (date > toDateInput(maxDate)) {
    return empty(`Appointments can be booked up to ${BOOKING_WINDOW_DAYS} days in advance.`);
  }

  const day = weekdayName(date);
  if (day === "Sunday") {
    return empty("The clinic is closed on Sundays (emergency cases only).");
  }
  if (day && !doctor.availableDays.includes(day)) {
    return empty(
      `${doctor.name} does not consult on ${day}s. Available: ${doctor.availableDays.join(", ")}.`,
    );
  }

  const isToday = date === todayStr;
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const slots = generateTimes().map<TimeSlot>((time) => {
    const [hour, minute] = time.split(":").map(Number);
    const isPast = isToday && hour * 60 + minute <= minutesNow;
    const available =
      !isPast &&
      !sessionBookings.has(`${doctorId}|${date}|${time}`) &&
      !isPreBooked(doctorId, date, time);
    return { time, label: formatTime(time), available };
  });

  const notice =
    isToday && slots.every((slot) => !slot.available)
      ? "No slots left today. Please try the next available date."
      : undefined;

  return delay({ doctorId, date, slots, notice });
}

export async function mockCreateAppointment(payload: AppointmentPayload): Promise<Appointment> {
  const doctor = findDoctor(payload.doctorId);
  if (!doctor) throw new ApiError("The selected doctor is no longer available.", 404);

  const { slots, notice } = await mockGetAvailability(payload.doctorId, payload.date);
  if (slots.length === 0) throw new ApiError(notice ?? "No slots available on that date.", 400);

  const slot = slots.find((s) => s.time === payload.time);
  if (!slot) throw new ApiError("That time is outside our clinic hours.", 400);
  if (!slot.available) {
    throw new ApiError("Sorry, that slot has just been taken. Please pick another time.", 409);
  }

  sessionBookings.add(`${payload.doctorId}|${payload.date}|${payload.time}`);

  return delay({
    ...payload,
    id: `apt_${Date.now().toString(36)}`,
    reference: `WHP-${Date.now().toString(36).toUpperCase().slice(-6)}`,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
    doctorName: doctor.name,
  });
}

export function mockSendContact(payload: ContactPayload): Promise<{ message: string }> {
  console.info("[mock] enquiry captured", { name: payload.name, phone: payload.phone });
  return delay({
    message: "Thanks for reaching out — our team will call you shortly.",
  });
}
