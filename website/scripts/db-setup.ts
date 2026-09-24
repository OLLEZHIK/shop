// Runs before `next build` on Vercel (see "build" in package.json).
//
// - A brand-new database (no tables yet): apply migrations and load the
//   CSVs from data/ - this is how a fresh Neon database gets filled.
// - Production builds: apply any new migrations (`prisma migrate deploy`
//   only runs migrations the database hasn't seen) and re-run the seed,
//   so merged CSV changes reach the live site. The seed upserts by slug,
//   so re-running it is safe.
// - Preview builds against an existing database: touch nothing, so an
//   unmerged PR can't migrate or reseed the live data.
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

  if (!fresh && process.env.VERCEL_ENV !== "production") {
    console.log("db-setup: preview build on an existing database, skipping");
    await client.end();
    return;
  }

  run("npx prisma migrate deploy");

  await client.end();
  run("npx tsx prisma/seed.ts");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
