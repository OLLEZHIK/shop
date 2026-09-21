import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Static export for deployment
  images: {
    unoptimized: true, // Required for static export
  },
  reactStrictMode: true,
};

export default nextConfig;
