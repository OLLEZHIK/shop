// Runs before `next build` on Vercel (see "build" in package.json).
//
// - Every Vercel build applies pending migrations (`prisma migrate
//   deploy` only runs ones the database hasn't seen). The new code needs
//   its columns before it can prerender. Previews may share the live
//   database, so migrations must be additive only (new tables/nullable
//   columns; never drop or rename in the same change) - the running site
//   keeps working on the old code. See docs/database.md.
// - A brand-new database and production builds also run the seed, so
//   merged CSV changes reach the live site (upserts by slug, safe to
//   repeat). Previews never seed an existing database, so an unmerged PR
//   can't change live data.
// - Local builds (no VERCEL env): touch nothing.
import { execSync } from "child_process";
import { config as loadEnv } from "dotenv";
import { Client } from "pg";
import { directDatabaseUrl } from "../prisma/db-url";

loadEnv({ path: ".env.local" });

function run(command: string) {
  console.log(`db-setup: ${command}`);
  execSync(command, { stdio: "inherit" });
}

async function main() {
  if (!process.env.VERCEL) {
    console.log("db-setup: not a Vercel build, skipping");
    return;
  }
  const url = directDatabaseUrl();
  if (!url) {
    console.log("db-setup: no database configured, skipping");
    return;
  }

  // Host only, never the credentials: shows in the Vercel build log which
  // database this build is about to touch.
  console.log(`db-setup: database host ${new URL(url).hostname} (${process.env.VERCEL_ENV})`);
  const neonVars = Object.entries(process.env)
    .filter(([, value]) => value?.includes(".neon.tech"))
    .map(([key, value]) => `${key}${value?.includes("-pooler.") ? " (pooled)" : ""}`);
  console.log(`db-setup: Neon variables: ${neonVars.join(", ") || "none"}`);

  const client = new Client({ connectionString: url });
  await client.connect();
  const { rows } = await client.query<{ exists: boolean }>(
    `select to_regclass('public."Business"') is not null as exists`
  );
  const fresh = !rows[0].exists;

  await client.end();

  run("npx prisma migrate deploy");

  if (fresh || process.env.VERCEL_ENV === "production") {
    run("npx tsx prisma/seed.ts");
  } else {
    console.log("db-setup: preview build on an existing database, not seeding");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
