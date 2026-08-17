import { after } from "next/server";

import { notifyClinicOfEnquiry } from "@/lib/server/email";
import { asString, errorResponse, jsonError } from "@/lib/server/http";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { ContactPayload } from "@/lib/types";
import { hasErrors, validateContact } from "@/lib/validation";

/** POST /api/contact — stores an enquiry from the callback form. */
export async function POST(request: Request) {
  let payload: ContactPayload;
  try {
    payload = readPayload(await request.json());
  } catch {
    return jsonError("Invalid request body.", 400);
  }

  const errors = validateContact(payload);
  if (hasErrors(errors)) {
    return jsonError(Object.values(errors).find(Boolean) ?? "Please check the form.", 400);
  }

  try {
    const { data, error } = await supabaseAdmin()
      .from("contact_enquiries")
      .insert({
        name: payload.name,
        email: payload.email || null, // optional on this form
        phone: payload.phone,
        department: payload.department,
        message: payload.message,
      })
      // id and created_at are for the notification below; the enquirer only
      // ever sees the acknowledgement message.
      .select("id, created_at")
      .single();

    if (error) {
      console.error("Failed to insert enquiry", error);
      return jsonError("We could not send your enquiry. Please try again.", 502);
    }

    // The enquiry is saved; the notification must not hold up the response or
    // fail the request if the mail server is down. `after` keeps the
    // invocation alive until the send settles.
    after(() =>
      notifyClinicOfEnquiry({
        ...payload,
        id: data.id as string,
        createdAt: data.created_at as string,
      }),
    );

    return Response.json({
      message: "Thanks for reaching out — our team will call you shortly.",
    });
  } catch (error) {
    return errorResponse(error, "Could not send the enquiry.");
  }
}

function readPayload(body: unknown): ContactPayload {
  const raw = (body ?? {}) as Record<string, unknown>;
  return {
    name: asString(raw.name),
    email: asString(raw.email),
    phone: asString(raw.phone),
    department: asString(raw.department),
    message: asString(raw.message),
  };
}
