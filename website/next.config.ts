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
};

export default nextConfig;
