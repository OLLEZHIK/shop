#!/usr/bin/env python3
"""Bratislava: old data/*-bratislava.csv -> data/cities/bratislava/.

Temporary. Agents still finishing work on the old files (opening hours:
mac/collect-hours-and-vet-services, logos: PR #73) write to data/*.csv;
after each of those merges, run this again (python3 scripts/migrate-bratislava.py).
Once both are in, the old files and this script are deleted and
data/cities/bratislava/ is edited directly.

Output (overwritten on every run, don't edit by hand until then;
review-insights/ and districts.geojson are not generated, edit those freely):
  data/cities/bratislava/city.json
  data/cities/bratislava/businesses.csv
  data/cities/bratislava/prices.csv
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
from collections import OrderedDict
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
PRICE_COLUMNS = [
    "business_slug", "price_code", "weight_from_kg", "weight_to_kg",
    "price_from", "price_to", "currency", "source_url", "observed_at", "notes",
]
SIZE_ORDER = {"MINI": 0, "SMALL": 1, "MEDIUM": 2, "LARGE": 3, "XL": 4, "": 5}


def slugify(text):
    text = unicodedata.normalize("NFD", text)
    text = re.sub("[̀-ͯ]", "", text).lower()
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
                sys.exit(f"duplicate name {name!r}: price files can't tell them apart")
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


# ---------------------------------------------------------------------
# Prices (docs/card-spec.md, "Цены")
# ---------------------------------------------------------------------
def num(s):
    return float(s) if s else None


def fmt(x):
    return "" if x is None else (f"{x:.2f}".rstrip("0").rstrip("."))


def is_from_price(row, notes):
    """'od 40 €' is a starting price: shown as 'from', so no price_to."""
    if not val(row, "price_to"):
        return True
    if re.search(r"\bod \d", notes, re.I) and num(row["price_to"]) == num(row["price_from"]):
        return True
    return bool(re.search(r"hodin|za hodinu", notes, re.I))  # per hour: the total is at least this


def price_row(slug, code, row, notes, wfrom=None, wto=None):
    from_ = num(val(row, "price_from"))
    to = None if is_from_price(row, notes) else num(val(row, "price_to"))
    return {
        "business_slug": slug, "price_code": code,
        "weight_from_kg": fmt(wfrom), "weight_to_kg": fmt(wto),
        "price_from": fmt(from_), "price_to": fmt(to), "currency": val(row, "currency") or "EUR",
        "source_url": val(row, "source_url"), "observed_at": val(row, "observed_at"), "notes": notes,
    }


def collapse(slug, code, rows, extra_note=""):
    """Several prices without a weight to tell them apart (sizes S/M/L,
    several vaccines): one row, lowest to highest."""
    notes = "; ".join(val(r, "notes") for r in rows)
    if extra_note:
        notes = f"{extra_note}; {notes}"
    lows = [num(val(r, "price_from")) for r in rows]
    froms = [is_from_price(r, val(r, "notes")) for r in rows]
    highs = [num(val(r, "price_to")) or num(val(r, "price_from")) for r in rows]
    first = rows[0]
    out = price_row(slug, code, first, notes)
    out["price_from"] = fmt(min(lows))
    out["price_to"] = "" if any(froms) else fmt(max(highs))
    return out


def kg_range(notes):
    m = re.search(r"(\d+)\s*[-–]\s*(\d+)\s*kg", notes)
    if m:
        return float(m.group(1)), float(m.group(2))
    m = re.search(r"\bdo (\d+)\s*kg", notes)
    if m:
        return None, float(m.group(1))
    m = re.search(r"\b(?:nad|od) (\d+)\s*kg", notes)
    if m:
        return float(m.group(1)), None
    return None


def migrate_salon_prices(slug_by_name):
    groups = OrderedDict()
    for r in read_csv(DATA / "salon-prices-bratislava.csv"):
        groups.setdefault((val(r, "salon_name"), val(r, "price_code")), []).append(r)
    out = []
    for (name, code), rows in groups.items():
        slug = slug_by_name[name]
        rows.sort(key=lambda r: SIZE_ORDER.get(val(r, "size_class"), 5))
        ranges = [kg_range(val(r, "notes")) for r in rows]
        if len(rows) == 1:
            out.append(price_row(slug, code, rows[0], val(rows[0], "notes"), *(ranges[0] or (None, None))))
        elif all(ranges):
            # "do 8 kg", "do 20 kg", "nad 20 kg" -> up to 8, 8-20, over 20
            prev_to = None
            for r, (lo, hi) in zip(rows, ranges):
                if lo is None and prev_to is not None:
                    lo = prev_to
                out.append(price_row(slug, code, r, val(r, "notes"), lo, hi))
                prev_to = hi
        else:
            sizes = "/".join(val(r, "size_class") for r in rows if val(r, "size_class"))
            out.append(collapse(slug, code, rows, f"podľa veľkosti psa ({sizes}), bez hmotnosti v cenníku"))
    return out


def mentions_dog(row):
    return val(row, "species") == "dog"


def migrate_vet_prices(slug_by_name):
    by_clinic = OrderedDict()
    for r in read_csv(DATA / "vet-prices-bratislava.csv"):
        by_clinic.setdefault(val(r, "clinic_name"), []).append(r)
    out = []
    for name, rows in by_clinic.items():
        slug = slug_by_name[name]
        pick = lambda service, species=None: [
            r for r in rows if val(r, "service") == service and (species is None or val(r, "species") == species)
        ]

        exams = [r for r in pick("exam") if not re.search(r"ortoped", val(r, "notes"), re.I)]
        if exams:
            out.append(collapse(slug, "exam", exams) if len(exams) > 1 else price_row(slug, "exam", exams[0], val(exams[0], "notes")))

        # Annual combined vaccine for dogs. A clinic listing one price for
        # dogs and cats alike ("Očkovanie", no species) counts too.
        vacc = pick("vaccination_combo", "dog") or pick("vaccination_combo", "")
        if vacc:
            note = "" if mentions_dog(vacc[0]) else "cena pre psov aj mačky"
            out.append(collapse(slug, "vaccination_dog", vacc, note) if len(vacc) > 1 or note else price_row(slug, "vaccination_dog", vacc[0], val(vacc[0], "notes")))

        chips = pick("microchip")
        if chips:
            out.append(price_row(slug, "microchip", chips[0], val(chips[0], "notes")))

        # Surgery prices "bez anestézy" (Super zoo) are only the procedure:
        # shown as "from", the full price is higher.
        for service, species, code in [("castration", "cat", "neuter_cat"), ("sterilization", "cat", "spay_cat"), ("sterilization", "dog", "spay_dog")]:
            for r in pick(service, species):
                notes = val(r, "notes")
                p = price_row(slug, code, r, notes, num(val(r, "weight_from_kg")), num(val(r, "weight_to_kg")))
                if re.search(r"bez anestéz", notes, re.I):
                    p["price_to"] = ""
                out.append(p)
    return out


def check_prices(prices):
    allowed = {
        "GROOMING": {"full_groom", "bath_dry", "hand_stripping", "deshedding", "nail_trim", "cat_groom"},
        "VET_CLINIC": {"exam", "vaccination_dog", "microchip", "neuter_cat", "spay_cat", "spay_dog"},
    }
    return [p for p in prices if not (p["price_from"] and p["source_url"] and p["observed_at"])] + [
        p for p in prices if not any(p["price_code"] in s for s in allowed.values())
    ]


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

    prices = migrate_salon_prices(slug_by_name) + migrate_vet_prices(slug_by_name)
    bad = check_prices(prices)
    if bad:
        sys.exit(f"invalid price rows: {bad}")
    write_csv(OUT / "prices.csv", PRICE_COLUMNS, prices)

    print(f"businesses: {len(businesses)}, with logo: {sum(1 for b in businesses if b['logo_file'])}")
    print(f"prices: {len(prices)} rows for {len({p['business_slug'] for p in prices})} businesses")


if __name__ == "__main__":
    main()
