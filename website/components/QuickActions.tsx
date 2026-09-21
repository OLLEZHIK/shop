"use client";

import type { ClickType } from "@prisma/client";

interface QuickActionsProps {
  businessId: number;
  phone: string | null;
  website: string | null;
  address: string;
  size?: "sm" | "md";
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
  "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition min-h-11 min-w-11";

export function QuickActions({ businessId, phone, website, address, size = "md" }: QuickActionsProps) {
  const padding = size === "sm" ? "px-3 py-2 text-sm" : "px-4 py-2.5";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="flex flex-wrap gap-2">
      {phone && (
        <a
          href={`tel:${phone}`}
          onClick={() => trackClick(businessId, "CALL")}
          className={`${baseButton} ${padding} bg-brand-orange text-white hover:bg-brand-orange/90`}
        >
          Call
        </a>
      )}
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackClick(businessId, "WEB")}
          className={`${baseButton} ${padding} bg-brand-blue text-white hover:bg-brand-blue/90`}
        >
          Website
        </a>
      )}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackClick(businessId, "ROUTE")}
        className={`${baseButton} ${padding} bg-gray-100 text-foreground hover:bg-gray-200`}
      >
        Route
      </a>
    </div>
  );
}
