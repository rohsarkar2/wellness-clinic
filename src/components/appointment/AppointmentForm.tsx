"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import FormCard, {
  FormRow,
  SUBMIT_BUTTON,
} from "@/components/appointment/FormCard";
import Alert from "@/components/ui/Alert";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Loading";
import { toErrorMessage } from "@/lib/api/client";
import { sendSubmission } from "@/lib/api/submissions";
import type { Doctor, SubmissionPayload } from "@/lib/types";
import { hasErrors, validateSubmission, type Errors } from "@/lib/validation";

const EMPTY: SubmissionPayload = {
  name: "",
  email: "",
  phone: "",
  department: "",
  doctorId: "",
  reason: "",
};

export default function AppointmentForm({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselected = searchParams.get("doctor") ?? "";
  const [values, setValues] = useState<SubmissionPayload>({
    ...EMPTY,
    doctorId: doctors.some((d) => d.id === preselected) ? preselected : "",
  });

  const [errors, setErrors] = useState<Errors<SubmissionPayload>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const selectedDoctor = doctors.find((d) => d.id === values.doctorId);

  const department = selectedDoctor?.department ?? "";

  function setField<K extends keyof SubmissionPayload>(
    key: K,
    value: SubmissionPayload[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);

    const nextErrors = validateSubmission(values, { requireDoctor: true });
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    try {
      await sendSubmission({ ...values, department });
      router.push("/appointment/success");
    } catch (error) {
      setSubmitError(toErrorMessage(error));
      setSubmitting(false);
    }
  }

  return (
    <FormCard
      title="Book an Appointment"
      subtitle="Choose a doctor and tell us how we can help — we'll call you to confirm."
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid grid-cols-1 gap-4.5"
      >
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}

        <FormRow>
          <SelectField
            id="doctorId"
            label="Doctor"
            icon="fa-solid fa-user-doctor"
            error={errors.doctorId}
            placeholder="Select a doctor"
            value={values.doctorId}
            onValueChange={(value) => setField("doctorId", value)}
            options={doctors.map((doctor) => ({
              value: doctor.id,
              label: `${doctor.name} — ${doctor.speciality}`,
            }))}
          />

          {/* Filled in by the doctor above rather than chosen, so it is shown
              read-only instead of as a second thing to pick. */}
          <InputField
            id="name"
            label="Full Name"
            icon="fa-solid fa-user"
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.name}
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
          />
        </FormRow>

        <FormRow>
          {/* <InputField
            id="name"
            label="Full Name"
            icon="fa-solid fa-user"
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.name}
            value={values.name}
            onChange={(event) => setField("name", event.target.value)}
          /> */}

          <InputField
            id="email"
            type="email"
            label="Email Address"
            icon="fa-solid fa-envelope"
            placeholder="Enter your email"
            autoComplete="email"
            error={errors.email}
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
          />

          <InputField
            id="phone"
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

        {/* <InputField
          id="email"
          type="email"
          label="Email Address"
          icon="fa-solid fa-envelope"
          placeholder="Enter your email"
          autoComplete="email"
          error={errors.email}
          value={values.email}
          onChange={(event) => setField("email", event.target.value)}
        /> */}

        <TextareaField
          id="reason"
          label="Reason for Visit"
          icon="fa-solid fa-comment-medical"
          placeholder="Tell us how we can help…"
          maxLength={500}
          error={errors.reason}
          value={values.reason}
          onChange={(event) => setField("reason", event.target.value)}
        />

        <button type="submit" disabled={submitting} className={SUBMIT_BUTTON}>
          {submitting ? (
            <>
              <Spinner />
              Sending…
            </>
          ) : (
            <>
              <i className="fa-solid fa-calendar-check" aria-hidden="true" />
              Request Appointment
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
