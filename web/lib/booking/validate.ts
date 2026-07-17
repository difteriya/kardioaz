/** Shared validation for patient-supplied booking details. */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Azerbaijani mobile numbers: operator code (050/051/055/060/070/077/010/099)
 * + 7 digits. Accepts the ways people actually type them — `+994 50 123 45 67`,
 * `0501234567`, `994-50-123-45-67` — and normalises to `+994501234567`.
 * Returns null if it isn't a valid AZ mobile.
 */
export function normalizePhoneAz(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");

  let local: string;
  if (digits.startsWith("994")) local = digits.slice(3);
  else if (digits.startsWith("0")) local = digits.slice(1);
  else local = digits;

  if (!/^\d{9}$/.test(local)) return null;
  const code = local.slice(0, 2);
  if (!["50", "51", "55", "60", "70", "77", "10", "99"].includes(code)) return null;

  return `+994${local}`;
}

/** Full name: at least two words, letters only (AZ alphabet included). */
export function normalizeName(input: string): string | null {
  const name = input.trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 80) return null;
  if (!/^[\p{L}\s'-]+$/u.test(name)) return null;
  if (name.split(" ").length < 2) return null;
  return name;
}
