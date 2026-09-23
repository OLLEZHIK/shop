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

// Shared wrapper for the stroke icons below - same 1.6px round-cap
// style as the icons above.
function StrokeIcon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function ScissorsIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="5.5" cy="5.5" r="2.5" />
      <circle cx="5.5" cy="14.5" r="2.5" />
      <path d="M7.6 6.9 17 14M7.6 13.1 17 6M11 10h.01" />
    </StrokeIcon>
  );
}

export function StethoscopeIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M4.5 3H3.5v4.5a4 4 0 0 0 8 0V3h-1" />
      <path d="M7.5 11.5v1a4.5 4.5 0 0 0 9 0V11" />
      <circle cx="16.5" cy="9" r="2" />
    </StrokeIcon>
  );
}

export function HotelIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M2.5 16V5M2.5 12.5h15V16M17.5 12.5V10a2.5 2.5 0 0 0-2.5-2.5H9v5" />
      <circle cx="5.8" cy="9.5" r="1.6" />
    </StrokeIcon>
  );
}

export function WhistleIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="7.5" cy="12" r="4.5" />
      <path d="M10.5 8.6 17.5 7v3.5l-5.2 1" />
      <path d="M3 5.5 4.5 7M6.5 3.5 7 5.5M10 3.5 9.2 5.4" />
    </StrokeIcon>
  );
}

export function ShopBagIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 7h12l-1 10H5L4 7Z" />
      <path d="M7 7V5.5a3 3 0 0 1 6 0V7" />
    </StrokeIcon>
  );
}

export function HeartHandIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M10 15.5S3.5 11.7 3.5 7.4A3.2 3.2 0 0 1 10 6a3.2 3.2 0 0 1 6.5 1.4c0 4.3-6.5 8.1-6.5 8.1Z" />
    </StrokeIcon>
  );
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M5.5 2.8h2.2l1.2 3.4-1.7 1.1a9.5 9.5 0 0 0 5.5 5.5l1.1-1.7 3.4 1.2v2.2a1.8 1.8 0 0 1-1.9 1.8A13.6 13.6 0 0 1 3.7 4.7a1.8 1.8 0 0 1 1.8-1.9Z" />
    </StrokeIcon>
  );
}

export function GlobeIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="10" cy="10" r="7.2" />
      <path d="M2.8 10h14.4M10 2.8c2 2.1 2.9 4.5 2.9 7.2s-.9 5.1-2.9 7.2c-2-2.1-2.9-4.5-2.9-7.2s.9-5.1 2.9-7.2Z" />
    </StrokeIcon>
  );
}

export function RouteIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m3 9.3 13.6-6.1-6.1 13.6-1.6-5.9L3 9.3Z" />
    </StrokeIcon>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M4 10h12M11.5 5.5 16 10l-4.5 4.5" />
    </StrokeIcon>
  );
}

export function MenuIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M3 6h14M3 10h14M3 14h9" />
    </StrokeIcon>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="m5 5 10 10M15 5 5 15" />
    </StrokeIcon>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M10 2.5 16 5v4.5c0 3.8-2.6 6.6-6 8-3.4-1.4-6-4.2-6-8V5l6-2.5Z" />
      <path d="m7.3 10 1.9 1.9 3.6-3.8" />
    </StrokeIcon>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="8.8" cy="8.8" r="5.3" />
      <path d="m12.8 12.8 4 4" />
    </StrokeIcon>
  );
}

export function SparkleIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M10 2.5c.6 3.8 2.2 5.4 6 6-3.8.6-5.4 2.2-6 6-.6-3.8-2.2-5.4-6-6 3.8-.6 5.4-2.2 6-6ZM16 13.5c.2 1.3.7 1.8 2 2-1.3.2-1.8.7-2 2-.2-1.3-.7-1.8-2-2 1.3-.2 1.8-.7 2-2Z" />
    </StrokeIcon>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 6v4l2.6 1.6" />
    </StrokeIcon>
  );
}

export function TagIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <path d="M2.8 10.3V3.5a.7.7 0 0 1 .7-.7h6.8l7.4 7.4a.9.9 0 0 1 0 1.3l-5.8 5.8a.9.9 0 0 1-1.3 0l-7.8-7Z" />
      <circle cx="6.6" cy="6.6" r="1.1" />
    </StrokeIcon>
  );
}

export function MailIcon({ className }: IconProps) {
  return (
    <StrokeIcon className={className}>
      <rect x="2.8" y="4.5" width="14.4" height="11" rx="2" />
      <path d="m3.5 5.5 6.5 5 6.5-5" />
    </StrokeIcon>
  );
}
