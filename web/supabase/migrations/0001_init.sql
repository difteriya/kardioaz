-- kardio.az — Phase 4 video consultation schema (PROJECT-PLAN.md §14.3)
-- Single doctor, session-based, data-minimized: no medical data stored;
-- personal booking data is purged after the consultation completes.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type slot_status as enum ('open', 'held', 'booked');
create type appointment_status as enum ('pending', 'booked', 'completed', 'cancelled', 'no_show');

-- ---------------------------------------------------------------------------
-- availability_slots — doctor-created 30-min windows (persistent, non-personal)
-- Stored in UTC; displayed in Azerbaijan time (UTC+4) by the app.
-- ---------------------------------------------------------------------------
create table availability_slots (
  id          uuid primary key default gen_random_uuid(),
  start_at    timestamptz not null,
  end_at      timestamptz not null,
  status      slot_status not null default 'open',
  created_at  timestamptz not null default now(),
  constraint slot_time_valid check (end_at > start_at)
);

-- Single doctor → no two slots may overlap. Enforced with an exclusion
-- constraint over the time range.
create extension if not exists btree_gist;
alter table availability_slots
  add constraint slots_no_overlap
  exclude using gist (tstzrange(start_at, end_at) with &&);

create index availability_slots_start_idx on availability_slots (start_at);

-- ---------------------------------------------------------------------------
-- appointments — EPHEMERAL. Purged after the consultation (see cleanup job).
-- Holds only the minimum personal data (patient email) needed to run + notify.
-- payment_status / payment_id are pre-wired but unused in the free MVP.
-- ---------------------------------------------------------------------------
create table appointments (
  id               uuid primary key default gen_random_uuid(),
  slot_id          uuid not null references availability_slots (id) on delete restrict,
  patient_user_id  uuid references auth.users (id) on delete set null,
  patient_email    text not null,
  status           appointment_status not null default 'pending',
  hold_expires_at  timestamptz,               -- while status = 'pending'/'held'
  confirm_token    uuid not null default gen_random_uuid(),  -- email opt-in link
  cancel_token     uuid not null default gen_random_uuid(),  -- single-use cancel link
  cancel_used      boolean not null default false,
  video_room       text,                       -- Daily room name/url
  consent_version  text,                        -- which consent text was accepted
  -- payment (deferred; unused in MVP)
  payment_status   text not null default 'none',
  payment_id       text,
  -- notification bookkeeping (email in MVP)
  notified_booked    boolean not null default false,
  notified_cancelled boolean not null default false,
  created_at       timestamptz not null default now(),
  completed_at     timestamptz
);

-- Only ONE *active* appointment per slot. Cancelled / completed / no-show rows
-- remain as history, so a freed slot can be booked again by someone else.
create unique index one_active_booking_per_slot
  on appointments (slot_id)
  where status in ('pending', 'booked');

create unique index appointments_confirm_token_idx on appointments (confirm_token);
create unique index appointments_cancel_token_idx on appointments (cancel_token);
create index appointments_email_idx on appointments (patient_email);
create index appointments_status_idx on appointments (status);

-- ---------------------------------------------------------------------------
-- Row Level Security
--  - anon/patient: may read open slots; may see only their own appointment.
--  - the doctor (admin) is served via the service-role key (bypasses RLS) in
--    server-only admin routes, so no broad client policy is granted here.
-- ---------------------------------------------------------------------------
alter table availability_slots enable row level security;
alter table appointments enable row level security;

-- Public may view open slots (to pick a time). No write access.
create policy "open slots are viewable by anyone"
  on availability_slots for select
  using (status = 'open');

-- A signed-in patient may view their own appointment rows.
create policy "patients read own appointments"
  on appointments for select
  using (auth.uid() = patient_user_id);

-- ---------------------------------------------------------------------------
-- Grants. RLS above is the row-level gate; these are the table-level privileges.
-- Patients (anon/authenticated) only ever read; every mutation goes through the
-- server using the service-role key.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

grant select on table availability_slots to anon, authenticated;
grant all on table availability_slots to service_role;

grant select on table appointments to authenticated;
grant all on table appointments to service_role;

-- ---------------------------------------------------------------------------
-- Cleanup helpers (invoked by the app's cron jobs — PROJECT-PLAN §14.3)
-- ---------------------------------------------------------------------------

-- Release holds whose confirmation window elapsed → slot back to 'open'.
create or replace function release_expired_holds() returns integer
language plpgsql security definer as $$
declare released integer;
begin
  with expired as (
    delete from appointments
    where status = 'pending' and hold_expires_at < now()
    returning slot_id
  )
  update availability_slots s
    set status = 'open'
    from expired e
    where s.id = e.slot_id and s.status = 'held';
  get diagnostics released = row_count;
  return released;
end $$;

-- Purge personal data for completed consultations (data minimization).
create or replace function purge_completed_appointments() returns integer
language plpgsql security definer as $$
declare purged integer;
begin
  delete from appointments
  where status = 'completed' and completed_at < now() - interval '1 hour';
  get diagnostics purged = row_count;
  return purged;
end $$;

grant execute on function release_expired_holds() to service_role;
grant execute on function purge_completed_appointments() to service_role;
