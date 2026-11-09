#!/usr/bin/env python3
"""
=============================================================================
Mana Venues - Supabase Bulk Seeder Script (Robust & Resilient Edition)
Author: AI Engineering Team
Description:
    Loads `kerala_venues_master.csv`, cleans and validates all fields,
    generates collision-free slugs, and securely bulk-upserts venues into
    Supabase's `auditoriums` table.
    
    Includes:
    - Pure Python fallback (built-in csv, urllib, json) if pandas/supabase 
      are not installed.
    - Automatic search for CSV file and .env / .env.local credentials.
    - Safe NaN/None parsing for coordinates and numeric fields.
    - Backward compatibility mapping (title/name, capacity/seating_capacity).
=============================================================================
"""

import os
import sys
import re
import csv
import json
import argparse
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger("ManaVenuesSeeder")


# 1. Native Slugify (No external python-slugify package required)
def slugify(text: str) -> str:
    """Creates a clean URL-friendly slug from text."""
    text = str(text).lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[-\s]+", "-", text)
    return text.strip("-") or "venue"


def generate_unique_slug(name: str, district: str, existing_slugs: set) -> str:
    """Ensures each venue gets a unique slug without database constraint collisions."""
    base = slugify(f"{name}-{district}")
    slug = base
    counter = 2
    while slug in existing_slugs:
        slug = f"{base}-{counter}"
        counter += 1
    existing_slugs.add(slug)
    return slug


# 2. Safe Field Cleaning & Coercion
def clean_phone_number(raw_phone: Any) -> Optional[str]:
    if not raw_phone:
        return None
    phone_str = str(raw_phone).strip()
    if phone_str.lower() in ("nan", "none", "null", ""):
        return None
    cleaned = re.sub(r"[^\d+]", "", phone_str)
    return cleaned if len(cleaned) >= 7 else None


def safe_float(val: Any, default: Optional[float] = None) -> Optional[float]:
    if val is None:
        return default
    s = str(val).strip()
    if s.lower() in ("nan", "none", "null", ""):
        return default
    try:
        f = float(s)
        # Check for NaN / Infinity
        if f != f or abs(f) == float("inf"):
            return default
        return f
    except (ValueError, TypeError):
        return default


def safe_int(val: Any, default: int = 500) -> int:
    if val is None:
        return default
    s = str(val).strip().split(".")[0]  # strip any decimal point
    if s.lower() in ("nan", "none", "null", ""):
        return default
    try:
        return int(s)
    except (ValueError, TypeError):
        return default


# 3. Automatic .env / .env.local Discovery
def load_env_variables() -> None:
    """Manually parse .env and .env.local without requiring python-dotenv."""
    possible_paths = [
        Path.cwd() / ".env",
        Path.cwd() / ".env.local",
        Path(__file__).resolve().parent / ".env",
        Path(__file__).resolve().parent.parent / "wed-app" / ".env.local",
        Path(__file__).resolve().parent.parent / "wed-app" / ".env",
        Path(__file__).resolve().parent.parent.parent / "wed-app" / ".env.local",
        Path(__file__).resolve().parent.parent.parent / "wed-app" / ".env",
    ]

    for p in possible_paths:
        if p.is_file():
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            key, val = line.split("=", 1)
                            key = key.strip()
                            val = val.strip().strip("'\"")
                            if key not in os.environ:
                                os.environ[key] = val
            except Exception:
                pass


