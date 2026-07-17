/** Phase 4 booking constants (PROJECT-PLAN.md §14.2). */
export const SLOT_MINUTES = 30;
export const HOLD_MINUTES = 15; // email double opt-in window
export const AZ_TZ = "Asia/Baku"; // UTC+4, no DST
export const CONSENT_VERSION = "2026-07-14";

/** Format a UTC ISO timestamp as Azerbaijan-time "14 iyul 2026, 09:30". */
export const AZ_MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr",
];

/** Weekday abbreviations, Monday-first (Azerbaijani). */
export const AZ_WEEKDAYS = ["B.e", "Ç.a", "Ç", "C.a", "C", "Ş", "B"];

/** UTC ISO → "YYYY-MM-DD" in Azerbaijan time (calendar day key). */
export function azDateKey(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: AZ_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** UTC ISO → "09:30" in Azerbaijan time. */
export function azTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: AZ_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Build a "YYYY-MM-DD" key from calendar parts. */
export function dateKey(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatSlotAz(iso: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: AZ_TZ,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const month = AZ_MONTHS[Number(get("month")) - 1];
  return `${Number(get("day"))} ${month} ${get("year")}, ${get("hour")}:${get("minute")}`;
}
