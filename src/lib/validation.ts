import type { AppointmentPayload, ContactPayload } from "@/lib/types";

export type Errors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
/** Accepts 10-digit Indian numbers with optional +91 / 0 prefix and separators. */
const PHONE_RE = /^(?:\+?91[-\s]?|0)?[6-9]\d{9}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.replace(/[\s\-().]/g, ""));
}

export function validateAppointment(
  values: AppointmentPayload,
): Errors<AppointmentPayload> {
  const errors: Errors<AppointmentPayload> = {};

  if (!values.doctorId) errors.doctorId = "Please select a doctor.";

  if (!values.date) {
    errors.date = "Please choose an appointment date.";
  } else if (!DATE_RE.test(values.date)) {
    errors.date = "Please enter a valid date.";
  }

  if (!values.time) errors.time = "Please select a time slot.";

  const name = values.patientName.trim();
  if (!name) {
    errors.patientName = "Please enter your full name.";
  } else if (name.length < 3) {
    errors.patientName = "Name must be at least 3 characters.";
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

  if (values.reason.trim().length > 500) {
    errors.reason = "Please keep the message under 500 characters.";
  }

  return errors;
}

export function validateContact(
  values: ContactPayload,
): Errors<ContactPayload> {
  const errors: Errors<ContactPayload> = {};

  const name = values.name.trim();
  if (!name) {
    errors.name = "Please enter your full name.";
  } else if (name.length < 3) {
    errors.name = "Name must be at least 3 characters.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!isValidPhone(values.phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  // Email is optional on the enquiry form, but must be valid when supplied.
  if (values.email.trim() && !isValidEmail(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.department) errors.department = "Please select a department.";

  if (values.message.trim().length > 500) {
    errors.message = "Please keep the message under 500 characters.";
  }

  return errors;
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}
