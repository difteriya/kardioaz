/** Azerbaijani month names for date display. */
const AZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

/** ISO date → "12 mart 2026" (Azerbaijani). */
export function formatDateAz(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getUTCDate()} ${AZ_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
