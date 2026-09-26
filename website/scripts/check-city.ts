// Card quality check for one city's data (docs/card-spec.md, "Минимум
// качества"). Data agents run it before opening a PR; reviewers run it on
// the PR branch. Exit code 1 means the PR is not ready.
//
//   npm run check-city -- bratislava
//
// Checks, per place: texts in both languages, coordinates, a way to
// contact, and for logo / Google rating / opening hours either a value or
// a "<field>: none (<where searched>)" line in notes. Per city: coverage
// of each field against its target.
import fs from "fs";
import path from "path";
import Papa from "papaparse";

type Row = Record<string, string>;

const city = process.argv[2];
if (!city) {
  console.error("Usage: npm run check-city -- <city-slug>");
  process.exit(2);
}
const dir = path.join(process.cwd(), "..", "data", "cities", city);
const logosDir = path.join(process.cwd(), "public", "logos", city);
if (!fs.existsSync(dir)) {
  console.error(`No data folder: ${dir}`);
  process.exit(2);
}

const rows: Row[] = fs
  .readdirSync(dir)
  .filter((f) => /^businesses.*\.csv$/.test(f))
  .flatMap((f) => Papa.parse<Row>(fs.readFileSync(path.join(dir, f), "utf-8"), { header: true, skipEmptyLines: true }).data);
const insights = new Set(
  fs.existsSync(path.join(dir, "review-insights"))
    ? fs.readdirSync(path.join(dir, "review-insights")).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""))
    : []
);

const has = (r: Row, key: string) => (r[key] ?? "").trim() !== "";
const noted = (r: Row, key: string) => new RegExp(`\\b${key}: none \\(.+\\)`).test(r.notes ?? "");
const logoOk = (r: Row) => has(r, "logo_file") && fs.existsSync(path.join(logosDir, r.logo_file.trim()));

// Target share of places that must have each field. Logo, rating and
// hours can be genuinely missing (no logo anywhere, fewer than 5 ratings,
// hours not published) - the rest of the way to 100 % must be explained
// in notes, never left silent.
const CHECKS: { field: string; target: number; ok: (r: Row) => boolean; evidence?: string }[] = [
  { field: "short_description + _local", target: 1, ok: (r) => has(r, "short_description") && has(r, "short_description_local") },
  { field: "description + _local", target: 1, ok: (r) => has(r, "description") && has(r, "description_local") },
  // Mobile services with no premises have no coordinates, only a
  // "coords: none (mobile service ...)" note (docs/card-spec.md, section 3).
  { field: "lat / lng", target: 1, ok: (r) => (has(r, "lat") && has(r, "lng")) || noted(r, "coords") },
  { field: "phone / email / website", target: 1, ok: (r) => has(r, "phone") || has(r, "email") || has(r, "website") },
  { field: "google_maps_url", target: 0.95, ok: (r) => has(r, "google_maps_url") },
  { field: "logo", target: 0.8, ok: logoOk, evidence: "logo" },
  { field: "google_rating", target: 0.85, ok: (r) => has(r, "google_rating") && has(r, "google_rating_count"), evidence: "rating" },
  { field: "opening_hours", target: 0.9, ok: (r) => has(r, "opening_hours"), evidence: "hours" },
];

let failed = false;
console.log(`\n${city}: ${rows.length} places\n`);
console.log("field                         have    share  target");
for (const c of CHECKS) {
  const n = rows.filter(c.ok).length;
  const share = n / rows.length;
  const pass = share >= c.target;
  if (!pass) failed = true;
  console.log(
    `${c.field.padEnd(28)} ${`${n}/${rows.length}`.padStart(7)} ${`${Math.round(share * 100)}%`.padStart(7)} ${`${Math.round(c.target * 100)}%`.padStart(6)}  ${pass ? "ok" : "FAIL"}`
  );
}

// Every missing logo, rating or hours needs a trace of the search.
const silent: string[] = [];
for (const r of rows) {
  for (const c of CHECKS) {
    if (!c.evidence || c.ok(r) || noted(r, c.evidence)) continue;
    silent.push(`${r.slug}: no ${c.field} and no "${c.evidence}: none (...)" in notes`);
  }
}
if (silent.length) {
  failed = true;
  console.log(`\nMissing without a search note (${silent.length}):`);
  for (const s of silent) console.log(`  ${s}`);
}

// Nonstop 24/7 is shown as "open now" at any hour: only for places whose
// hours are 24h all week (docs/card-spec.md, section 8, "Nonstop 24/7").
const DAYS = ["mo", "tu", "we", "th", "fr", "sa", "su"];
const allDay = (hours: string) =>
  DAYS.every((d) => new RegExp(`(^|;)\\s*${d}\\s+24h\\s*(;|$)`).test(hours ?? ""));
