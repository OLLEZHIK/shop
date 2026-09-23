// Single source for the canonical site origin (sitemap, robots, JSON-LD,
// llms.txt). Overridable via env for preview deployments.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pawenn.com";

// Placeholder until the owner confirms a real, monitored inbox (same open
// item as {EMAIL} in docs/legal/*-draft.md, which also still need a real
// {OPERATOR}/{ADDRESS}). Override with NEXT_PUBLIC_CONTACT_EMAIL.
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@pawenn.com";
