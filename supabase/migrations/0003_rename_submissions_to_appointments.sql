-- Renames the single form table from `submissions` to `appointments`.
--
-- Nothing about the shape changes — same columns, same RLS-with-no-policies, so
-- the table still stays invisible to the publishable key and is only reachable
-- through the route handler in src/app/api/submissions. This is a naming change
-- only: `appointments` is what the clinic calls these rows.
--
-- The name was free: 0002 dropped the original `appointments` table (the
-- slot-booking one) after copying its rows across, so there is nothing to
-- collide with.
--
-- Guarded so it is safe to re-run, and so a database that was created after
-- this migration landed (0002 followed straight by 0003) is not tripped up.

do $$
begin
  if to_regclass('public.submissions') is null then
    return;
  end if;

  if to_regclass('public.appointments') is not null then
    raise exception 'public.appointments already exists — resolve before renaming';
  end if;

  alter table public.submissions rename to appointments;
  alter index public.submissions_created_at_idx rename to appointments_created_at_idx;
end
$$;
