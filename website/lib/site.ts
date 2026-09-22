// Single source for the canonical site origin (sitemap, robots, JSON-LD,
// llms.txt). Overridable via env for preview deployments.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawenn.com";
