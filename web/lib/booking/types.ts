export type SlotStatus = "open" | "held" | "booked";
export type AppointmentStatus =
  | "pending"
  | "booked"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AvailabilitySlot {
  id: string;
  start_at: string;
  end_at: string;
  status: SlotStatus;
  created_at: string;
}

export interface Appointment {
  id: string;
  slot_id: string;
  patient_email: string;
  full_name: string | null;
  phone: string | null;
  status: AppointmentStatus;
  hold_expires_at: string | null;
  confirm_token: string;
  cancel_token: string;
  cancel_used: boolean;
  video_room: string | null;
  consent_version: string | null;
  payment_status: string;
  payment_id: string | null;
  notified_booked: boolean;
  notified_cancelled: boolean;
  created_at: string;
  completed_at: string | null;
}
