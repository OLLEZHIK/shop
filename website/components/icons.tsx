// Small hand-authored SVG icon set, one consistent stroke weight
// (1.6px, round caps/joins), 20x20 viewBox, currentColor. Replaces the
// emoji used previously in the search flow and category display -
// emoji standing in for an icon system reads as unfinished.

type IconProps = { className?: string };

export function DogIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M5.5 5.5c-1.6-.4-3 .6-3 2.4 0 1.6 1 2.9 2.4 3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M14.5 5.5c1.6-.4 3 .6 3 2.4 0 1.6-1 2.9-2.4 3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="10" cy="10.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8" cy="9.5" r="0.9" fill="currentColor" />
      <circle cx="12" cy="9.5" r="0.9" fill="currentColor" />
      <path
        d="M8.6 12.2c0-.7.6-1.2 1.4-1.2s1.4.5 1.4 1.2-.9 1.6-1.4 1.6-1.4-.9-1.4-1.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CatIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5 4.5 6.5 8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 4.5 13.5 8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M6.5 8.8c-2 3.7-.3 6.7 3.5 6.7s5.5-3 3.5-6.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8.1" cy="10.8" r="0.9" fill="currentColor" />
      <circle cx="11.9" cy="10.8" r="0.9" fill="currentColor" />
      <path d="M9.3 12.6h1.4l-.7 1-.7-1Z" fill="currentColor" />
      <path d="M9.4 13.3 7.5 14.2M10.6 13.3l1.9.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function PawIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true">
      <ellipse cx="10" cy="13.2" rx="4.2" ry="3.4" />
      <ellipse cx="4.6" cy="8.6" rx="1.7" ry="2.1" />
      <ellipse cx="8.3" cy="5.8" rx="1.6" ry="2" />
      <ellipse cx="11.7" cy="5.8" rx="1.6" ry="2" />
      <ellipse cx="15.4" cy="8.6" rx="1.7" ry="2.1" />
    </svg>
  );
}

export function GridIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M10 17.5s5.5-5.1 5.5-9A5.5 5.5 0 1 0 4.5 8.5c0 3.9 5.5 9 5.5 9Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function StarIcon({ className, filled = true }: IconProps & { filled?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill={filled ? "currentColor" : "none"} className={className} aria-hidden="true">
      <path
        d="M10 2.8 12.4 7.7 17.8 8.5 13.9 12.3 14.8 17.7 10 15.1 5.2 17.7 6.1 12.3 2.2 8.5 7.6 7.7 10 2.8Z"
        stroke="currentColor"
        strokeWidth={filled ? "0" : "1.3"}
        strokeLinejoin="round"
      />
    </svg>
  );
}
