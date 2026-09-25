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
    ? fs.readdirSync(path.join(dir, "review-insights")).map((f) => f.replace(/\.json$/, ""))
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
  { field: "lat / lng", target: 1, ok: (r) => has(r, "lat") && has(r, "lng") },
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

// Review summaries are a second pass; reported, not enforced here.
const rated = rows.filter((r) => Number(r.google_rating_count) >= 10);
const withInsights = rated.filter((r) => insights.has(r.slug)).length;
console.log(`\nWhat customers say: ${withInsights}/${rated.length} places with 10+ Google ratings have review-insights`);

console.log(failed ? "\nNOT READY: fix the FAIL lines above.\n" : "\nREADY\n");
process.exit(failed ? 1 : 0);
