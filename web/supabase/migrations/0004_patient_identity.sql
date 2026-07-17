-- kardio.az — collect full name + mobile phone at booking (owner decision, 2026-07-17)
--
-- Rationale: an email alone is a thin way to recognise a returning patient, and
-- the doctor needs a phone number to reach someone if the call drops.
--
-- Still NO medical data: name/phone are contact details, not health information.
-- Privacy policy + consent texts updated to disclose this.

alter table appointments
  add column full_name text,
  add column phone     text;

alter table patients
  add column full_name text,
  add column phone     text;

-- The new signature has defaults, so the old 1-arg version would stay as an
-- overload and make bump_patient_email(p_email => …) ambiguous. Drop it first.
drop function if exists bump_patient_email(text);

/**
 * Upsert a patient on booking and count the visit.
 * Name/phone are refreshed on each visit when supplied, so the directory keeps
 * the most recent details a patient gave us (coalesce = never overwrite with null).
 */
create or replace function bump_patient_email(
  p_email text,
  p_name  text default null,
  p_phone text default null
) returns void
language plpgsql security definer as $$
begin
  insert into patients (email, full_name, phone, visit_count)
  values (lower(trim(p_email)), nullif(trim(p_name), ''), nullif(trim(p_phone), ''), 1)
  on conflict (email) do update
    set visit_count = patients.visit_count + 1,
        last_seen   = now(),
        full_name   = coalesce(nullif(trim(p_name), ''),  patients.full_name),
        phone       = coalesce(nullif(trim(p_phone), ''), patients.phone);
end $$;

grant execute on function bump_patient_email(text, text, text) to service_role;
