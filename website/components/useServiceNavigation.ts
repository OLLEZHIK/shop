"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessCategory } from "@prisma/client";
import { listingPath } from "@/lib/categories";
import { nearestCity, type CityPointLite } from "@/lib/geo";
import type { Locale } from "@/lib/i18n";

/**
 * Opening a service from the Browse menu asks for the visitor's location:
 * we pick the nearest city we cover and open that city's list sorted by
 * distance (?near=lat,lng). Denied, unavailable, slow (6 s) or far from
 * every city -> the default city's list, unsorted. The plain href stays
 * on the link, so this is progressive enhancement over a normal link.
 */
export function useServiceNavigation(
  locale: Locale,
  cities: CityPointLite[],
  defaultCitySlug: string,
  onNavigate?: () => void
) {
  const router = useRouter();
  const [pending, setPending] = useState<BusinessCategory | null>(null);

  function open(category: BusinessCategory, e?: React.MouseEvent) {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0)) return; // new tab etc.
    e?.preventDefault();

    const fallback = () => {
      setPending(null);
      onNavigate?.();
      router.push(listingPath(locale, category, defaultCitySlug));
    };
    if (!("geolocation" in navigator) || cities.length === 0) return fallback();

    setPending(category);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const city = nearestCity(cities, latitude, longitude);
        setPending(null);
        if (!city) return fallback();
        onNavigate?.();
        router.push(
          `${listingPath(locale, category, city.slug)}?near=${latitude.toFixed(4)},${longitude.toFixed(4)}`
        );
      },
      fallback,
      { timeout: 6000, maximumAge: 10 * 60 * 1000 }
    );
  }

  return { open, pending };
}
