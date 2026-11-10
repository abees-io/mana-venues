"""
Strip out all fake/fabricated AF1Qip placeholder photo URLs that were
bulk-assigned in assign_fallback_photos.py. These URLs don't point to real
venue photos — they look like Google Maps IDs but are made-up.

Real venue photos fetched by Playwright use the 'grass-cs' or 'gps-cs-s'
path patterns. The fabricated ones use the 'AF1Qip' pattern with made-up
suffixes. We clear those back to [] so the UI shows the no-photo icon
instead of a broken/wrong image.

Run: python scripts/ingestion/clear_fake_photos.py
"""
import csv, json
from pathlib import Path

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

# URLs that are confirmed real (from Playwright scraping) use these patterns:
REAL_PATTERNS = [
    "grass-cs/",
    "gps-cs-s/",
    "/p/AF1Qip",   # real Google Maps place photos have /p/ prefix
    "lh3.googleusercontent.com/grass",
]

def is_real_url(url: str) -> bool:
    """Return True only for URLs we know are genuinely scraped from Google Maps."""
    if not url or not url.startswith("http"):
        return False
    # Must be googleusercontent domain
    if "googleusercontent.com" not in url and "ggpht.com" not in url:
        return False
    # Fabricated ones look like:
    #   https://lh3.googleusercontent.com/p/AF1QipO5KhBr...=w1600-h1000-k-no
    # Real scraped ones look like:
    #   https://lh3.googleusercontent.com/grass-cs/AABkmLe...=w1600-h1000-k-no
    if "/grass-cs/" in url or "/gps-cs-s/" in url:
        return True
    # Accept real /p/ paths that were actually scraped (they have longer, varied hashes)
    # But the ones we fabricated all follow a very short identical pattern
    # To be safe: reject ALL AF1Qip-based URLs since we fabricated them all
    if "/p/AF1Qip" in url:
        return False
    return True


def main():
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())

    cleared = 0
    kept = 0
    for i, row in enumerate(rows):
        raw = row.get("photos", "[]").strip()
        try:
            urls = json.loads(raw) if raw not in ("[]", "", "null") else []
        except Exception:
            urls = []

        real = [u for u in urls if is_real_url(u)]
        fake = [u for u in urls if u not in real]

        if fake:
            print(f"  CLEARED {len(fake)} fake URLs from: {row['name']}")
            if fake:
                for f_url in fake[:2]:
                    print(f"    - {f_url[:80]}...")
            rows[i]["photos"] = json.dumps(real) if real else "[]"
            cleared += 1
        else:
            kept += 1

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Summary
    with_photos = sum(1 for r in rows if r.get("photos","[]").strip() not in ("[]","","null"))
    without = len(rows) - with_photos
    print(f"\nDone! Cleared fake photos from {cleared} venues, kept {kept} as-is.")
    print(f"Now: {with_photos} venues with real photos, {without} venues show no-photo icon.")


if __name__ == "__main__":
    main()
