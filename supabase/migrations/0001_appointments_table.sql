-- Collapses the two form tables into one.
--
-- The appointment form no longer picks a date or a time slot, so everything
-- that supported slot booking goes with it: the slot columns, the uniqueness
-- guard, the human-facing reference and the pending/confirmed status. What is
-- left is the same shape for both forms — someone's details and what they want
-- — which is one table, not two.

create table if not exists public.appointments (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null,

  -- Null for a home/contact-page enquiry; set to the doctor's name when the
  -- appointment form sends one. Denormalised rather than a foreign key because
  -- doctors are seed data in src/lib/data/doctors.ts, not a table — a past
  -- submission still reads correctly if a seed entry is renamed or removed.
  doctor     text,

  -- Chosen on the enquiry form; derived from the doctor on the appointment
  -- form. Always written from server-side data, never straight from the client.
  department text not null,

  reason     text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists appointments_created_at_idx
  on public.appointments (created_at desc);

