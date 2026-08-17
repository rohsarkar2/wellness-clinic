import { ApiError } from "@/lib/api/client";
import {
  BOOKING_WINDOW_DAYS,
  CLINIC_CLOSE_HOUR,
  CLINIC_OPEN_HOUR,
  CLINIC_TIME_ZONE,
  SLOT_MINUTES,
} from "@/lib/booking";
import { findDoctor } from "@/lib/data/doctors";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { AvailabilityResponse, TimeSlot } from "@/lib/types";
import { formatTime, parseDateInput, toDateInput, weekdayName } from "@/lib/utils/date";

/**
 * Slot availability, computed server-side.
 *
 * The rules in `src/lib/booking.ts` are enforced here — opening hours, closed
 * Sundays, per-doctor days, how far ahead you may book — rather than in the
 * form, so a request that bypasses the UI is held to the same limits.
 */

const CLINIC_CLOCK = new Intl.DateTimeFormat("en-CA", {
  timeZone: CLINIC_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Current date ("YYYY-MM-DD") and minutes-since-midnight at the clinic. */
function clinicNow(): { date: string; minutes: number } {
  const parts = CLINIC_CLOCK.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
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

function addDaysTo(date: string, days: number): string {
  const parsed = parseDateInput(date);
  if (!parsed) return date;
  parsed.setDate(parsed.getDate() + days);
  return toDateInput(parsed);
}

/** Times already taken for a doctor on a date. Cancelled bookings free the slot. */
async function getBookedTimes(doctorId: string, date: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from("appointments")
    .select("slot_time")
    .eq("doctor_id", doctorId)
    .eq("slot_date", date)
    .neq("status", "cancelled");

  if (error) {
    console.error("Failed to load booked slots", error);
    throw new ApiError("Could not check availability. Please try again.", 502);
  }

  return new Set((data ?? []).map((row) => row.slot_time as string));
}

export async function getAvailability(
  doctorId: string,
  date: string,
): Promise<AvailabilityResponse> {
  const doctor = findDoctor(doctorId);
  if (!doctor) throw new ApiError("Doctor not found.", 404);

  const empty = (notice: string): AvailabilityResponse => ({
    doctorId,
    date,
    slots: [],
    notice,
  });

  if (!parseDateInput(date)) return empty("Please choose a valid date.");

  const now = clinicNow();

  if (date < now.date) {
    return empty("That date has already passed. Please choose an upcoming date.");
  }
  if (date > addDaysTo(now.date, BOOKING_WINDOW_DAYS)) {
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

  const booked = await getBookedTimes(doctorId, date);
  const isToday = date === now.date;

  const slots = generateTimes().map<TimeSlot>((time) => {
    const [hour, minute] = time.split(":").map(Number);
    const isPast = isToday && hour * 60 + minute <= now.minutes;
    return { time, label: formatTime(time), available: !isPast && !booked.has(time) };
  });

  const notice = slots.every((slot) => !slot.available)
    ? isToday
      ? "No slots left today. Please try the next available date."
      : "Every slot on this date is booked. Please try another date."
    : undefined;

  return { doctorId, date, slots, notice };
}
