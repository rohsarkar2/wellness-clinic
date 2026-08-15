import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import { site, telHref } from "@/lib/site";
import { formatDate, formatTime } from "@/lib/utils/date";

export const metadata: Metadata = {
  title: "Appointment Requested",
  description: "Your appointment request has been received.",
  robots: { index: false },
};

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export default async function AppointmentSuccessPage(props: PageProps<"/appointment/success">) {
  const params = await props.searchParams;

  const reference = first(params.ref);
  const doctor = first(params.doctor);
  const date = first(params.date);
  const time = first(params.time);
  const name = first(params.name);

  const rows = [
    reference && { term: "Reference", value: reference },
    doctor && { term: "Doctor", value: doctor },
    date && { term: "Date", value: formatDate(date) },
    time && { term: "Time", value: formatTime(time) },
    { term: "Status", value: "Awaiting confirmation" },
  ].filter(Boolean) as Array<{ term: string; value: string }>;

  return (
    <Section>
      <Container>
        <div className="mx-auto max-w-160 rounded-[16px] bg-white p-9 text-center shadow-card sm:rounded-[22px] sm:p-[55px_40px]">
          <div className="mx-auto mb-6.5 flex size-19.5 items-center justify-center rounded-full bg-[#e8f8f2] text-[2.2rem] text-[#1aa87a] sm:size-24 sm:text-[2.8rem]">
            <i className="fa-solid fa-circle-check" aria-hidden="true" />
          </div>

          <h1 className="mb-3 font-display text-[1.6rem] font-bold text-ink sm:text-[2rem]">
            Appointment Requested
          </h1>
          <p>
            {name ? `Thanks, ${name}. ` : "Thank you. "}
            Your request has been received and our front desk will call you shortly to confirm.
          </p>

          {reference ? (
            <dl className="my-7.5 overflow-hidden rounded-card border border-[#eef2f7] text-left">
              {rows.map((row) => (
                <div
                  key={row.term}
                  className="flex flex-col gap-0.5 border-b border-[#eef2f7] px-4 py-3 last:border-b-0 sm:flex-row sm:justify-between sm:gap-5 sm:px-5 sm:py-3.5"
                >
                  <dt className="text-[0.92rem] text-[#7a8794]">{row.term}</dt>
                  <dd className="font-semibold text-ink sm:text-right">{row.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <p>
            Please arrive 10 minutes early and bring any previous prescriptions or reports. To
            reschedule, call us on {site.phonePrimary}.
          </p>

          <div className="mt-7.5 flex flex-wrap justify-center gap-3.5">
            <ButtonLink href="/" block={false}>
              Back to Home
            </ButtonLink>
            <ButtonLink href={telHref} variant="secondary" block={false}>
              <i className="fa-solid fa-phone" aria-hidden="true" />
              Call the Clinic
            </ButtonLink>
          </div>
        </div>
      </Container>
    </Section>
  );
}
