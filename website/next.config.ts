import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Not a static export: the app now reads live data from Postgres via
  // Prisma and has POST route handlers (reviews, click tracking) that need
  // a real server runtime, which Vercel already provides for a plain
  // Next.js app - `output: 'export'` was only ever compatible with the
  // earlier CSV-only static homepage.
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Every internal link, the sitemap and canonical URLs use a trailing
  // slash (`/grooming/bratislava/`). Without this Next.js 308-redirects
  // those to the slash-less form, so crawlers hit a redirect on every
  // sitemap URL.
  trailingSlash: true,
};

export default nextConfig;
