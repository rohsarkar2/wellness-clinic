"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import FormCard, { FormRow, SUBMIT_BUTTON } from "@/components/appointment/FormCard";
import TimeSlotSelector from "@/components/appointment/TimeSlotSelector";
import Alert from "@/components/ui/Alert";
import { InputField, SelectField, TextareaField } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Loading";
import { createAppointment, getAvailability } from "@/lib/api/appointments";
import { toErrorMessage } from "@/lib/api/client";
import type { AppointmentPayload, Doctor, TimeSlot } from "@/lib/types";
import { addDays, today } from "@/lib/utils/date";
import { hasErrors, validateAppointment, type Errors } from "@/lib/validation";

const MAX_ADVANCE_DAYS = 60;

const EMPTY: AppointmentPayload = {
  doctorId: "",
  date: "",
  time: "",
  patientName: "",
  email: "",
  phone: "",
  reason: "",
};

export default function AppointmentForm({ doctors }: { doctors: Doctor[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Deep links from the doctor cards land here as ?doctor=<id>.
  const preselected = searchParams.get("doctor") ?? "";
  const [values, setValues] = useState<AppointmentPayload>({
    ...EMPTY,
    doctorId: doctors.some((d) => d.id === preselected) ? preselected : "",
  });

  const [errors, setErrors] = useState<Errors<AppointmentPayload>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  /** Availability is keyed by "doctorId|date" so stale responses can't be shown. */
  const [availability, setAvailability] = useState<{
    key: string;
    slots: TimeSlot[];
    notice?: string;
    error?: string;
  }>({ key: "", slots: [] });

  const { doctorId, date } = values;
  const requestKey = doctorId && date ? `${doctorId}|${date}` : "";
  const slotsLoading = requestKey !== "" && availability.key !== requestKey;
  const slots = availability.key === requestKey ? availability.slots : [];

  const setField = useCallback(
    <K extends keyof AppointmentPayload>(key: K, value: AppointmentPayload[K]) => {
      setValues((current) => ({
        ...current,
        [key]: value,
        // A slot picked for a different doctor or date must not survive the change.
        ...(key === "doctorId" || key === "date" ? { time: "" } : {}),
      }));
      setErrors((current) => ({ ...current, [key]: undefined }));
    },
    [],
  );

  // Reload slots whenever the doctor or date changes; stale responses are dropped.
  useEffect(() => {
    if (!requestKey) return;

    let cancelled = false;
    const [nextDoctorId, nextDate] = requestKey.split("|");

    getAvailability(nextDoctorId, nextDate)
      .then((response) => {
        if (!cancelled) {
          setAvailability({ key: requestKey, slots: response.slots, notice: response.notice });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAvailability({ key: requestKey, slots: [], error: toErrorMessage(error) });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(undefined);

    const nextErrors = validateAppointment(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) {
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const appointment = await createAppointment(values);
      const query = new URLSearchParams({
        ref: appointment.reference,
        doctor: appointment.doctorName,
        date: appointment.date,
        time: appointment.time,
        name: appointment.patientName,
      });
      router.push(`/appointment/success?${query}`);
    } catch (error) {
      setSubmitError(toErrorMessage(error));
      // A 409 means someone took the slot first — clear it and refresh what's left.
      setValues((current) => ({ ...current, time: "" }));
      if (requestKey) {
        getAvailability(doctorId, date)
          .then((response) =>
            setAvailability({ key: requestKey, slots: response.slots, notice: response.notice }),
          )
          .catch(() => undefined);
      }
      setSubmitting(false);
    }
  }

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  return (
    <FormCard
      title="Book an Appointment"
      subtitle="Choose a doctor and a time that suits you — we'll confirm by phone."
    >
      <form onSubmit={handleSubmit} noValidate className="grid gap-4.5">
        {submitError ? <Alert variant="error">{submitError}</Alert> : null}

        <FormRow>
          <SelectField
            id="doctorId"
            label="Doctor"
            icon="fa-solid fa-user-doctor"
            error={errors.doctorId}
            value={values.doctorId}
            onChange={(event) => setField("doctorId", event.target.value)}
          >
            <option value="">Select a doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} — {doctor.speciality}
              </option>
            ))}
          </SelectField>

          <InputField
            id="date"
            type="date"
            label="Appointment Date"
            icon="fa-solid fa-calendar-day"
            error={errors.date}
            min={today()}
            max={addDays(MAX_ADVANCE_DAYS)}
            value={values.date}
            onChange={(event) => setField("date", event.target.value)}
          />
        </FormRow>

        {selectedDoctor ? (
          <p className="text-center text-[0.9rem] text-[#777]">
            <i className="mr-1.5 fa-solid fa-clock text-primary" aria-hidden="true" />
            {selectedDoctor.name} consults on {selectedDoctor.availableDays.join(", ")}.
          </p>
        ) : null}

        <div className="flex flex-col">
          <label htmlFor="time-slots" className="mb-2 text-[0.9rem] font-semibold text-ink">
            <i className="mr-1.5 fa-solid fa-hourglass-half text-primary" aria-hidden="true" />
            Available Time Slots
          </label>
          <div id="time-slots">
            <TimeSlotSelector
              slots={slots}
              value={values.time}
              onChange={(time) => setField("time", time)}
              loading={slotsLoading}
              error={availability.error}
              notice={availability.notice}
              placeholder={
                !doctorId || !date ? "Select a doctor and date to see available times." : undefined
              }
            />
          </div>
          {errors.time ? <p className="mt-1.5 text-[0.82rem] text-[#d13b4a]">{errors.time}</p> : null}
        </div>

        <FormRow>
          <InputField
            id="patientName"
            label="Full Name"
            icon="fa-solid fa-user"
            placeholder="Enter your full name"
            autoComplete="name"
            error={errors.patientName}
            value={values.patientName}
            onChange={(event) => setField("patientName", event.target.value)}
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
              Booking…
            </>
          ) : (
            <>
              <i className="fa-solid fa-calendar-check" aria-hidden="true" />
              Confirm Appointment
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-[0.9rem] text-[#777]">
        <i className="mr-1.5 fa-solid fa-shield-heart text-primary" aria-hidden="true" />
        Your information is secure.
      </div>
    </FormCard>
  );
}
