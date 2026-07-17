-- kardio.az — drop appointments.patient_user_id (dead code cleanup, 2026-07-17)
--
-- Leftover from the original Supabase Auth design (§14.7): patients were going
-- to sign in with a magic link, and this held their auth.users id. The build
-- never used Supabase Auth — a patient's identity is the single-use token we
-- email them — so the column has always been null.
--
-- Kept deliberately: payment_status / payment_id. Online payments are DEFERRED,
-- not cancelled (owner decision, §14.10), so those columns stay pre-wired.

-- The column has one dependant: an RLS policy from the same abandoned design.
--
--   "patients read own appointments"  USING (auth.uid() = patient_user_id)
--
-- It is doubly dead and safe to drop:
--   * `anon`/`authenticated` have no GRANT on appointments, so a request is
--     refused before RLS is ever consulted ("permission denied for table");
--   * even past that, auth.uid() is always null (nobody signs in) and
--     patient_user_id is always null, and `null = null` is NULL, not true —
--     so it never matched a row.
-- Dropped explicitly rather than via CASCADE, so the removal is on the record.
-- Access control for patients is the emailed single-use token + our server-side
-- routes (service_role), never client-side RLS. See §14.7.
drop policy if exists "patients read own appointments" on appointments;

alter table appointments drop column if exists patient_user_id;
