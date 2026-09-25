// Prices against the city market (owner, 2026-09-25; docs/card-spec.md,
// "Сравнение с рынком города"). Pure functions, no database: lib/data.ts
// feeds them comparable prices only (no partial, no per hour / per km).
//
// 1. Each place's price for a service = its cheapest comparable price
//    for that service (the "from" price; with weight ranges, the smallest
//    dog). Every place is measured the same way, so "from" compares with
//    "from".
// 2. Market price of a service in a city = median of those place prices,
//    only when at least MIN_PLACES places publish it. The median, not the
//    average: one hospital with an 680 € price must not move the market.
// 3. A place's price level = median of (its price / market price) over
//    every service it has a market for, shown as "+40 % above market".
// 4. € signs (like Google Maps) come from that percentage, fixed bands:
//    3 = market price (within ±7.5 %), 2 / 4 = up to 25 % below / above,
//    1 / 5 = further.

export const MIN_PLACES = 3;

/** Percent from the market price that still reads as "market price". */
export const MARKET_BAND = 7.5;
/** Beyond this percent: 1 or 5 signs. */
export const FAR_BAND = 25;

export interface ComparablePrice {
  businessId: number;
  code: string;
  priceFrom: number;
  currency: string;
}

export interface MarketPrice {
  median: number;
  /** How many places the median is based on. */
  places: number;
  currency: string;
}

export interface PriceLevel {
  /** 1-5 € signs. */
  tier: number;
  /** Rounded percent against the market: -10 = 10 % below, 40 = 40 % above. */
  pct: number;
  /** Services the level is based on. */
  services: number;
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Cheapest comparable price per place and service: businessId -> code -> price. */
function placePrices(prices: ComparablePrice[]): Map<number, Map<string, number>> {
  const byPlace = new Map<number, Map<string, number>>();
  for (const p of prices) {
    const services = byPlace.get(p.businessId) ?? new Map<string, number>();
    const current = services.get(p.code);
    if (current === undefined || p.priceFrom < current) services.set(p.code, p.priceFrom);
    byPlace.set(p.businessId, services);
  }
  return byPlace;
}

/** Market price per service code, only where MIN_PLACES places publish one. */
export function marketPrices(prices: ComparablePrice[]): Map<string, MarketPrice> {
  const byPlace = placePrices(prices);
  const currencyByCode = new Map(prices.map((p) => [p.code, p.currency]));
  const byCode = new Map<string, number[]>();
  for (const services of byPlace.values()) {
    for (const [code, price] of services) byCode.set(code, [...(byCode.get(code) ?? []), price]);
  }
  const market = new Map<string, MarketPrice>();
  for (const [code, values] of byCode) {
    if (values.length >= MIN_PLACES) {
      market.set(code, { median: median(values), places: values.length, currency: currencyByCode.get(code) ?? "EUR" });
    }
  }
  return market;
}

export function tierForPct(pct: number): number {
  if (pct < -FAR_BAND) return 1;
  if (pct < -MARKET_BAND) return 2;
  if (pct <= MARKET_BAND) return 3;
  if (pct <= FAR_BAND) return 4;
  return 5;
}

/** Percent of a price against its market price, rounded. */
export function pctAgainst(price: number, market: number): number {
  return Math.round((price / market - 1) * 100);
}

/** Price level per place: only places with at least one service that has a market price. */
export function priceLevels(prices: ComparablePrice[]): Map<number, PriceLevel> {
  const market = marketPrices(prices);
  const levels = new Map<number, PriceLevel>();
  for (const [businessId, services] of placePrices(prices)) {
    const ratios = [...services]
      .filter(([code]) => market.has(code))
      .map(([code, price]) => price / market.get(code)!.median);
    if (ratios.length === 0) continue;
    const pct = Math.round((median(ratios) - 1) * 100);
    levels.set(businessId, { tier: tierForPct(pct), pct, services: ratios.length });
  }
  return levels;
}
