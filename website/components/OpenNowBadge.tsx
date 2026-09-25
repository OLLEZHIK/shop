"use client";

import { useEffect, useState } from "react";
import { hoursFromStored, isOpenAt, localNow } from "@/lib/hours";

// "Open now" / "Closed now" in the place's own time zone. Computed in the
// browser (pages are cached, so a server-rendered status would go stale);
// renders nothing until mounted, and nothing when we can't tell.
export function OpenNowBadge({
  hours,
  timeZone,
  openLabel,
  closedLabel,
  className = "",
}: {
  hours: unknown;
  timeZone: string;
  openLabel: string;
  closedLabel: string;
  className?: string;
}) {
  const [open, setOpen] = useState<boolean | null>(null);
  useEffect(() => {
    const parsed = hoursFromStored(hours);
    const update = () => setOpen(isOpenAt(parsed, localNow(timeZone)));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [hours, timeZone]);

  if (open === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-semibold ${
        open ? "bg-brand-green/10 text-brand-green" : "bg-foreground/5 text-foreground/60"
      } ${className}`}
    >
      <span className={`h-2 w-2 rounded-full ${open ? "bg-brand-green" : "bg-foreground/40"}`} aria-hidden="true" />
      {open ? openLabel : closedLabel}
    </span>
  );
}
