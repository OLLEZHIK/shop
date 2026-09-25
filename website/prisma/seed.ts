import crypto from "crypto";
import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";
import Papa from "papaparse";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, BusinessCategory } from "@prisma/client";
import { directDatabaseUrl } from "./db-url";
import { SERVICES, findService, serviceSlug } from "../lib/services";
import { parseOpeningHours } from "../lib/hours";
import { inMultiPolygon } from "../lib/pointInPolygon";
import { VET_SPECIALTIES } from "../lib/vet";

loadEnv({ path: path.join(process.cwd(), ".env.local"), quiet: true });

const adapter = new PrismaPg({ connectionString: directDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

// data/ at the repo root, not website/data/ (that's a stale duplicate copy).
const DATA_DIR = path.join(process.cwd(), "..", "data");
// SEED_CITIES_DIR points the seed at test fixtures instead of data/cities.
const CITIES_DIR = process.env.SEED_CITIES_DIR ?? path.join(DATA_DIR, "cities");
// Logos are checked on disk; fixtures bring their own (SEED_LOGOS_DIR) so
// nothing test-only ships in public/.
const LOGOS_DIR = process.env.SEED_LOGOS_DIR ?? path.join(process.cwd(), "public", "logos");

const CATEGORIES = Object.values(BusinessCategory);

type CsvRow = Record<string, string>;

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<CsvRow>(content, { header: true, skipEmptyLines: true });
  if (result.errors.length > 0) {
    throw new Error(`Failed to parse ${filePath}: ${JSON.stringify(result.errors)}`);
  }
  return result.data;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullableString(value: string | undefined): string | null {
  if (value === undefined || value === null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function parseList(value: string | undefined): string[] {
  return (value ?? "")
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean);
}

function parseNullableFloat(value: string | undefined): number | null {
  if (value === undefined || value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseNullableInt(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : null;
}

function parseNullableDate(value: string | undefined): Date | null {
  if (!value || value.trim() === "") return null;
  const d = new Date(value.trim());
  return Number.isNaN(d.getTime()) ? null : d;
}

const yes = (value: string | undefined) => (value ?? "").trim().toLowerCase() === "yes";

// ---------------------------------------------------------------------
// Report (printed at the end, pasted into PRs)
// ---------------------------------------------------------------------
interface CityReport {
  businesses: number;
  skipped: number;
  byCategory: Record<string, number>;
  withDistrict: number;
  withHours: number;
  withInsights: number;
  prices: number;
  businessesWithPrices: number;
  warnings: string[];
}

const reports = new Map<string, CityReport>();
function report(city: string): CityReport {
  if (!reports.has(city)) {
    reports.set(city, {
      businesses: 0,
      skipped: 0,
      byCategory: {},
      withDistrict: 0,
      withHours: 0,
      withInsights: 0,
      prices: 0,
      businessesWithPrices: 0,
      warnings: [],
    });
  }
  return reports.get(city)!;
}

// Business slugs are page URLs (/business/<slug>/): unique across cities.
const slugOwner = new Map<string, string>();
function claimSlug(slug: string, city: string, file: string) {
  const owner = slugOwner.get(slug);
  if (owner) {
    throw new Error(`Duplicate business slug "${slug}": ${owner} and ${city} (${file}). Slugs must be unique across all cities.`);
  }
  slugOwner.set(slug, `${city} (${file})`);
}

// ---------------------------------------------------------------------
// Shared row -> Business fields (legacy Bratislava CSVs and new
// data/cities/*/businesses*.csv use the same column names; see
// docs/card-spec.md).
// ---------------------------------------------------------------------
function businessFields(row: CsvRow, citySlug: string, rep: CityReport, logoDir: string | null) {
  const rating = parseNullableFloat(row.google_rating);
  const ratingCount = parseNullableInt(row.google_rating_count);
  // Guard the "5+ ratings or nothing" rule here too, not only in the data.
  const showRating = rating !== null && ratingCount !== null && ratingCount >= 5;
  const name = row.name.trim();

  const logo = nullableString(row.logo_file);
  let logoFile: string | null = null;
  if (logo && /^[\w.-]+$/.test(logo)) {
    const rel = logoDir ? `${logoDir}/${logo}` : logo;
    if (fs.existsSync(path.join(LOGOS_DIR, rel))) logoFile = rel;
    else rep.warnings.push(`${name}: logo file not found: public/logos/${rel}`);
  }

  const rawHours = nullableString(row.opening_hours);
  const { hours, error } = parseOpeningHours(rawHours);
  if (error) rep.warnings.push(`${name}: opening_hours ignored (${error})`);
  if (hours) rep.withHours++;

  const specialties = parseList(row.specialties).filter((s) => {
    const ok = (VET_SPECIALTIES as readonly string[]).includes(s);
    if (!ok) rep.warnings.push(`${name}: unknown specialty "${s}"`);
    return ok;
  });

  return {
    name,
    address: row.address ?? "",
    lat: parseNullableFloat(row.lat),
    lng: parseNullableFloat(row.lng),
    phone: nullableString(row.phone),
    email: nullableString(row.email),
    website: nullableString(row.website),
    instagram: nullableString(row.instagram),
    facebook: nullableString(row.facebook),
    animals: parseList(row.animals),
    description: nullableString(row.description),
    descriptionLocal: nullableString(row.description_local),
    shortDescription: nullableString(row.short_description),
    // Legacy Bratislava files call the local text *_sk.
    shortDescriptionLocal: nullableString(row.short_description_local ?? row.short_description_sk),
    openingHours: hours && rawHours ? rawHours : Prisma.DbNull,
    hoursSourceUrl: nullableString(row.hours_source_url),
    hoursObservedAt: parseNullableDate(row.hours_observed_at),
    emergency247: yes(row.emergency_24_7),
    emergencyNote: nullableString(row.emergency_note),
    homeVisits: yes(row.home_visits),
    specialties,
    languagesSpoken: parseList(row.languages_spoken).map((l) => l.toLowerCase()),
    photoUrls: parseList(row.photo_urls).filter((u) => /^https:\/\//.test(u)),
    logoFile,
    googlePlaceId: nullableString(row.google_place_id),
    googleMapsUrl: nullableString(row.google_maps_url),
    googleRating: showRating ? rating : null,
    googleRatingCount: showRating ? ratingCount : null,
    ratingObservedAt: parseNullableDate(row.rating_observed_at),
    status: "PUBLISHED" as const,
    sourceUrls: nullableString(row.source_url) ? [row.source_url.trim()] : [],
    notes: nullableString(row.notes),
  };
}

// "What customers say" summaries, one JSON file per business slug
// (tasks/ide-review-insights.md). Validated again when rendered.
function readReviewInsights(dir: string, slug: string, rep: CityReport): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const file = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(file)) return Prisma.DbNull;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (data?.slug !== slug) {
      rep.warnings.push(`review insights: slug mismatch in ${slug}.json, skipped`);
      return Prisma.DbNull;
    }
    rep.withInsights++;
    return data;
  } catch (e) {
    rep.warnings.push(`review insights: invalid JSON in ${slug}.json, skipped (${(e as Error).message})`);
    return Prisma.DbNull;
  }
}

// ---------------------------------------------------------------------
// Districts: polygons from data/cities/<city>/districts.geojson
// (scripts/fetch-districts.ts). A business's district is the polygon its
// coordinates fall in; no coordinates or no polygons -> no district.
// ---------------------------------------------------------------------
interface DistrictShape {
  id: number;
  slug: string;
  coordinates: number[][][][];
}

async function seedDistricts(cityId: number, citySlug: string): Promise<DistrictShape[]> {
  const file = path.join(CITIES_DIR, citySlug, "districts.geojson");
  if (!fs.existsSync(file)) return [];
  const geo = JSON.parse(fs.readFileSync(file, "utf-8")) as {
    features: { properties: { name: string; slug: string }; geometry: { type: string; coordinates: number[][][][] } }[];
  };
  return inBatches(geo.features, BATCH, async (f) => {
    const { name, slug } = f.properties;
    const district = await prisma.district.upsert({
      where: { cityId_slug: { cityId, slug } },
      update: { name },
      create: { name, slug, cityId },
    });
    return { id: district.id, slug, coordinates: f.geometry.coordinates };
  });
}

function districtFor(shapes: DistrictShape[], lat: number | null, lng: number | null): DistrictShape | null {
  if (lat === null || lng === null) return null;
  return shapes.find((s) => inMultiPolygon(lng, lat, s.coordinates)) ?? null;
}

// ---------------------------------------------------------------------
// Services: the 6 priced services per category (lib/services.ts).
// ---------------------------------------------------------------------
async function seedServices(): Promise<Map<string, number>> {
  const ids = new Map<string, number>();
  const defs = (Object.entries(SERVICES) as [BusinessCategory, typeof SERVICES.GROOMING][]).flatMap(([category, list]) =>
    (list ?? []).map((def) => ({ category, def }))
  );
  await inBatches(defs, BATCH, async ({ category, def }) => {
    const slug = serviceSlug(category, def.code);
    const s = await prisma.service.upsert({
      where: { slug },
      update: { name: def.en, code: def.code, category },
      create: { name: def.en, slug, code: def.code, category },
    });
    ids.set(slug, s.id);
  });
  return ids;
}

// prices.csv (docs/card-spec.md, "Цены"): replaces the city's price rows.
// unit, partial, note, note_local are optional columns (added 2026-09-25).
const PRICE_UNITS = ["per_hour", "per_km"];
async function seedPrices(
  citySlug: string,
  businesses: Map<string, { id: number; category: BusinessCategory }>,
  serviceIds: Map<string, number>,
  rep: CityReport
) {
  const file = path.join(CITIES_DIR, citySlug, "prices.csv");
  if (!fs.existsSync(file)) return;
  const rows = parseCsv(file);
  const data: Prisma.PriceItemCreateManyInput[] = [];
  for (const row of rows) {
    const slug = nullableString(row.business_slug);
    const code = nullableString(row.price_code);
    const business = slug ? businesses.get(slug) : undefined;
    const where = `${slug ?? "?"} ${code ?? "?"}`;
    if (!business) {
      rep.warnings.push(`prices: unknown business_slug (${where})`);
      continue;
    }
    if (!code || !findService(business.category, code)) {
      rep.warnings.push(`prices: price_code not allowed for ${business.category} (${where})`);
      continue;
    }
    const priceFrom = parseNullableFloat(row.price_from);
    const sourceUrl = nullableString(row.source_url);
    const observedAt = parseNullableDate(row.observed_at);
    if (priceFrom === null || !sourceUrl || !observedAt) {
      rep.warnings.push(`prices: missing price_from, source_url or observed_at (${where})`);
      continue;
    }
    const unit = nullableString(row.unit);
    if (unit && !PRICE_UNITS.includes(unit)) {
      rep.warnings.push(`prices: unknown unit "${unit}" (${where})`);
      continue;
    }
    const partial = nullableString(row.partial)?.toLowerCase() === "yes";
    const note = nullableString(row.note);
    const noteLocal = nullableString(row.note_local);
    if (partial && (!note || !noteLocal)) rep.warnings.push(`prices: partial=yes without note / note_local (${where})`);
    data.push({
      businessId: business.id,
      unit,
      partial,
      note,
      noteLocal,
      serviceId: serviceIds.get(serviceSlug(business.category, code))!,
      weightFromKg: parseNullableFloat(row.weight_from_kg),
      weightToKg: parseNullableFloat(row.weight_to_kg),
      priceFrom,
      priceTo: parseNullableFloat(row.price_to),
      currency: nullableString(row.currency) ?? "EUR",
      sourceUrl,
      observedAt,
    });
  }
  const ids = [...businesses.values()].map((b) => b.id);
  await prisma.priceItem.deleteMany({ where: { businessId: { in: ids } } });
  await prisma.priceItem.createMany({ data });
  rep.prices = data.length;
  rep.businessesWithPrices = new Set(data.map((d) => d.businessId)).size;
}

// ---------------------------------------------------------------------
// data/cities/<city>/ (docs/playbooks/add-city.md)
// ---------------------------------------------------------------------
interface CityJson {
  name: string;
  slug: string;
  country: string;
  /** Main local language (ISO 639-1). */
  locale: string;
  /** All local languages, main first (defaults to [locale]); English is always added by the site. */
  locales?: string[];
  lat?: number;
  lng?: number;
  /** IANA time zone, e.g. "Europe/Vienna" - "Open now" is judged in it. */
  timezone?: string;
  /** ISO 4217, e.g. "EUR", "CZK", "USD". */
  currency?: string;
  /** "in <city>" per language: {"en": "in Košice", "sk": "v Košiciach"}. */
  in_city?: Record<string, string>;
}

// City settings shared by city.json and the legacy Bratislava path; see
// docs/architecture/multi-city.md for what each field drives.
function cityData(meta: CityJson) {
  const locales = (meta.locales?.length ? meta.locales : [meta.locale]).map((l) => l.toLowerCase());
  if (!meta.timezone) throw new Error(`${meta.slug}/city.json: "timezone" is required (e.g. "Europe/Vienna")`);
  if (!meta.currency) throw new Error(`${meta.slug}/city.json: "currency" is required (e.g. "EUR")`);
  try {
    new Intl.DateTimeFormat("en", { timeZone: meta.timezone });
  } catch {
    throw new Error(`${meta.slug}/city.json: unknown time zone "${meta.timezone}"`);
  }
  return {
    name: meta.name,
    country: meta.country.toUpperCase(),
    locale: locales[0],
    locales,
    lat: meta.lat ?? null,
    lng: meta.lng ?? null,
    timezone: meta.timezone,
    currency: meta.currency.toUpperCase(),
    inPhrases: meta.in_city ?? { en: `in ${meta.name}` },
  };
}

// Business slugs are URLs (/business/<slug>/), unique across all cities.
// Checked for every city before writing anything, including cities the
// seed skips as unchanged, so a new city can't take over another city's
// business.
function claimCitySlugs(citySlug: string) {
  const dir = path.join(CITIES_DIR, citySlug);
  for (const file of fs.readdirSync(dir).filter((f) => /^businesses.*\.csv$/.test(f)).sort()) {
    for (const row of parseCsv(path.join(dir, file))) {
      const slug = nullableString(row.slug);
      if (slug) claimSlug(slug, citySlug, file);
    }
  }
}

// Everything a city's rows are built from: its data folder, its logos
// and the seed code itself (a code change reseeds every city).
const SEED_CODE = ["prisma/seed.ts", "lib/services.ts", "lib/hours.ts", "lib/pointInPolygon.ts", "lib/vet.ts"];

function filesUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? filesUnder(path.join(dir, e.name)) : [path.join(dir, e.name)]))
    .sort();
}

