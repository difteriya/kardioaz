/**
 * Pulse mark — the brand's single-stroke heartbeat signature.
 * `animate` → draws once on load. `loop` → a bright pulse travels the line
 * continuously over a faint baseline (like an ECG monitor).
 */
const PATH_D =
  "M0 12 H30 L36 12 L42 4 L50 20 L58 8 L64 12 H74 L80 12 L86 6 L92 12 H120";

export function PulseMark({
  className = "",
  animate = false,
  loop = false,
  strokeWidth = 2,
}: {
  className?: string;
  animate?: boolean;
  loop?: boolean;
  strokeWidth?: number;
}) {
  return (
    <svg
      className={`${className} ${animate && !loop ? "pulse-line" : ""}`}
      viewBox="0 0 120 24"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {loop && (
        <path
          d={PATH_D}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.18}
        />
      )}
      <path
        d={PATH_D}
        className={loop ? "pulse-travel-path" : ""}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
      />
    </svg>
  );
}
