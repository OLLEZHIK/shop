import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";
import { directDatabaseUrl } from "./prisma/db-url";

// dotenv/config defaults to `.env`; this project follows Next.js
// convention and keeps secrets in `.env.local` instead.
loadEnv({ path: ".env.local" });

// Prisma 7 removed `datasource.url`/`directUrl` from schema.prisma in favor
// of this file. The CLI (migrate, generate, `prisma db seed`) needs DDL
// support, so it uses the direct (unpooled) connection; the app itself
// uses the pooled one (lib/prisma.ts). See prisma/db-url.ts.
const url = directDatabaseUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  // `prisma generate` (postinstall) runs without any database configured.
  ...(url ? { datasource: { url } } : {}),
});
