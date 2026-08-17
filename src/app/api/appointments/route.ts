import { after } from "next/server";

import { ApiError } from "@/lib/api/client";
import { findDoctor } from "@/lib/data/doctors";
import { getAvailability } from "@/lib/server/availability";
import { notifyClinicOfAppointment } from "@/lib/server/email";
import { asString, errorResponse, jsonError } from "@/lib/server/http";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Appointment, AppointmentPayload } from "@/lib/types";
import { hasErrors, validateAppointment } from "@/lib/validation";

/** Postgres unique_violation — raised by the partial index on (doctor, date, time). */
const UNIQUE_VIOLATION = "23505";

const ROW_COLUMNS =
  "id, reference, doctor_id, doctor_name, slot_date, slot_time, patient_name, email, phone, reason, status, created_at";

const SLOT_TAKEN = "Sorry, that slot has just been taken. Please pick another time.";

/** POST /api/appointments — books a slot. */
export async function POST(request: Request) {
  let payload: AppointmentPayload;
  try {
    payload = readPayload(await request.json());
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  // The form validates as well, but a request can arrive from anywhere.
  const errors = validateAppointment(payload);
  if (hasErrors(errors)) {
    return jsonError(Object.values(errors).find(Boolean) ?? "Please check the form.", 400);
  }

  try {
    const doctor = findDoctor(payload.doctorId);
    if (!doctor) throw new ApiError("The selected doctor is no longer available.", 404);

    const { slots, notice } = await getAvailability(payload.doctorId, payload.date);
    if (slots.length === 0) throw new ApiError(notice ?? "No slots available on that date.", 400);

    const slot = slots.find((candidate) => candidate.time === payload.time);
    if (!slot) throw new ApiError("That time is outside our clinic hours.", 400);
    if (!slot.available) throw new ApiError(SLOT_TAKEN, 409);

    const { data, error } = await supabaseAdmin()
      .from("appointments")
      .insert({
        doctor_id: doctor.id,
        // Taken from seed data, not from the request — the client does send a
        // doctorName, but it is display state and must not be trusted.
        doctor_name: doctor.name,
        slot_date: payload.date,
        slot_time: payload.time,
        patient_name: payload.patientName,
        email: payload.email,
        phone: payload.phone,
        reason: payload.reason,
      })
      .select(ROW_COLUMNS)
      .single();

    if (error) {
      // Two patients can clear the availability check above at the same moment;
      // the unique index is what actually decides who gets the slot.
      if (error.code === UNIQUE_VIOLATION) throw new ApiError(SLOT_TAKEN, 409);
      console.error("Failed to insert appointment", error);
      throw new ApiError("We could not save your appointment. Please try again.", 502);
    }

    const appointment = toAppointment(data);

    // The booking is saved; the notification must not hold up the patient's
    // response or fail the request if the mail server is down. `after` keeps
    // the invocation alive until the send settles.
    after(() => notifyClinicOfAppointment(appointment));

    return Response.json(appointment, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Could not create the appointment.");
  }
}

function readPayload(body: unknown): AppointmentPayload {
  const raw = (body ?? {}) as Record<string, unknown>;
  return {
    doctorId: asString(raw.doctorId),
    doctorName: asString(raw.doctorName),
    date: asString(raw.date),
    time: asString(raw.time),
    patientName: asString(raw.patientName),
    email: asString(raw.email),
    phone: asString(raw.phone),
    reason: asString(raw.reason),
  };
}

function toAppointment(row: Record<string, unknown>): Appointment {
  return {
    id: row.id as string,
    reference: row.reference as string,
    doctorId: row.doctor_id as string,
    doctorName: row.doctor_name as string,
    date: row.slot_date as string,
    time: row.slot_time as string,
    patientName: row.patient_name as string,
    email: row.email as string,
    phone: row.phone as string,
    reason: row.reason as string,
    status: row.status as Appointment["status"],
    createdAt: row.created_at as string,
  };
}
