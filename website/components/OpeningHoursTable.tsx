import { DAYS, formatMinutes, hoursFromStored } from "@/lib/hours";
import { formatDate, getDictionary, type Locale } from "@/lib/i18n";
import { ClockIcon } from "./icons";
import { OpenNowBadge } from "./OpenNowBadge";

// Opening hours by day (lib/hours.ts), with the live open/closed badge.
// Days we have no data for are left out.
export function OpeningHoursTable({
  hours,
  timeZone,
  locale,
  sourceUrl,
  observedAt,
}: {
  hours: unknown;
  timeZone: string;
  locale: Locale;
  sourceUrl: string | null;
  observedAt: Date | null;
}) {
  const parsed = hoursFromStored(hours);
  if (!parsed) return null;
  const t = getDictionary(locale).business;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground/50">
          <ClockIcon className="h-4 w-4" />
          {t.openingHours}
        </p>
        <OpenNowBadge hours={hours} timeZone={timeZone} openLabel={t.openNow} closedLabel={t.closedNow} />
      </div>
      <dl className="mt-2 divide-y divide-line text-sm">
        {DAYS.filter((d) => parsed[d]).map((day) => {
          const h = parsed[day]!;
          const value =
            h.kind === "closed"
              ? t.closedDay
              : h.kind === "24h"
                ? t.allDay
                : h.kind === "by-appointment"
                  ? t.byAppointment
                  : h.intervals.map(([a, b]) => `${formatMinutes(a)}–${formatMinutes(b)}`).join(", ");
          return (
            <div key={day} className="flex justify-between gap-4 py-2">
              <dt className="text-foreground/60">{t.days[day]}</dt>
              <dd className={`text-right font-medium ${h.kind === "closed" ? "text-foreground/45" : "text-foreground"}`}>
                {value}
              </dd>
            </div>
          );
        })}
      </dl>
      {observedAt && (
        <p className="mt-2 text-xs text-foreground/45">
          {t.hoursChecked(formatDate(observedAt, locale))}
          {sourceUrl && (
            <>
              {" · "}
              <a href={sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="hover:underline">
                {t.source.replace(/:$/, "")}
              </a>
            </>
          )}
        </p>
      )}
    </div>
  );
}
