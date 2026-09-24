// Sorting and rating filters for listing pages (?sort=, ?rating=).
// Ratings are Google's as collected (only stored with 5+ ratings).

export const SORTS = ["rating", "reviews"] as const;
export type ListingSort = (typeof SORTS)[number];
export const MIN_RATINGS = ["4", "4.5"] as const;
export type MinRating = (typeof MIN_RATINGS)[number];

export function parseSort(value: string | undefined): ListingSort | undefined {
  return SORTS.find((s) => s === value);
}

export function parseMinRating(value: string | undefined): MinRating | undefined {
  return MIN_RATINGS.find((r) => r === value);
}

interface Rated {
  googleRating: number | null;
  googleRatingCount: number | null;
}

// "Top rated" uses a Bayesian average so 5.0 from 6 ratings doesn't beat
// 4.8 from 300: every place starts as if it had PRIOR_COUNT ratings of
// PRIOR_MEAN, and its own ratings pull it away from there.
const PRIOR_MEAN = 4.3;
const PRIOR_COUNT = 20;

export function ratingScore({ googleRating, googleRatingCount }: Rated): number {
  if (googleRating === null || googleRatingCount === null) return -Infinity;
  return (PRIOR_MEAN * PRIOR_COUNT + googleRating * googleRatingCount) / (PRIOR_COUNT + googleRatingCount);
}

/** Stable sort; places without a rating keep their order at the end. */
export function sortByListing<T>(items: T[], sort: ListingSort, get: (item: T) => Rated): T[] {
  const key = sort === "rating" ? (x: T) => ratingScore(get(x)) : (x: T) => get(x).googleRatingCount ?? -Infinity;
  return items
    .map((item, index) => ({ item, index, k: key(item) }))
    .sort((a, b) => (b.k === a.k ? a.index - b.index : b.k > a.k ? 1 : -1))
    .map((x) => x.item);
}

export function meetsMinRating(item: Rated, min: MinRating | undefined): boolean {
  return !min || (item.googleRating !== null && item.googleRating >= Number(min));
}
