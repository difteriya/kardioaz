-- kardio.az — usage statistics (PROJECT-PLAN.md §14.3)
--
-- Appointments are purged an hour after completion, so counting them directly
-- would always read ~0. These tables keep the DOCTOR'S NUMBERS without keeping
-- the PATIENT'S DATA:
--   * usage_stats        — pure daily counters, no personal data whatsoever.
--   * patient_fingerprints — a salted SHA-256 of the email, never the email.
--     Irreversible without STATS_SALT, so we can count unique/returning patients
--     without retaining anything identifying.

create table usage_stats (
  day        date primary key,
  booked     integer not null default 0,
  completed  integer not null default 0,
  cancelled  integer not null default 0,
  no_show    integer not null default 0
);

create table patient_fingerprints (
  hash        text primary key,
  first_seen  date not null default current_date,
  last_seen   date not null default current_date,
  visits      integer not null default 0
);

alter table usage_stats enable row level security;
alter table patient_fingerprints enable row level security;
-- No policies: readable only via the service-role key (server-side admin routes).

grant all on table usage_stats to service_role;
grant all on table patient_fingerprints to service_role;

-- Increment today's counter for a given event kind.
create or replace function bump_usage(kind text) returns void
language plpgsql security definer as $$
begin
  insert into usage_stats (day) values (current_date) on conflict (day) do nothing;
  if kind = 'booked' then
    update usage_stats set booked = booked + 1 where day = current_date;
  elsif kind = 'completed' then
    update usage_stats set completed = completed + 1 where day = current_date;
  elsif kind = 'cancelled' then
    update usage_stats set cancelled = cancelled + 1 where day = current_date;
  elsif kind = 'no_show' then
    update usage_stats set no_show = no_show + 1 where day = current_date;
  end if;
end $$;

-- Record a (pseudonymous) patient visit.
create or replace function bump_patient(p_hash text) returns void
language plpgsql security definer as $$
begin
  insert into patient_fingerprints (hash, visits)
  values (p_hash, 1)
  on conflict (hash) do update
    set visits = patient_fingerprints.visits + 1,
        last_seen = current_date;
end $$;

grant execute on function bump_usage(text) to service_role;
grant execute on function bump_patient(text) to service_role;
