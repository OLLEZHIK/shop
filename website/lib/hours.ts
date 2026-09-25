// opening_hours as collected by agents (tasks/mac-collect-hours-and-
// vet-services.md, docs/card-spec.md):
//   "mo 08:00-12:00,14:00-19:00; tu 08:00-19:00; ...; su closed"
// per day: intervals, "closed", "24h" or "by-appointment"; a day we know
// nothing about is simply absent. The whole value may also be just
// "24h", "closed" or "by-appointment".

export const DAYS = ["mo", "tu", "we", "th", "fr", "sa", "su"] as const;
export type Day = (typeof DAYS)[number];

export type DayHours =
  | { kind: "intervals"; intervals: [number, number][] } // minutes from midnight
  | { kind: "closed" }
  | { kind: "24h" }
  | { kind: "by-appointment" };

export type OpeningHours = Partial<Record<Day, DayHours>>;

const WHOLE: Record<string, DayHours> = {
  "24h": { kind: "24h" },
  closed: { kind: "closed" },
  "by-appointment": { kind: "by-appointment" },
};

function minutes(hhmm: string): number | null {
  const m = /^([01]\d|2[0-4]):([0-5]\d)$/.exec(hhmm);
  if (!m) return null;
  const v = Number(m[1]) * 60 + Number(m[2]);
  return v <= 24 * 60 ? v : null;
}

function parseDay(spec: string): DayHours | null {
  const s = spec.trim();
  if (WHOLE[s]) return WHOLE[s];
  const intervals: [number, number][] = [];
  for (const part of s.split(",")) {
    const [a, b] = part.trim().split("-");
    const from = a ? minutes(a) : null;
    const to = b ? minutes(b) : null;
    if (from === null || to === null || from >= to) return null;
    intervals.push([from, to]);
  }
  return intervals.length ? { kind: "intervals", intervals } : null;
}

/** Parsed hours, or an error message saying what's wrong (for the seed). */
export function parseOpeningHours(raw: string | null | undefined): { hours: OpeningHours | null; error?: string } {
  const value = (raw ?? "").trim();
  if (!value) return { hours: null };
  if (WHOLE[value]) return { hours: Object.fromEntries(DAYS.map((d) => [d, WHOLE[value]])) };
  const hours: OpeningHours = {};
  for (const chunk of value.split(";")) {
    const c = chunk.trim();
    if (!c) continue;
    const [day, ...rest] = c.split(/\s+/);
    if (!(DAYS as readonly string[]).includes(day)) return { hours: null, error: `unknown day "${day}"` };
    const parsed = parseDay(rest.join(" "));
    if (!parsed) return { hours: null, error: `bad hours for ${day}: "${rest.join(" ")}"` };
    hours[day as Day] = parsed;
  }
  return Object.keys(hours).length ? { hours } : { hours: null, error: "empty" };
}

/** Hours from the stored value (the raw string kept in Business.openingHours). */
export function hoursFromStored(stored: unknown): OpeningHours | null {
  return typeof stored === "string" ? parseOpeningHours(stored).hours : null;
}

/** The city's IANA time zone (City.timezone from city.json; the seed
 *  requires it). "UTC" only if a place somehow has no city. */
export function cityTimezone(city: { timezone?: string | null } | null | undefined): string {
  return city?.timezone ?? "UTC";
}

/** Day of week and minutes since midnight in the city's time zone. */
export function localNow(timeZone: string, now: Date = new Date()): { day: Day; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = get("weekday").slice(0, 2).toLowerCase() as Day;
  return { day, minute: Number(get("hour")) * 60 + Number(get("minute")) };
}

/** true / false, or null when we can't tell (no data for today, by appointment). */
export function isOpenAt(hours: OpeningHours | null, at: { day: Day; minute: number }): boolean | null {
  if (!hours) return null;
  const today = hours[at.day];
  if (today?.kind === "24h") return true;
  if (today?.kind === "closed") return false;
  if (today?.kind === "intervals" && today.intervals.some(([a, b]) => at.minute >= a && at.minute < b)) return true;
  // Still open past midnight from yesterday's "22:00-24:00"-style runs isn't
  // modelled: the format has no overnight intervals.
  if (today?.kind === "intervals") return false;
  return null;
}

export function formatMinutes(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}