const falseNonstop = rows.filter((r) => /^yes$/i.test((r.emergency_24_7 ?? "").trim()) && !allDay(r.opening_hours));
if (falseNonstop.length) {
  failed = true;
  console.log(`\nemergency_24_7=yes without 24h hours on all 7 days (${falseNonstop.length}):`);
  for (const r of falseNonstop) console.log(`  ${r.slug}: ${r.opening_hours || "(no hours)"}`);
}

// Coordinates at the city centre are a placeholder, not a place: they put
// a pin where the business is not (docs/card-spec.md, section 3).
const cityMeta = fs.existsSync(path.join(dir, "city.json"))
  ? (JSON.parse(fs.readFileSync(path.join(dir, "city.json"), "utf-8")) as {
      lat?: number;
      lng?: number;
      locale?: string;
      locales?: string[];
    })
  : {};
const atCentre = rows.filter(
  (r) =>
    cityMeta.lat !== undefined &&
    cityMeta.lng !== undefined &&
    has(r, "lat") &&
    Math.abs(Number(r.lat) - cityMeta.lat) < 0.0005 &&
    Math.abs(Number(r.lng) - cityMeta.lng) < 0.0005
);
if (atCentre.length) {
  failed = true;
  console.log(`\nCoordinates at the city centre - placeholder, not the place (${atCentre.length}):`);
  for (const r of atCentre) console.log(`  ${r.slug}: ${r.lat}, ${r.lng}`);
}

// Logos are shown at avatar size: a heavy file only slows the page
// (docs/card-spec.md, "Логотип").
const MAX_LOGO_KB = 200;
const heavyLogos = rows.filter(
  (r) => logoOk(r) && fs.statSync(path.join(logosDir, r.logo_file.trim())).size > MAX_LOGO_KB * 1024
);
if (heavyLogos.length) {
  failed = true;
  console.log(`\nLogos over ${MAX_LOGO_KB} KB - compress or resize to 512 px (${heavyLogos.length}):`);
  for (const r of heavyLogos) {
    const kb = Math.round(fs.statSync(path.join(logosDir, r.logo_file.trim())).size / 1024);
    console.log(`  ${r.slug}: ${r.logo_file} ${kb} KB`);
  }
}

// Review summaries follow one format (docs/playbooks/review-insights.md);
// every text in English and in each language of the city.
const slugs = new Set(rows.map((r) => r.slug));
const cityLangs = ["en", ...(cityMeta.locales ?? (cityMeta.locale ? [cityMeta.locale] : []))];
const bothLangs = (v: unknown) => {
  const o = v as Record<string, unknown> | undefined;
  return cityLangs.every((l) => typeof o?.[l] === "string" && (o[l] as string).trim() !== "");
};
const insightErrors: string[] = [];
for (const slug of insights) {
  const file = path.join(dir, "review-insights", `${slug}.json`);
  let data: {
    slug?: string;
    cards?: { title?: unknown; text?: unknown; mentions?: number }[];
    faq?: { q?: unknown; a?: unknown }[];
  };
  try {
    data = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    insightErrors.push(`${slug}: not valid JSON`);
    continue;
  }
  const err = (m: string) => insightErrors.push(`${slug}: ${m}`);
  if (!slugs.has(slug)) err("no place with this slug in businesses.csv");
  if (data.slug !== slug) err(`"slug" is "${data.slug}", file name says "${slug}"`);
  const cards = data.cards ?? [];
  if (cards.length !== 3) err(`${cards.length} cards, need exactly 3`);
  cards.forEach((c, i) => {
    if (!bothLangs(c.title) || !bothLangs(c.text)) err(`card ${i + 1}: title and text need ${cityLangs.join(" + ")}`);
    if ((c.mentions ?? 0) < 3) err(`card ${i + 1}: mentions ${c.mentions}, a topic needs 3+ reviewers`);
    const text = c.text as Record<string, string> | undefined;
    for (const l of cityLangs) {
      const n = text?.[l]?.length ?? 0;
      if (n && (n < 250 || n > 450)) err(`card ${i + 1}: text.${l} is ${n} characters, need 250-450`);
    }
  });
  const faq = data.faq ?? [];
  if (faq.length < 3 || faq.length > 6) err(`${faq.length} FAQ, need 3-6`);
  faq.forEach((f, i) => {
    if (!bothLangs(f.q) || !bothLangs(f.a)) err(`FAQ ${i + 1}: q and a need ${cityLangs.join(" + ")}`);
  });
}
if (insightErrors.length) {
  failed = true;
  console.log(`\nreview-insights format (${insightErrors.length}):`);
  for (const e of insightErrors) console.log(`  ${e}`);
}

// Review summaries are a second pass; coverage reported, not enforced.
const rated = rows.filter((r) => Number(r.google_rating_count) >= 10);
const withInsights = rated.filter((r) => insights.has(r.slug)).length;
console.log(`\nWhat customers say: ${withInsights}/${rated.length} places with 10+ Google ratings have review-insights`);

console.log(failed ? "\nNOT READY: fix the FAIL lines above.\n" : "\nREADY\n");
process.exit(failed ? 1 : 0);
