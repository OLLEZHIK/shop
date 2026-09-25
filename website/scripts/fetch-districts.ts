// Fetch a city's district boundaries from OpenStreetMap, once per city:
//
//   npx tsx scripts/fetch-districts.ts <city-slug> <osm-relation-id> [admin-level]
//   npx tsx scripts/fetch-districts.ts bratislava 1702499 9 \
//     "--name=podunajske-biskupce=Podunajské Biskupice"
//
// Walks the city relation's "subarea" members down to relations with the
// given admin_level (default 9, Slovak "mestská časť"; for Bratislava:
// city -> okres I-V -> 17 mestské časti), takes each one's
// name from the OSM API and its geometry from polygons.openstreetmap.fr,
// simplifies it (~5 m) and writes data/cities/<city>/districts.geojson.
// The seed assigns businesses to districts from that file offline
// (tasks/claude-city-loader-and-districts.md). District slugs are the
// name without diacritics; they are URLs, so re-running keeps them stable
// as long as OSM names don't change - check the diff before committing.
//
// Behind a proxy on Node 22, run with NODE_USE_ENV_PROXY=1.
import fs from "fs";
import path from "path";

const USER_AGENT = "pawenn-district-fetch/1.0 (https://pawenn.com)";
const TOLERANCE_DEG = 0.00005;

type Ring = [number, number][];
type MultiPolygon = { type: "MultiPolygon"; coordinates: Ring[][] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT, Accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await sleep(1100); // OSM usage policy: at most ~1 request per second
  return (await res.json()) as T;
}

interface OsmRelation {
  id: number;
  tags: Record<string, string>;
  members: { type: string; ref: number; role: string }[];
}

async function relation(id: number): Promise<OsmRelation> {
  const data = await getJson<{ elements: OsmRelation[] }>(`https://www.openstreetmap.org/api/0.6/relation/${id}.json`);
  return data.elements[0];
}

async function districtsAt(id: number, level: number, isRoot = true): Promise<OsmRelation[]> {
  const rel = await relation(id);
  if (!isRoot && Number(rel.tags["admin_level"]) >= level) return [rel];
  const subs = rel.members.filter((m) => m.type === "relation" && m.role === "subarea");
  const out: OsmRelation[] = [];
  for (const s of subs) out.push(...(await districtsAt(s.ref, level, false)));
  return out;
}

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Douglas-Peucker on an open polyline (degrees are fine at city scale).
function simplifyLine(line: Ring, tol: number): Ring {
  if (line.length < 3) return line;
  const keep = new Array(line.length).fill(false);
  keep[0] = keep[line.length - 1] = true;
  const stack: [number, number][] = [[0, line.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const [ax, ay] = line[a];
    const [bx, by] = line[b];
    const dx = bx - ax;
    const dy = by - ay;
    const len = Math.hypot(dx, dy);
    let maxD = -1;
    let idx = -1;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = line[i];
      const d = len === 0 ? Math.hypot(px - ax, py - ay) : Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
      if (d > maxD) [maxD, idx] = [d, i];
    }
    if (idx > 0 && maxD > tol) {
      keep[idx] = true;
      stack.push([a, idx], [idx, b]);
    }
  }
  return line.filter((_, i) => keep[i]);
}

// A closed ring is split at the point farthest from its start, so both
// halves are open lines, then rejoined.
function simplifyRing(ring: Ring, tol: number): Ring {
  if (ring.length < 8) return ring;
  const [sx, sy] = ring[0];
  let far = 1;
  for (let i = 1; i < ring.length - 1; i++) {
    if (Math.hypot(ring[i][0] - sx, ring[i][1] - sy) > Math.hypot(ring[far][0] - sx, ring[far][1] - sy)) far = i;
  }
  const first = simplifyLine(ring.slice(0, far + 1), tol);
  const second = simplifyLine(ring.slice(far), tol);
  return [...first, ...second.slice(1)].map(([x, y]) => [Number(x.toFixed(6)), Number(y.toFixed(6))]);
}

async function main() {
  const args = process.argv.slice(2);
  // --name=<osm-slug>=<Display Name> keeps an existing district URL/name
  // when OSM spells it differently (e.g. Podunajské Biskupce vs Biskupice).
  const renames = new Map(
    args
      .filter((a) => a.startsWith("--name="))
      .map((a) => {
        const [from, ...rest] = a.slice("--name=".length).split("=");
        return [from, rest.join("=")] as const;
      })
  );
  const [citySlug, relId, levelArg] = args.filter((a) => !a.startsWith("--"));
  const level = Number(levelArg ?? 9);
  if (!citySlug || !relId) {
    console.error("usage: tsx scripts/fetch-districts.ts <city-slug> <osm-relation-id> [admin-level]");
    process.exit(1);
  }
  const districts = await districtsAt(Number(relId), level);
  const features = [];
  for (const d of districts) {
    // "Bratislava-Staré Mesto" style names -> "Staré Mesto"
    const osmName = (d.tags["name"] ?? "").replace(/^Bratislava-/, "").trim();
    const name = renames.get(slugify(osmName)) ?? osmName;
    const url = `https://polygons.openstreetmap.fr/get_geojson.py?id=${d.id}&params=0`;
    const geom = await getJson<MultiPolygon | { type: "GeometryCollection"; geometries: MultiPolygon[] }>(url);
    const mp = geom.type === "GeometryCollection" ? geom.geometries.find((g) => g.type === "MultiPolygon")! : geom;
    const coordinates = mp.coordinates.map((poly) => poly.map((ring) => simplifyRing(ring, TOLERANCE_DEG)));
    features.push({
      type: "Feature",
      properties: { name, slug: slugify(name), osm_relation: d.id },
      geometry: { type: "MultiPolygon", coordinates },
    });
    console.log(`${slugify(name)}  ${name}  (relation ${d.id})`);
  }
  features.sort((a, b) => a.properties.slug.localeCompare(b.properties.slug));
  const out = {
    type: "FeatureCollection",
    source: `OpenStreetMap contributors, ODbL - relation ${relId} (fetched ${new Date().toISOString().slice(0, 10)})`,
    features,
  };
  const dir = path.join(process.cwd(), "..", "data", "cities", citySlug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "districts.geojson");
  fs.writeFileSync(file, JSON.stringify(out) + "\n");
  console.log(`\n${features.length} districts -> ${path.relative(process.cwd(), file)} (${Math.round(fs.statSync(file).size / 1024)} KB)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