function cityHash(citySlug: string): string {
  const hash = crypto.createHash("sha256");
  for (const file of SEED_CODE) hash.update(file).update(fs.readFileSync(path.join(process.cwd(), file)));
  for (const file of filesUnder(path.join(CITIES_DIR, citySlug))) {
    hash.update(path.relative(CITIES_DIR, file)).update(fs.readFileSync(file));
  }
  // Only which logos exist matters to the seed, not their bytes.
  for (const file of filesUnder(path.join(LOGOS_DIR, citySlug))) hash.update(path.relative(LOGOS_DIR, file));
  return hash.digest("hex");
}

// Runs async work over items, `size` at a time: the database is far away
// from the build machine, so one write after another is slow.
async function inBatches<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += size) out.push(...(await Promise.all(items.slice(i, i + size).map(fn))));
  return out;
}

const BATCH = 10;

async function seedCity(citySlug: string, serviceIds: Map<string, number>, hash: string) {
  const dir = path.join(CITIES_DIR, citySlug);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, "city.json"), "utf-8")) as CityJson;
  if (meta.slug !== citySlug) throw new Error(`${dir}/city.json: slug "${meta.slug}" doesn't match the folder name`);
  const rep = report(citySlug);

  const settings = cityData(meta);
  const city = await prisma.city.upsert({
    where: { slug: citySlug },
    update: settings,
    create: { ...settings, slug: citySlug },
  });
  const shapes = await seedDistricts(city.id, citySlug);

  const files = fs.readdirSync(dir).filter((f) => /^businesses.*\.csv$/.test(f)).sort();
  const seeded = new Map<string, { id: number; category: BusinessCategory }>();
  const rows: { slug: string; category: BusinessCategory; data: Omit<Prisma.BusinessUncheckedCreateInput, "slug"> }[] = [];
  for (const file of files) {
    for (const row of parseCsv(path.join(dir, file))) {
      const name = nullableString(row.name);
      const slug = nullableString(row.slug);
      const category = nullableString(row.category) as BusinessCategory | null;
      if (!name || !slug) {
        rep.skipped++;
        rep.warnings.push(`${file}: row without name or slug skipped (${name ?? slug ?? "?"})`);
        continue;
      }
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) throw new Error(`${citySlug}/${file}: invalid slug "${slug}"`);
      if (!category || !CATEGORIES.includes(category)) {
        rep.skipped++;
        rep.warnings.push(`${name}: unknown category "${row.category}", skipped`);
        continue;
      }
      if (!nullableString(row.phone) && !nullableString(row.email) && !nullableString(row.website)) {
        rep.skipped++;
        rep.warnings.push(`${name}: no phone, email or website, skipped`);
        continue;
      }
      const fields = businessFields(row, citySlug, rep, citySlug);
      const district = districtFor(shapes, fields.lat, fields.lng);
      if (district) rep.withDistrict++;
      const reviewInsights = readReviewInsights(path.join(dir, "review-insights"), slug, rep);
      const data = { ...fields, category, cityId: city.id, districtId: district?.id ?? null, reviewInsights };
      rows.push({ slug, category, data });
      rep.businesses++;
      rep.byCategory[category] = (rep.byCategory[category] ?? 0) + 1;
    }
  }
  await inBatches(rows, BATCH, async ({ slug, category, data }) => {
    const b = await prisma.business.upsert({ where: { slug }, update: data, create: { ...data, slug } });
    seeded.set(slug, { id: b.id, category });
  });
  await seedPrices(citySlug, seeded, serviceIds, rep);
  // Last, so a seed that fails halfway is retried on the next build.
  await prisma.city.update({ where: { id: city.id }, data: { seedHash: hash } });
}

