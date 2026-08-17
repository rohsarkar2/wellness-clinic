-- Wellness clinic — form storage.

-- ---------------------------------------------------------------------------
-- Appointments
-- ---------------------------------------------------------------------------

-- Human-facing booking reference, e.g. WHP-001042.
create sequence if not exists public.appointment_reference_seq start 1001;

create table if not exists public.appointments (
  id           uuid primary key default gen_random_uuid(),
  reference    text not null unique
                 default 'WHP-' || lpad(nextval('public.appointment_reference_seq')::text, 6, '0'),

  -- Mirrors Doctor.id in src/lib/data/doctors.ts. Not a foreign key: doctors are
  -- seed data, not a table. doctor_name is denormalised so a past booking still
  -- reads correctly if the seed entry is later renamed or removed.
  doctor_id    text not null,
  doctor_name  text not null,

  -- slot_time is "HH:mm" text rather than a `time` column so it round-trips to
  -- the TimeSlot contract in src/lib/types.ts without reformatting.
  slot_date    date not null,
  slot_time    text not null check (slot_time ~ '^[0-2][0-9]:[0-5][0-9]$'),

  patient_name text not null,
  email        text not null,
  phone        text not null,
  reason       text not null default '',

  status       text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'cancelled')),
  created_at   timestamptz not null default now()
);

-- The actual double-booking guard. The availability check in the route handler
-- only narrows the race window; this closes it. Cancelled bookings are excluded
-- so a freed slot can be rebooked.
create unique index if not exists appointments_slot_unique
  on public.appointments (doctor_id, slot_date, slot_time)
  where status <> 'cancelled';

-- Supports the availability lookup for one doctor on one day.
create index if not exists appointments_doctor_date_idx
  on public.appointments (doctor_id, slot_date);

-- ---------------------------------------------------------------------------
-- Contact enquiries
-- ---------------------------------------------------------------------------

create table if not exists public.contact_enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text,                      -- optional on the enquiry form
  phone      text not null,
  department text not null,
  message    text not null default '',
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_enquiries_created_at_idx
  on public.contact_enquiries (created_at desc);

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
--
-- RLS on with *no policies* means the publishable key (which ships to the
-- browser) can neither read nor write these tables. All access goes through the
-- route handlers under src/app/api, which use SUPABASE_SECRET_KEY and bypass
-- RLS. Patient contact details are never exposed to the client.

alter table public.appointments      enable row level security;
alter table public.contact_enquiries enable row level security;
