import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// AI/answer-engine crawlers explicitly allowed, not blocked - decision
// 2026-09-21, docs/design-plan.md section 8 (GEO/AEO).
const AI_CRAWLERS = ["GPTBot", "ClaudeBot", "anthropic-ai", "Google-Extended", "PerplexityBot", "CCBot"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