// ---------------------------------------------------------------------
// Legacy Bratislava (data/*-bratislava.csv), used until the orchestrator
// moves Bratislava to data/cities/bratislava/ (city.json). Districts still
// come from the CSV here; the polygon district is only compared and
// reported, so the switch shows exactly which places would move.
// ---------------------------------------------------------------------
const LEGACY_FILES: { file: string; category: BusinessCategory | "FROM_COLUMN" }[] = [
  { file: "salons-bratislava.csv", category: "GROOMING" },
  { file: "vet-clinics-bratislava.csv", category: "VET_CLINIC" },
  { file: "pet-hotels-bratislava.csv", category: "PET_HOTEL" },
  { file: "other-pet-services-bratislava.csv", category: "FROM_COLUMN" },
];
const LEGACY_OTHER: Record<string, BusinessCategory> = { shop: "PET_SHOP", training: "DOG_TRAINING", sitting: "PET_SITTING" };
const LEGACY_DISTRICTS: { name: string; slug: string }[] = [
  { name: "Staré Mesto", slug: "stare-mesto" },
  { name: "Ružinov", slug: "ruzinov" },
  { name: "Vrakuňa", slug: "vrakuna" },
  { name: "Podunajské Biskupice", slug: "podunajske-biskupice" },
  { name: "Nové Mesto", slug: "nove-mesto" },
  { name: "Rača", slug: "raca" },
  { name: "Vajnory", slug: "vajnory" },
  { name: "Karlova Ves", slug: "karlova-ves" },
  { name: "Dúbravka", slug: "dubravka" },
  { name: "Lamač", slug: "lamac" },
  { name: "Devín", slug: "devin" },
  { name: "Devínska Nová Ves", slug: "devinska-nova-ves" },
  { name: "Záhorská Bystrica", slug: "zahorska-bystrica" },
  { name: "Petržalka", slug: "petrzalka" },
  { name: "Jarovce", slug: "jarovce" },
  { name: "Rusovce", slug: "rusovce" },
  { name: "Čunovo", slug: "cunovo" },
];

