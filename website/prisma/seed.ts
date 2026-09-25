import fs from "fs";
import path from "path";
import { config as loadEnv } from "dotenv";
import Papa from "papaparse";
import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient, BusinessCategory } from "@prisma/client";
import { directDatabaseUrl } from "./db-url";

loadEnv({ path: path.join(process.cwd(), ".env.local") });

const adapter = new PrismaPg({ connectionString: directDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

// data/ at the repo root, not website/data/ (that's a stale duplicate copy).
const DATA_DIR = path.join(process.cwd(), "..", "data");
const INSIGHTS_DIR = path.join(DATA_DIR, "review-insights");

// "What customers say" summaries, one JSON file per business slug
// (tasks/ide-review-insights.md). Validated again when rendered.
function readReviewInsights(slug: string): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const file = path.join(INSIGHTS_DIR, `${slug}.json`);
  if (!fs.existsSync(file)) return Prisma.DbNull;
  try {
    const data = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (data?.slug !== slug) {
      console.log(`  review insights: slug mismatch in ${slug}.json, skipped`);
      return Prisma.DbNull;
    }
    return data;
  } catch (e) {
    console.log(`  review insights: invalid JSON in ${slug}.json, skipped (${(e as Error).message})`);
    return Prisma.DbNull;
  }
}

const BRATISLAVA_DISTRICTS: { name: string; slug: string }[] = [
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

type CsvRow = Record<string, string>;

function parseCsv(filePath: string): CsvRow[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const result = Papa.parse<CsvRow>(content, {
    header: true,
    skipEmptyLines: true,
  });
  if (result.errors.length > 0) {
    throw new Error(
      `Failed to parse ${filePath}: ${JSON.stringify(result.errors)}`
    );
  }
  return result.data;
}

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseAnimals(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((a) => a.trim())
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

// Listing-card columns shared by every CSV. Bratislava's files name the
// local-language text short_description_sk; new city files use
// short_description_local (docs/playbooks/add-city.md).
function cardFields(row: CsvRow) {
  const rating = parseNullableFloat(row.google_rating);
  const ratingCount = parseNullableInt(row.google_rating_count);
  // Guard the "5+ ratings or nothing" rule here too, not only in the data.
  const showRating = rating !== null && ratingCount !== null && ratingCount >= 5;
  const logoFile = nullableString(row.logo_file);
  return {
    description: nullableString(row.description),
    shortDescription: nullableString(row.short_description),
    shortDescriptionLocal: nullableString(row.short_description_local ?? row.short_description_sk),
    logoFile: logoFile && /^[\w./-]+$/.test(logoFile) && !logoFile.includes("..") ? logoFile : null,
    googlePlaceId: nullableString(row.google_place_id),
    googleMapsUrl: nullableString(row.google_maps_url),
    googleRating: showRating ? rating : null,
    googleRatingCount: showRating ? ratingCount : null,
    ratingObservedAt: parseNullableDate(row.rating_observed_at),
  };
}

function nullableString(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

interface SourceFile {
  file: string;
  category: BusinessCategory | "FROM_COLUMN";
}

const SOURCE_FILES: SourceFile[] = [
  { file: "salons-bratislava.csv", category: "GROOMING" },
  { file: "vet-clinics-bratislava.csv", category: "VET_CLINIC" },
  { file: "pet-hotels-bratislava.csv", category: "PET_HOTEL" },
  { file: "other-pet-services-bratislava.csv", category: "FROM_COLUMN" },
];

const OTHER_SERVICES_CATEGORY_MAP: Record<string, BusinessCategory> = {
  shop: "PET_SHOP",
  training: "DOG_TRAINING",
  sitting: "PET_SITTING",
};

async function main() {
  console.log("Seeding City + Districts (Bratislava)...");
  const city = await prisma.city.upsert({
    where: { slug: "bratislava" },
    update: { name: "Bratislava", country: "SK", locale: "sk" },
    create: { name: "Bratislava", slug: "bratislava", country: "SK", locale: "sk" },
  });

  const districtIdBySlug = new Map<string, number>();
  for (const d of BRATISLAVA_DISTRICTS) {
    const district = await prisma.district.upsert({
      where: { slug: d.slug },
      update: { name: d.name, cityId: city.id },
      create: { name: d.name, slug: d.slug, cityId: city.id },
    });
    districtIdBySlug.set(d.slug, district.id);
  }

  const usedSlugs = new Set<string>();
  const countByCategory: Record<string, number> = {};
  let skipped = 0;

  for (const source of SOURCE_FILES) {
    const filePath = path.join(DATA_DIR, source.file);
    const rows = parseCsv(filePath);
    console.log(`\n${source.file}: ${rows.length} rows`);

    for (const row of rows) {
      const name = nullableString(row.name);
      const phone = nullableString(row.phone);
      const email = nullableString(row.email);
      const website = nullableString(row.website);

      if (!name) {
        console.log(`  SKIP (no name): ${JSON.stringify(row)}`);
        skipped++;
        continue;
      }
      if (!phone && !email && !website) {
        console.log(`  SKIP (no contact method): ${name}`);
        skipped++;
        continue;
      }

      const category: BusinessCategory =
        source.category === "FROM_COLUMN"
          ? OTHER_SERVICES_CATEGORY_MAP[row.category?.trim() ?? ""]
          : source.category;

      if (!category) {
        console.log(`  SKIP (unknown category "${row.category}"): ${name}`);
        skipped++;
        continue;
      }

      const districtSlug = nullableString(row.district);
      const districtId =
        districtSlug && districtIdBySlug.has(districtSlug)
          ? districtIdBySlug.get(districtSlug)!
          : null;

      const baseSlug = slugify(name);
      let slug = baseSlug;
      if (usedSlugs.has(slug) && districtSlug) {
        slug = `${baseSlug}-${districtSlug}`;
      }
      let suffix = 2;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }
      usedSlugs.add(slug);

      const sourceUrl = nullableString(row.source_url);

      await prisma.business.upsert({
        where: { slug },
        update: {
          name,
          category,
          address: row.address ?? "",
          districtId,
          lat: parseNullableFloat(row.lat),
          lng: parseNullableFloat(row.lng),
          phone,
          email,
          website,
          animals: parseAnimals(row.animals),
          status: "PUBLISHED",
          sourceUrls: sourceUrl ? [sourceUrl] : [],
          notes: nullableString(row.notes),
          ...cardFields(row),
          reviewInsights: readReviewInsights(slug),
        },
        create: {
          name,
          slug,
          category,
          address: row.address ?? "",
          districtId,
          lat: parseNullableFloat(row.lat),
          lng: parseNullableFloat(row.lng),
          phone,
          email,
          website,
          animals: parseAnimals(row.animals),
          status: "PUBLISHED",
          sourceUrls: sourceUrl ? [sourceUrl] : [],
          notes: nullableString(row.notes),
          ...cardFields(row),
          reviewInsights: readReviewInsights(slug),
        },
      });

      countByCategory[category] = (countByCategory[category] ?? 0) + 1;
    }
  }

  console.log("\nSeed summary:");
  for (const [category, count] of Object.entries(countByCategory)) {
    console.log(`  ${category}: ${count}`);
  }
  console.log(
    `  TOTAL loaded: ${Object.values(countByCategory).reduce((a, b) => a + b, 0)}`
  );
  console.log(`  Skipped rows: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
