import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

// dotenv/config defaults to `.env`; this project follows Next.js
// convention and keeps secrets in `.env.local` instead.
loadEnv({ path: ".env.local" });

// Prisma 7 removed `datasource.url`/`directUrl` from schema.prisma in favor
// of this file. The CLI (migrate, generate, `prisma db seed`) and the
// db:seed script both need DDL support, which Prisma Postgres's pooled
// Accelerate endpoint (DATABASE_URL) doesn't provide — so this points at
// the direct connection instead. The Next.js app's own runtime Prisma
// Client (added in a later task) should use DATABASE_URL with the
// Accelerate extension for pooling; see docs/database.md.
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});