async function seedLegacyBratislava() {
  const rep = report("bratislava (legacy data/*-bratislava.csv)");
  const settings = cityData({
    name: "Bratislava",
    slug: "bratislava",
    country: "SK",
    locale: "sk",
    lat: 48.1486,
    lng: 17.1077,
    timezone: "Europe/Bratislava",
    currency: "EUR",
    in_city: { en: "in Bratislava", sk: "v Bratislave" },
  });
  const city = await prisma.city.upsert({
    where: { slug: "bratislava" },
    update: settings,
    create: { ...settings, slug: "bratislava" },
  });
  const districtIds = new Map<string, number>();
  for (const d of LEGACY_DISTRICTS) {
    const district = await prisma.district.upsert({
      where: { cityId_slug: { cityId: city.id, slug: d.slug } },
      update: { name: d.name },
      create: { name: d.name, slug: d.slug, cityId: city.id },
    });
    districtIds.set(d.slug, district.id);
  }
  // Polygons (if fetched) only for the comparison report.
  const geoFile = path.join(CITIES_DIR, "bratislava", "districts.geojson");
  const shapes: DistrictShape[] = fs.existsSync(geoFile)
    ? (JSON.parse(fs.readFileSync(geoFile, "utf-8")).features as {
        properties: { slug: string };
        geometry: { coordinates: number[][][][] };
      }[]).map((f) => ({ id: 0, slug: f.properties.slug, coordinates: f.geometry.coordinates }))
    : [];
  const districtDiffs: string[] = [];

  const used = new Set<string>();
  for (const source of LEGACY_FILES) {
    for (const row of parseCsv(path.join(DATA_DIR, source.file))) {
      const name = nullableString(row.name);
      if (!name) continue;
      if (!nullableString(row.phone) && !nullableString(row.email) && !nullableString(row.website)) {
        rep.skipped++;
        continue;
      }
      const category = source.category === "FROM_COLUMN" ? LEGACY_OTHER[row.category?.trim() ?? ""] : source.category;
      if (!category) {
        rep.skipped++;
        continue;
      }
      const districtSlug = nullableString(row.district);
      // Same slug rule as before, so URLs don't change.
      let slug = slugify(name);
      if (used.has(slug) && districtSlug) slug = `${slug}-${districtSlug}`;
      let suffix = 2;
      while (used.has(slug)) slug = `${slugify(name)}-${suffix++}`;
      used.add(slug);
      claimSlug(slug, "bratislava", source.file);

      const fields = businessFields(row, "bratislava", rep, null);
      if (shapes.length) {
        const poly = districtFor(shapes, fields.lat, fields.lng)?.slug ?? "(none)";
        if (poly !== (districtSlug ?? "(none)")) districtDiffs.push(`${slug}: CSV ${districtSlug ?? "(none)"} -> polygon ${poly}`);
      }
      const districtId = districtSlug ? (districtIds.get(districtSlug) ?? null) : null;
      if (districtId) rep.withDistrict++;
      const reviewInsights = readReviewInsights(path.join(DATA_DIR, "review-insights"), slug, rep);
      const data = { ...fields, category, cityId: city.id, districtId, reviewInsights };
      await prisma.business.upsert({ where: { slug }, update: data, create: { ...data, slug } });
      rep.businesses++;
      rep.byCategory[category] = (rep.byCategory[category] ?? 0) + 1;
    }
  }
  if (shapes.length) {
    console.log(`\nDistrict check (CSV vs OpenStreetMap polygons): ${districtDiffs.length} of ${rep.businesses} differ`);
    for (const d of districtDiffs) console.log(`  ${d}`);
  }
}

