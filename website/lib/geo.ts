// Client-safe geo helpers (no Prisma import).
export interface CityPointLite {
  slug: string;
  lat: number;
  lng: number;
}

export function distanceKmClient(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

/** Nearest city within `maxKm`, or null if the visitor is far from all. */
export function nearestCity<T extends CityPointLite>(cities: T[], lat: number, lng: number, maxKm = 60): T | null {
  let best: T | null = null;
  let bestKm = Infinity;
  for (const c of cities) {
    const km = distanceKmClient(lat, lng, c.lat, c.lng);
    if (km < bestKm) {
      best = c;
      bestKm = km;
    }
  }
  return bestKm <= maxKm ? best : null;
}
