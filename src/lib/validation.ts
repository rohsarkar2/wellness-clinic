import type { SubmissionPayload } from "@/lib/types";

export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
/** Accepts 10-digit Indian numbers with optional +91 / 0 prefix and separators. */
const PHONE_RE = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.replace(/[\s\-().]/g, ""));
}

/**
 * Both forms submit the same payload, so they share one set of rules.
 *
 * `requireDoctor` is the only difference between them: the appointment form
 * must name a doctor, the enquiry form never does. The department is not
 * checked when a doctor is required — the appointment form derives it from the
 * doctor, and the server does the same again from its own seed data.
 */
export function validateSubmission(
  values: SubmissionPayload,
  { requireDoctor = false }: { requireDoctor?: boolean } = {},
): Errors<SubmissionPayload> {
  const errors: Errors<SubmissionPayload> = {};

  if (requireDoctor && !values.doctorId) {
    errors.doctorId = "Please select a doctor.";
  }

  const name = values.name.trim();
  if (!name) {
    errors.name = "Please enter your full name.";
  } else if (name.length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Please enter a valid 10-digit number.";
  }

  if (!requireDoctor && !values.department) {
    errors.department = "Please select a department.";
  }

  if (values.reason.trim().length > 500) {
    errors.reason = "Please keep the message under 500 characters.";
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
