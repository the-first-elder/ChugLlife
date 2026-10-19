import { ReactElement } from "react";

/**
 * A tiny inline "Chog" glyph used in branded UI spots.
 */
export function LucideChogIcon({ size = 16 }: { size?: number }): ReactElement {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Chog"
    >
      <path d="M12 21C7 21 3 17.5 3 12.5 3 8 6.5 4 11 4c5 0 10 3.5 10 8.5c0 1.5-.5 2.7-1.4 3.5" />
      <circle cx="9" cy="11" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="11" r="1" fill="currentColor" stroke="none" />
      <path d="M8.5 15c1 1.2 2 1.2 3 .6s2-.6 3 .4" />
    </svg>
  );
}
