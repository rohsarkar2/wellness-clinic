"use client";

import { useState } from "react";

import FormCard, {
  FormRow,
  SUBMIT_BUTTON,
} from "@/components/appointment/FormCard";
import Alert from "@/components/ui/Alert";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Loading";
import { sendContactEnquiry } from "@/lib/api/appointments";
import { toErrorMessage } from "@/lib/api/client";
import { departments } from "@/lib/data/services";
import type { ContactPayload } from "@/lib/types";
import { hasErrors, validateContact, type Errors } from "@/lib/validation";

const EMPTY: ContactPayload = {
  name: "",
  email: "",
  phone: "",
  department: "",
  message: "",
};

interface EnquiryFormProps {
  title?: string;
  subtitle?: string;
  /** Wider standalone card, used on /contact. */
  wide?: boolean;
}

/**
 * The quick "we'll call you back" enquiry card from the original design.
 * Full slot-based booking lives on /appointment.
 */
export default function EnquiryForm({
  title = "Book an Appointment",
  subtitle = "Fill in your details and we'll contact you shortly.",
  wide = false,
}: EnquiryFormProps) {
  const [values, setValues] = useState<ContactPayload>(EMPTY);
  const [errors, setErrors] = useState<Errors<ContactPayload>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  }>();

  function setField<K extends keyof ContactPayload>(
    key: K,
    value: ContactPayload[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(undefined);

    const nextErrors = validateContact(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    setSubmitting(true);
    try {
      const response = await sendContactEnquiry(values);
      setStatus({ type: "success", message: response.message });
      setValues(EMPTY);
    } catch (error) {
      setStatus({ type: "error", message: toErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormCard title={title} subtitle={subtitle} wide={wide}>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4.5"
      >
        {status ? <Alert variant={status.type}>{status.message}</Alert> : null}

        <FormRow>
          <InputField
            id="enquiry-name"
            name="name"
            label="Full Name"
            icon="fa-solid fa-user"
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.name}
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
          />

          <InputField
            id="enquiry-phone"
            name="phone"
            type="tel"
            label="Phone Number"
            icon="fa-solid fa-phone"
            placeholder="10-digit mobile number"
            autoComplete="tel"
            error={errors.phone}
            value={values.phone}
            onChange={(event) => setField("phone", event.target.value)}
          />
        </FormRow>

        <FormRow>
          <InputField
            id="enquiry-email"
            name="email"
            type="email"
            label="Email Address"
            icon="fa-solid fa-envelope"
            placeholder="Enter your email (optional)"
            autoComplete="email"
            error={errors.email}
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
          />

          <SelectField
            id="enquiry-department"
            label="Department"
            icon="fa-solid fa-stethoscope"
            error={errors.department}
            placeholder="Select Department"
            value={values.department}
            onValueChange={(value) => setField("department", value)}
            options={departments.map((department) => ({
              value: department,
              label: department,
            }))}
          />
        </FormRow>

        <TextareaField
          id="enquiry-message"
          name="message"
          label="Message"
          icon="fa-solid fa-comment-medical"
          placeholder="Tell us how we can help…"
          maxLength={500}
          error={errors.message}
          value={values.message}
          onChange={(event) => setField("message", event.target.value)}
        />

        <button type="submit" disabled={submitting} className={SUBMIT_BUTTON}>
          {submitting ? (
            <>
              <Spinner />
              Sending…
            </>
          ) : (
            <>
              <i className="fa-solid fa-paper-plane" aria-hidden="true" />
              Request a Callback
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-[0.9rem] text-[#777]">
        <i
          className="mr-1.5 fa-solid fa-shield-heart text-primary"
          aria-hidden="true"
        />
        Your information is secure.
      </div>
    </FormCard>
  );
}
