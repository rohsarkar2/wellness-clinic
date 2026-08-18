import { after } from "next/server";

import { findDoctor } from "@/lib/data/doctors";
import { notifyClinic } from "@/lib/server/email";
import { asString, errorResponse, jsonError } from "@/lib/server/http";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Submission, SubmissionPayload } from "@/lib/types";
import { hasErrors, validateSubmission } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: SubmissionPayload;
  try {
    payload = readPayload(await request.json());
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const wantsDoctor = payload.doctorId !== "";

  // The forms validate as well, but a request can arrive from anywhere.
  const errors = validateSubmission(payload, { requireDoctor: wantsDoctor });
  if (hasErrors(errors)) {
    return jsonError(
      Object.values(errors).find(Boolean) ?? "Please check the form.",
      400,
    );
  }

  try {
    const doctor = wantsDoctor ? findDoctor(payload.doctorId) : null;
    if (wantsDoctor && !doctor) {
      return jsonError("The selected doctor is no longer available.", 404);
    }

    const { data, error } = await supabaseAdmin()
      .from("appointments")
      .insert({
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        doctor: doctor?.name ?? null,
        department: doctor?.department ?? payload.department,
        reason: payload.reason,
      })
      .select("id, name, email, phone, doctor, department, reason, created_at")
      .single();

    if (error) {
      console.error("Failed to insert submission", error);
      return jsonError(
        "We could not send your details. Please try again.",
        502,
      );
    }

    after(() => notifyClinic(toSubmission(data)));

    return Response.json(
      {
        message: doctor
          ? "Thanks — your appointment request has been received. We'll call you shortly to confirm."
          : "Thanks for reaching out — our team will call you shortly.",
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error, "Could not save your details.");
  }
}

function readPayload(body: unknown): SubmissionPayload {
  const raw = (body ?? {}) as Record<string, unknown>;
  return {
    name: asString(raw.name),
    email: asString(raw.email),
    phone: asString(raw.phone),
    department: asString(raw.department),
    doctorId: asString(raw.doctorId),
    reason: asString(raw.reason),
  };
}

function toSubmission(row: Record<string, unknown>): Submission {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    phone: row.phone as string,
    department: row.department as string,
    doctor: (row.doctor as string | null) ?? null,
    reason: row.reason as string,
    createdAt: row.created_at as string,
  };
}