async function main() {
  const serviceIds = await seedServices();
  console.log(`Services: ${serviceIds.size}`);

  const cities = fs.existsSync(CITIES_DIR)
    ? fs
        .readdirSync(CITIES_DIR)
        .filter((d) => fs.existsSync(path.join(CITIES_DIR, d, "city.json")))
        .sort()
    : [];
  for (const c of cities) claimCitySlugs(c);
  if (!cities.includes("bratislava") && !process.env.SEED_CITIES_DIR) await seedLegacyBratislava();

  // Only cities whose data (or the seed code) changed since the last seed;
  // SEED_FORCE=1 reseeds all of them.
  const stored = new Map(
    (await prisma.city.findMany({ select: { slug: true, seedHash: true } })).map((c) => [c.slug, c.seedHash])
  );
  const unchanged: string[] = [];
  for (const c of cities) {
    const hash = cityHash(c);
    if (!process.env.SEED_FORCE && stored.get(c) === hash) {
      unchanged.push(c);
      continue;
    }
    await seedCity(c, serviceIds, hash);
  }
  if (unchanged.length) console.log(`Unchanged, not reseeded: ${unchanged.join(", ")}`);

  console.log("\nSeed summary:");
  for (const [city, r] of reports) {
    console.log(`\n  ${city}: ${r.businesses} businesses (${r.skipped} skipped)`);
    for (const [cat, n] of Object.entries(r.byCategory)) console.log(`    ${cat}: ${n}`);
    console.log(`    with district: ${r.withDistrict}, with opening hours: ${r.withHours}, with review insights: ${r.withInsights}`);
    console.log(`    prices: ${r.prices} rows for ${r.businessesWithPrices} businesses`);
    for (const w of r.warnings) console.log(`    ! ${w}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