# 4. CSV Loading with standard library fallback
def load_csv_records(csv_path: Path) -> List[Dict[str, str]]:
    """Loads CSV rows using Python's standard csv module (zero dependency)."""
    # Auto-resolve path if default filename was used
    if not csv_path.exists():
        alternatives = [
            Path(__file__).resolve().parent / csv_path.name,
            Path.cwd() / csv_path.name,
            Path(__file__).resolve().parent / "kerala_venues_master.csv",
        ]
        for alt in alternatives:
            if alt.exists():
                csv_path = alt
                break

    if not csv_path.exists():
        logger.error(f"Master CSV file not found at: {csv_path.resolve()}")
        sys.exit(1)

    logger.info(f"Reading venue records from: {csv_path.resolve()}")
    rows = []
    with open(csv_path, mode="r", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    return rows


# Realistic Kerala Convention Hall & Wedding Auditorium Photos
CURATED_HALL_PHOTOS = [
    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1478147427282-58a87a433038?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=1200&auto=format&fit=crop&q=80",
]


def get_venue_curated_photo(name: str, district: str) -> str:
    seed = f"{name}-{district}"
    val = sum(ord(c) for c in seed)
    return CURATED_HALL_PHOTOS[val % len(CURATED_HALL_PHOTOS)]


def prepare_records(raw_rows: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    existing_slugs = set()
    sanitized: List[Dict[str, Any]] = []

    for row in raw_rows:
        name = str(row.get("name", "")).strip()
        if not name or name.lower() in ("nan", "none", "null"):
            continue

        district = str(row.get("district", "Ernakulam")).strip()
        city = str(row.get("city", district)).strip() if row.get("city") else district
        address = str(row.get("address", f"{name}, {district}, Kerala")).strip()
        phone = clean_phone_number(row.get("phone_number"))

        starting_price = safe_float(row.get("starting_price"), 40000.00) or 40000.00
        capacity = safe_int(row.get("capacity"), 500)
        latitude = safe_float(row.get("latitude"))
        longitude = safe_float(row.get("longitude"))

        slug = generate_unique_slug(name, district, existing_slugs)

        # Parse or assign photos
        raw_photos = row.get("photos", "")
        photos = []
        if raw_photos:
            try:
                if str(raw_photos).startswith("["):
                    photos = json.loads(str(raw_photos))
                elif str(raw_photos).startswith("http"):
                    photos = [str(raw_photos).strip()]
            except Exception:
                photos = []

        if not photos:
            photos = [get_venue_curated_photo(name, district)]

        # Build record with dual keys for schema compatibility
        record = {
            "name": name,
            "title": name,  # compatibility if schema uses title
            "slug": slug,
            "district": district,
            "city": city,
            "address": address,
            "phone_number": phone,
            "starting_price": starting_price,
            "base_price_per_day": starting_price,  # compatibility
            "capacity": capacity,
            "seating_capacity": capacity,         # compatibility
            "latitude": latitude,
            "longitude": longitude,
            "photos": photos,
            "is_verified": True,
            "verified": True,                     # compatibility
            "is_claimed": False
        }
        sanitized.append(record)

    logger.info(f"Validated {len(sanitized)} clean venue records.")
    return sanitized


# 5. Direct Supabase Upsert via REST (Works with or without supabase-py)
def upload_batch_to_supabase(
    supabase_url: str,
    api_key: str,
    batch: List[Dict[str, Any]]
) -> bool:
    """Uploads a batch using standard urllib or supabase client."""
    # Try supabase-py if available
    try:
        from supabase import create_client
        client = create_client(supabase_url, api_key)
        client.table("auditoriums").upsert(batch, on_conflict="slug").execute()
        return True
    except ImportError:
        pass
    except Exception as e:
        # Fall back to raw REST if supabase-py encounters on_conflict error
        logger.debug(f"supabase-py client returned: {e}. Trying direct REST API...")

    # Direct REST API Fallback
    import urllib.request
    import urllib.error

    endpoint = f"{supabase_url.rstrip('/')}/rest/v1/auditoriums?on_conflict=slug"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal"
    }

    # Clean payload for strict schemas: try inserting standard schema
    data_json = json.dumps(batch).encode("utf-8")
    req = urllib.request.Request(endpoint, data=data_json, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.status in (200, 201, 204)
    except urllib.error.HTTPError as err:
        err_body = err.read().decode("utf-8", errors="replace")
        if "42501" in err_body or "row-level security" in err_body:
            logger.error("❌ Row-Level Security (RLS) Blocked Insert:")
            logger.error("   The Supabase anon key cannot insert records by default.")
            logger.error("   Fix option 1: Run migration 004 in your Supabase SQL editor.")
            logger.error("   Fix option 2: Provide your service role secret key:")
            logger.error("     python seed_to_supabase.py --service-key <YOUR_SERVICE_ROLE_KEY>")
            return False
        logger.error(f"HTTP {err.code} from Supabase REST API: {err_body}")

        # If schema complains about extra columns, retry with minimal columns
        if "Could not find" in err_body:
            logger.info("Retrying with legacy column structure (title, seating_capacity)...")
            legacy_batch = []
            for b in batch:
                legacy_batch.append({
                    "title": b["name"],
                    "slug": b["slug"],
                    "address": b["address"],
                    "seating_capacity": b["capacity"],
                    "base_price_per_day": b["starting_price"],
                    "latitude": b["latitude"],
                    "longitude": b["longitude"],
                    "verified": False
                })
            retry_data = json.dumps(legacy_batch).encode("utf-8")
            retry_req = urllib.request.Request(endpoint, data=retry_data, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(retry_req, timeout=30) as r:
                    return r.status in (200, 201, 204)
            except Exception as e2:
                logger.error(f"Legacy retry also failed: {e2}")
        return False
    except Exception as exc:
        logger.error(f"Network error communicating with Supabase: {exc}")
        return False


def seed_venues(
    supabase_url: str,
    api_key: str,
    records: List[Dict[str, Any]],
    batch_size: int = 50
) -> None:
    total_records = len(records)
    logger.info(f"Beginning bulk upload of {total_records} venues into Supabase...")

    # Log district distribution
    district_counts = {}
    for r in records:
        d = r.get("district", "Kerala")
        district_counts[d] = district_counts.get(d, 0) + 1

    logger.info("District summary:")
    for dist, cnt in sorted(district_counts.items()):
        logger.info(f"  • {dist}: {cnt} venues")

    total_inserted = 0
    total_failed = 0
    total_batches = (total_records + batch_size - 1) // batch_size

    for i in range(0, total_records, batch_size):
        batch = records[i:i + batch_size]
        batch_num = (i // batch_size) + 1

        success = upload_batch_to_supabase(supabase_url, api_key, batch)
        if success:
            total_inserted += len(batch)
            logger.info(f"[Batch {batch_num}/{total_batches}] Successfully uploaded {len(batch)} venues.")
        else:
            total_failed += len(batch)
            logger.error(f"[Batch {batch_num}/{total_batches}] Failed to upload batch.")

    logger.info("============================================================")
    logger.info(f"Seeding Process Complete!")
    logger.info(f"  ✔ Inserted / Upserted: {total_inserted} venues")
    if total_failed > 0:
        logger.warning(f"  ✖ Failed:              {total_failed} venues")
        logger.warning("Tip: Check if RLS is blocking inserts or run migration 004 in Supabase SQL editor.")
    logger.info("============================================================")


def main():
    load_env_variables()

    parser = argparse.ArgumentParser(description="Mana Venues Supabase Seeder")
    parser.add_argument("--csv", type=str, default="kerala_venues_master.csv", help="Path to input master CSV file")
    parser.add_argument("--batch-size", type=int, default=50, help="Number of records per insert payload")
    parser.add_argument(
        "--supabase-url",
        type=str,
        default=os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
    )
    parser.add_argument(
        "--service-key",
        type=str,
        default=os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY") or os.getenv("SUPABASE_ANON_KEY")
    )
    args = parser.parse_args()

    supabase_url = args.supabase_url
    service_key = args.service_key

    if not supabase_url or not service_key:
        logger.error(
            "Missing Supabase credentials!\n"
            "Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) "
            "are set in .env.local, or pass them with --supabase-url and --service-key."
        )
        sys.exit(1)

    raw_rows = load_csv_records(Path(args.csv))
    records = prepare_records(raw_rows)

    if records:
        seed_venues(supabase_url, service_key, records, args.batch_size)
    else:
        logger.warning("No valid venue records found to seed.")


if __name__ == "__main__":
    main()
