// Which Postgres to connect to. Production runs on Neon (connected to
// the Vercel project through Storage -> Neon); the integration names its
// variables after whatever prefix was picked when connecting it, so we
// look for Neon by host instead of by variable name. Neon's pooled
// endpoint has "-pooler" in the host: the app uses that one, migrations
// and the seed need the direct one. Locally (no Neon variables) it falls
// back to DATABASE_URL / DIRECT_URL from .env.local. See docs/database.md.

function isPostgres(value: string | undefined): value is string {
  return !!value && /^postgres(ql)?:\/\//.test(value);
}

// Neon's integration also adds *_NO_SSL variants, which Neon refuses
// ("denied access"), so those are skipped and SSL is forced on the rest.
function neonUrls(): string[] {
  return Object.entries(process.env)
    .filter(([key, value]) => !key.includes("NO_SSL") && isPostgres(value) && value.includes(".neon.tech"))
    .map(([, value]) => {
      const url = new URL(value as string);
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    });
}

/** Pooled connection for the running app. */
export function pooledDatabaseUrl(): string | undefined {
  const neon = neonUrls();
  return (
    neon.find((url) => url.includes("-pooler.")) ??
    neon[0] ??
    [process.env.DATABASE_URL, process.env.DIRECT_URL].find(isPostgres)
  );
}

/** Direct (unpooled) connection for migrations and the seed. */
export function directDatabaseUrl(): string | undefined {
  const neon = neonUrls();
  return (
    neon.find((url) => !url.includes("-pooler.")) ??
    neon[0] ??
    [process.env.DIRECT_URL, process.env.DATABASE_URL].find(isPostgres)
  );
}
