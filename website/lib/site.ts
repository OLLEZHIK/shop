// Single source for the canonical site origin (sitemap, robots, JSON-LD,
// llms.txt). Overridable via env for preview deployments.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawenn.com";

// Placeholder until the project owner sets up and confirms a real,
// monitored inbox at this address (same open item as the {EMAIL}
// placeholder still in docs/legal/*-draft.md - those legal drafts also
// need a real {OPERATOR}/{ADDRESS}, which isn't this constant's call to
// invent). Replace this value once that inbox exists.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@pawenn.com";
