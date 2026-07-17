/** Small video-camera icon used to flag the online consultation. */
export function VideoIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <rect x="2" y="6" width="13" height="12" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M15 9.5 21 6.5v11L15 14.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
