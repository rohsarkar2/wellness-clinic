-- Collapses the two form tables into one.
--
-- The appointment form no longer picks a date or a time slot, so everything
-- that supported slot booking goes with it: the slot columns, the uniqueness
-- guard, the human-facing reference and the pending/confirmed status. What is
-- left is the same shape for both forms — someone's details and what they want
-- — which is one table, not two.

create table if not exists public.submissions (
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

create index if not exists submissions_created_at_idx
  on public.submissions (created_at desc);

-- ---------------------------------------------------------------------------
-- Carry the existing rows over
-- ---------------------------------------------------------------------------
--
-- Both copies run before the drops below, so no submission the clinic has
-- already received is lost. The whole block is skipped once `submissions` holds
-- anything, so re-running the migration cannot duplicate them, and each source
-- is checked for existence so it also works on a database that never had them.
--
-- The old appointments table had no department of its own — a department was
-- only ever a property of the doctor — so it is mapped back from doctor_id
-- here. That list is a snapshot of src/lib/data/doctors.ts as it stood at this
-- migration, which is what these historical rows were booked against; it is
-- deliberately not kept in step with later edits to the seed data.

do $$
begin
  if exists (select 1 from public.submissions) then
    return;
  end if;

  if to_regclass('public.appointments') is not null then
    execute $copy$
      insert into public.submissions (name, email, phone, doctor, department, reason, created_at)
      select
        patient_name,
        email,
        phone,
        doctor_name,
        case doctor_id
          when 'sayantani-bhanja'   then 'Gynecology'
          when 'manas-mukul-mondal' then 'Orthopedics'
          else 'General Medicine'
        end,
        reason,
        created_at
      from public.appointments
    $copy$;
  end if;

  if to_regclass('public.contact_enquiries') is not null then
    execute $copy$
      insert into public.submissions (name, email, phone, doctor, department, reason, created_at)
      select
        name,
        -- email is required now, but was optional on the old enquiry form.
        coalesce(email, ''),
        phone,
        null,
        department,
        message,
        created_at
      from public.contact_enquiries
    $copy$;
  end if;
end
$$;

-- ---------------------------------------------------------------------------

drop table if exists public.appointments;
drop table if exists public.contact_enquiries;
drop sequence if exists public.appointment_reference_seq;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
--
-- RLS on with *no policies* means the publishable key (which ships to the
-- browser) can neither read nor write this table. All access goes through the
-- route handler at src/app/api/submissions, which uses SUPABASE_SECRET_KEY and
-- bypasses RLS. Patient contact details are never exposed to the client.

alter table public.submissions enable row level security;
