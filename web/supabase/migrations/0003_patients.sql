-- kardio.az — patient directory
--
-- Supersedes the salted-hash approach in 0002: the owner decided to retain
-- patient contact details so returning patients can be recognised.
--
-- SCOPE OF THE CHANGE (deliberate, see PROJECT-PLAN §14.3 / §14.9):
--   * We now retain CONTACT/IDENTITY data (email + visit counts) indefinitely.
--   * We still retain NO MEDICAL DATA. Consultation content — video, chat,
--     shared files — remains session-only and is never persisted, and the
--     per-appointment rows are still purged after completion.
-- The privacy policy and consent text were updated to match this.

create table patients (
  id          uuid primary key default gen_random_uuid(),
  email       text not null unique,
  first_seen  timestamptz not null default now(),
  last_seen   timestamptz not null default now(),
  visit_count integer not null default 0
);

create index patients_last_seen_idx on patients (last_seen desc);

alter table patients enable row level security;
-- No policies: reachable only via the service-role key (server-side admin routes).
grant all on table patients to service_role;

/** Upsert a patient on booking and count the visit. */
create or replace function bump_patient_email(p_email text) returns void
language plpgsql security definer as $$
begin
  insert into patients (email, visit_count)
  values (lower(trim(p_email)), 1)
  on conflict (email) do update
    set visit_count = patients.visit_count + 1,
        last_seen   = now();
end $$;

grant execute on function bump_patient_email(text) to service_role;

-- Carry over the anonymous counts we already had, so existing numbers survive.
insert into patients (email, visit_count, first_seen, last_seen)
select 'arxiv+' || left(hash, 12) || '@kardio.local', visits, first_seen, last_seen
from patient_fingerprints
on conflict (email) do nothing;

drop function if exists bump_patient(text);
drop table if exists patient_fingerprints;
