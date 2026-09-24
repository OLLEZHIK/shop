import { getDictionary, type Locale } from "@/lib/i18n";
import { StarIcon } from "./icons";

// Google Maps rating as observed by our collectors: "★ 4.8 (127 · Google)".
// Always labelled Google (it is their number, not ours), and only stored
// when a place has 5+ ratings (prisma/seed.ts).
export function GoogleRating({
  rating,
  count,
  locale,
  href = null,
  className = "",
}: {
  rating: number;
  count: number;
  locale: Locale;
  /** Link to the place on Google Maps (detail page); none on cards. */
  href?: string | null;
  className?: string;
}) {
  const t = getDictionary(locale).rating;
  const value = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rating);
  const content = (
    <>
      <StarIcon className="h-4 w-4 text-brand-amber" />
      <span className="font-semibold text-foreground">{value}</span>
      <span>({t.countGoogle(new Intl.NumberFormat(locale).format(count))})</span>
    </>
  );
  const classes = `inline-flex items-center gap-1 ${className}`;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={t.aria(value, count)} className={`${classes} hover:underline`}>
      {content}
    </a>
  ) : (
    <span role="img" aria-label={t.aria(value, count)} className={classes}>
      {content}
    </span>
  );
}
