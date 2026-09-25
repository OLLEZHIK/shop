#!/usr/bin/env python3
"""Bratislava: old data/*-bratislava.csv -> data/cities/bratislava/.

Temporary. Agents still finishing work on the old files (opening hours:
mac/collect-hours-and-vet-services, logos: PR #73) write to data/*.csv;
after each of those merges, run this again (python3 scripts/migrate-bratislava.py).
Once both are in, the old files and this script are deleted and
data/cities/bratislava/ is edited directly.

Output (overwritten on every run, don't edit by hand until then;
prices.csv, review-insights/ and districts.geojson are not generated,
edit those freely; prices.csv was converted once from the old
salon/vet price files in the commit that added this script):
  data/cities/bratislava/city.json
  data/cities/bratislava/businesses.csv
  website/public/logos/bratislava/          (copied from website/public/logos/)

Slugs are computed exactly like seedLegacyBratislava() in
website/prisma/seed.ts, so no page URL changes.
"""

import csv
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
OUT = DATA / "cities" / "bratislava"
LOGOS = ROOT / "website" / "public" / "logos"

LEGACY_FILES = [
    ("salons-bratislava.csv", "GROOMING"),
    ("vet-clinics-bratislava.csv", "VET_CLINIC"),
    ("pet-hotels-bratislava.csv", "PET_HOTEL"),
    ("other-pet-services-bratislava.csv", None),
]
LEGACY_OTHER = {"shop": "PET_SHOP", "training": "DOG_TRAINING", "sitting": "PET_SITTING"}

# docs/card-spec.md, in the order of its sections.
COLUMNS = [
    "category", "name", "slug", "logo_file",
    "short_description", "short_description_local", "description", "description_local",
    "address", "lat", "lng", "google_maps_url", "google_place_id",
    "phone", "email", "website", "instagram", "facebook",
    "opening_hours", "hours_source_url", "hours_observed_at",
    "google_rating", "google_rating_count", "rating_observed_at",
    "emergency_24_7", "emergency_note", "home_visits", "specialties",
    "languages_spoken", "photo_urls", "animals",
    "source_url", "observed_at", "notes",
]
RENAMED = {"short_description_local": "short_description_sk", "description_local": "description_sk"}


def slugify(text):
    text = unicodedata.normalize("NFD", text)
    text = re.sub("[\u0300-\u036f]", "", text).lower()
    return re.sub(r"[^a-z0-9]+", "-", text).strip("-")


def read_csv(path):
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def write_csv(path, columns, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=columns, lineterminator="\n")
        w.writeheader()
        for r in rows:
            w.writerow({c: r.get(c, "") for c in columns})


def val(row, key):
    return (row.get(key) or "").strip()


# ---------------------------------------------------------------------
# Businesses
# ---------------------------------------------------------------------
def migrate_businesses():
    logo_overrides = {}
    logos_csv = DATA / "logos-bratislava.csv"
    if logos_csv.exists():  # PR #73, if merged before the final run
        for r in read_csv(logos_csv):
            if val(r, "logo_file") and val(r, "name"):
                logo_overrides[val(r, "name")] = val(r, "logo_file")

    used, out, slug_by_name = set(), [], {}
    for file, fixed_category in LEGACY_FILES:
        for row in read_csv(DATA / file):
            name = val(row, "name")
            if not name:
                continue
            if not (val(row, "phone") or val(row, "email") or val(row, "website")):
                continue
            category = fixed_category or LEGACY_OTHER.get(val(row, "category"))
            if not category:
                continue
            district = val(row, "district")
            slug = slugify(name)
            if slug in used and district:
                slug = f"{slug}-{district}"
            n = 2
            while slug in used:
                slug = f"{slugify(name)}-{n}"
                n += 1
            used.add(slug)
            if name in slug_by_name:
                sys.exit(f"duplicate name {name!r}: logos-bratislava.csv matches by name")
            slug_by_name[name] = slug

            rec = {c: val(row, RENAMED.get(c, c)) or val(row, c) for c in COLUMNS}
            rec.update(category=category, name=name, slug=slug)
            if name in logo_overrides:
                rec["logo_file"] = logo_overrides[name]
            out.append(rec)
    return out, slug_by_name


def copy_logos(businesses):
    dest = LOGOS / "bratislava"
    dest.mkdir(parents=True, exist_ok=True)
    for b in businesses:
        f = b["logo_file"]
        if not f:
            continue
        src = LOGOS / f
        if (dest / f).exists():
            continue
        if not src.exists():
            print(f"  ! logo not found: {src.relative_to(ROOT)} ({b['slug']})")
            b["logo_file"] = ""
            continue
        # Copy, not move: production still points at logos/<file> until
        # the seed is re-run against it.
        shutil.copy2(src, dest / f)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    city = {
        "name": "Bratislava",
        "slug": "bratislava",
        "country": "SK",
        "locale": "sk",
        "lat": 48.1486,
        "lng": 17.1077,
        "sources": ["https://sk.wikipedia.org/wiki/Bratislava"],
        "observed_at": "2026-09-25",
    }
    (OUT / "city.json").write_text(json.dumps(city, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    businesses, slug_by_name = migrate_businesses()
    copy_logos(businesses)
    write_csv(OUT / "businesses.csv", COLUMNS, businesses)
    for f in sorted((OUT / "review-insights").glob("*.json")):
        if f.stem not in slug_by_name.values():
            print(f"  ! review insights for unknown slug: {f.name}")
    for r in read_csv(OUT / "prices.csv"):
        if r["business_slug"] not in slug_by_name.values():
            print(f"  ! prices.csv: unknown business_slug {r['business_slug']}")

    print(f"businesses: {len(businesses)}, with logo: {sum(1 for b in businesses if b['logo_file'])}")


if __name__ == "__main__":
    main()
