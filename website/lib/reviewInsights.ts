// "What customers say": our summary of public Google reviews for a place
// (data/cities/<city>/review-insights/<slug>.json,
// docs/playbooks/review-insights.md).
// Display rules: docs/design-plan.md, "Сводка отзывов". Stored as JSON on
// Business.reviewInsights; parsed defensively here so one malformed file
// hides its block instead of breaking the page.

export type Sentiment = "positive" | "mixed" | "negative";
/** Text per language: English plus the city's language(s), e.g.
 *  { en, sk } for Bratislava, { en, cs } for Brno. */
type Localized = Record<string, string>;

export interface InsightCard {
  topic: string;
  sentiment: Sentiment;
  mentions: number;
  title: Localized;
  text: Localized;
}

export interface InsightFaq {
  q: Localized;
  a: Localized;
}

export interface ReviewInsights {
  googleMapsUrl: string | null;
  periodFrom: Date;
  periodTo: Date;
  reviewsInPeriod: number;
  observedAt: Date;
  cards: InsightCard[];
  faq: InsightFaq[];
}

const SENTIMENTS: Sentiment[] = ["positive", "mixed", "negative"];
/** Older summaries are hidden: the task summarises the last 6 months. */
const MAX_AGE_DAYS = 7 * 31;

/** The text exists in English and in the language being shown. */
function hasText(v: unknown, locale: string): v is Localized {
  const o = v as Localized;
  return !!o && ["en", locale].every((l) => typeof o[l] === "string" && o[l].trim() !== "");
}

function toDate(v: unknown): Date | null {
  if (typeof v !== "string") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parse for one page language: cards and FAQ without text in that
 *  language are dropped, so a page never mixes languages. */
export function parseReviewInsights(raw: unknown, locale: string, now: Date = new Date()): ReviewInsights | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const periodFrom = toDate(o.period_from);
  const periodTo = toDate(o.period_to);
  const observedAt = toDate(o.observed_at);
  const reviewsInPeriod = typeof o.reviews_in_period === "number" ? o.reviews_in_period : NaN;
  if (!periodFrom || !periodTo || !observedAt || !(reviewsInPeriod > 0)) return null;
  if (now.getTime() - observedAt.getTime() > MAX_AGE_DAYS * 24 * 3600 * 1000) return null;

  const cards = (Array.isArray(o.cards) ? o.cards : []).filter(
    (c): c is InsightCard =>
      !!c &&
      SENTIMENTS.includes((c as InsightCard).sentiment) &&
      typeof (c as InsightCard).mentions === "number" &&
      hasText((c as InsightCard).title, locale) &&
      hasText((c as InsightCard).text, locale)
  );
  const faq = (Array.isArray(o.faq) ? o.faq : []).filter(
    (f): f is InsightFaq => !!f && hasText((f as InsightFaq).q, locale) && hasText((f as InsightFaq).a, locale)
  );
  if (cards.length === 0) return null;

  const url = typeof o.google_maps_url === "string" && /^https:\/\//.test(o.google_maps_url) ? o.google_maps_url : null;
  return { googleMapsUrl: url, periodFrom, periodTo, reviewsInPeriod, observedAt, cards, faq };
}
