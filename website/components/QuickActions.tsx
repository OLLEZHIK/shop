"use client";

import type { ClickType } from "@prisma/client";
import { GlobeIcon, PhoneIcon, RouteIcon } from "./icons";
import { getDictionary, type Locale } from "@/lib/i18n";

interface QuickActionsProps {
  businessId: number;
  phone: string | null;
  website: string | null;
  address: string;
  size?: "sm" | "md";
  /** "grid" = equal-width buttons filling the row (contact card). */
  layout?: "row" | "grid";
  locale: Locale;
}

function trackClick(businessId: number, type: ClickType) {
  const referrerHost = document.referrer ? safeHost(document.referrer) : null;
  fetch("/api/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      businessId,
      type,
      page: window.location.pathname,
      referrerHost,
    }),
  }).catch(() => {
    // Best-effort analytics - never block the user's navigation on this.
  });
}

function safeHost(url: string): string | null {
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

const baseButton =
  "inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-pill)] font-semibold transition min-h-11 min-w-11";

export function QuickActions({ businessId, phone, website, address, size = "md", layout = "row", locale }: QuickActionsProps) {
  const t = getDictionary(locale).actions;
  const padding = layout === "grid" ? "px-2 py-2.5 text-sm" : size === "sm" ? "px-4 py-2 text-sm" : "px-5 py-2.5";
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={layout === "grid" ? "grid auto-cols-fr grid-flow-col gap-2" : "flex flex-wrap gap-2"}>
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={() => trackClick(businessId, "CALL")}
          className={`${baseButton} ${padding} bg-brand-orange text-white hover:bg-brand-orange-deep`}
        >
          <PhoneIcon className={icon} />
          {t.call}
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(businessId, "WEB")}
          className={`${baseButton} ${padding} bg-ink text-white hover:bg-brand-blue`}
        >
          <GlobeIcon className={icon} />
          {t.website}
        </a>
      )}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(businessId, "ROUTE")}
        className={`${baseButton} ${padding} bg-surface-sunken text-foreground hover:bg-brand-blue-muted hover:text-brand-blue`}
      >
        <RouteIcon className={icon} />
        {t.route}
      </a>
    </div>
  );
}
