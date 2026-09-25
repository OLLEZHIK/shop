# Seed fixtures

Two made-up cities in the `data/cities/<city>/` format (docs/playbooks/add-city.md,
docs/card-spec.md) for testing `prisma/seed.ts` without real data. It covers
districts from polygons (including a hole), a split `businesses-*.csv`,
opening hours, vet fields, prices with weight ranges and the validation
warnings (bad hours, unknown specialty, rating under 5, missing logo,
wrong price code, price without source).

- `testville` — SK, Slovak + English, Europe/Bratislava, EUR;
- `testburg` — US, English only, America/New_York, USD. Its districts
  reuse testville's slugs, to check that same-named districts in two
  cities stay apart (docs/architecture/multi-city.md §7).

Run it against a **separate local database**, never Neon:

```
DATABASE_URL=postgres://…/pawenn_test DIRECT_URL=postgres://…/pawenn_test \
SEED_CITIES_DIR=prisma/fixtures/cities SEED_LOGOS_DIR=prisma/fixtures/logos \
npx tsx prisma/seed.ts
```
