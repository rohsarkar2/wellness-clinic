import type { Metadata } from "next";
import { Suspense } from "react";

import AppointmentForm from "@/components/appointment/AppointmentForm";
import Alert from "@/components/ui/Alert";
import Container from "@/components/ui/Container";
import { LoadingBlock } from "@/components/ui/Loading";
import Section from "@/components/ui/Section";
import SectionTitle from "@/components/ui/SectionTitle";
import { toErrorMessage } from "@/lib/api/client";
import { getDoctors } from "@/lib/api/doctors";
import { site } from "@/lib/site";
import type { Doctor } from "@/lib/types";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description:
    "Book an appointment at Wellness Health Point — choose your doctor, pick an available time slot and we'll confirm by phone.",
};

export default async function AppointmentPage() {
  let doctors: Doctor[] = [];
  let error: string | undefined;

  try {
    doctors = await getDoctors();
  } catch (caught) {
    error = toErrorMessage(caught);
  }

  return (
    <Section className="relative overflow-hidden bg-linear-[135deg,#eef7ff_0%,#f8fcff_45%,#ffffff_100%] md:before:absolute md:before:-top-45 md:before:-left-30 md:before:size-105 md:before:rounded-full md:before:bg-primary/8 md:after:absolute md:after:-right-25 md:after:-bottom-30 md:after:size-80 md:after:rounded-full md:after:bg-[#f48fb1]/10">
      <Container className="relative z-2">
        <SectionTitle
          eyebrow="Appointments"
          title="Book Your Visit"
          description={`Pick a doctor and a time that works for you. Clinic hours are ${site.hours.toLowerCase()}.`}
        />

        <div className="mx-auto max-w-195">
          {error ? (
            <Alert variant="error">
              {error} You can also call us on {site.phonePrimary} to book over
              the phone.
            </Alert>
          ) : (
            /* useSearchParams needs a Suspense boundary during prerender. */
            <Suspense
              fallback={<LoadingBlock label="Loading appointment form…" />}
            >
              <AppointmentForm doctors={doctors} />
            </Suspense>
          )}
        </div>
      </Container>
    </Section>
  );
}
