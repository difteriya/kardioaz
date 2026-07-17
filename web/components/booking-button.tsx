import Link from "next/link";
import { SITE } from "@/lib/site";
import { VideoIcon } from "./video-icon";

/**
 * Booking CTA — "Randevu al" with a video-consultation icon, used everywhere so
 * it's always clear the booking is an online video visit.
 */
export function BookingButton({
  className = "",
  label = "Randevu al",
  iconClassName = "h-4 w-4",
}: {
  className?: string;
  label?: string;
  iconClassName?: string;
}) {
  return (
    <Link
      href={SITE.bookingUrl}
      className={`inline-flex items-center justify-center gap-2 ${className}`}
    >
      <VideoIcon className={iconClassName} />
      {label}
    </Link>
  );
}
