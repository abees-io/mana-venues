import csv
import json
from collections import defaultdict
from filter_clean_venues import NON_AUDITORIUMS, CSV_PATH

with open(CSV_PATH, "r", encoding="utf-8") as f:
    rows = [r for r in csv.DictReader(f) if r["name"].strip() not in NON_AUDITORIUMS]

photo_map = defaultdict(list)
for r in rows:
    name = r["name"]
    photos = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
    for p in photos:
        photo_map[p].append(name)

shared = {p: v for p, v in photo_map.items() if len(v) > 1}
print(f"Remaining real venues: {len(rows)}")
print(f"Shared photo URLs among remaining real venues: {len(shared)}")
for p, v in shared.items():
    print(f"  Photo shared by: {v}")

