import { SLOT_MINUTES } from "./config";

/** How early either party may enter the room. */
export const JOIN_EARLY_MINUTES = 5;
/**
 * Grace after the slot ends. Consultations run over, and a patient who joins
 * late should not find a locked door — so the room stays open well past the
 * nominal end. The doctor closing the call ("Bitir") is what really ends it.
 */
export const JOIN_GRACE_MINUTES = 30;

export type JoinState = "early" | "open" | "expired";

export interface JoinWindow {
  state: JoinState;
  /** Epoch ms. */
  start: number;
  opensAt: number;
  closesAt: number;
}

/**
 * When the consultation room may be entered.
 *
 * Shared by the page, the room component and the token route on purpose: the
 * countdown a patient sees and the gate the server enforces must come from one
 * definition, or the button goes live a minute before the token does.
 */
export function joinWindow(startAtIso: string, now: number = Date.now()): JoinWindow {
  const start = new Date(startAtIso).getTime();
  const opensAt = start - JOIN_EARLY_MINUTES * 60_000;
  const closesAt = start + (SLOT_MINUTES + JOIN_GRACE_MINUTES) * 60_000;

  const state: JoinState = now < opensAt ? "early" : now > closesAt ? "expired" : "open";
  return { state, start, opensAt, closesAt };
}

/**
 * Coarse Azerbaijani countdown: "2 gün 4 saat", "45 dəqiqə", "20 saniyə".
 * Deliberately shows one or two units — a patient needs "how long roughly",
 * not a stopwatch.
 */
export function countdownAz(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  if (days > 0) return hours > 0 ? `${days} gün ${hours} saat` : `${days} gün`;
  if (hours > 0) return minutes > 0 ? `${hours} saat ${minutes} dəqiqə` : `${hours} saat`;
  if (minutes > 0) return `${minutes} dəqiqə`;
  return `${seconds} saniyə`;
}
