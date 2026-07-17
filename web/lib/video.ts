/**
 * Video provider — LiveKit (PROJECT-PLAN.md §14.6).
 *
 * Rooms are created implicitly on first join, so nothing is pre-provisioned.
 * Access is gated by a short-lived JWT that we mint server side, and only after
 * verifying the appointment is still `booked` — there is no "join by URL", so a
 * leaked room name is useless without a token.
 *
 * LiveKit is open source: pointing NEXT_PUBLIC_LIVEKIT_URL at a self-hosted
 * server on the VPS keeps patient video off third-party infrastructure (§14.9).
 */
import "server-only";
import { AccessToken } from "livekit-server-sdk";

export const LIVEKIT_URL = process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";

/** Unguessable, stable room name for an appointment. */
export function roomNameFor(appointmentId: string): string {
  return `kardio-${appointmentId.replace(/-/g, "")}`;
}

/**
 * "Provision" a room — LiveKit needs no API call, we just reserve the name.
 * Kept async so callers are unchanged.
 */
export async function mintRoom(appointmentId: string): Promise<string> {
  return roomNameFor(appointmentId);
}

export function isVideoConfigured(): boolean {
  return Boolean(
    process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET && LIVEKIT_URL,
  );
}

/**
 * Mint a join token. `isDoctor` only affects the display name — LiveKit has no
 * "waiting for moderator" concept, so either party can start the call.
 */
export async function mintAccessToken(opts: {
  roomName: string;
  identity: string;
  displayName: string;
}): Promise<string | null> {
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!key || !secret) return null;

  const at = new AccessToken(key, secret, {
    identity: opts.identity,
    name: opts.displayName,
    ttl: "2h",
  });
  at.addGrant({
    room: opts.roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true, // in-call chat
  });
  return at.toJwt();
}
