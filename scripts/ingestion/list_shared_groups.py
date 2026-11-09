import csv
import json
from collections import defaultdict

with open("scripts/ingestion/kerala_venues_master.csv", "r", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

photo_map = defaultdict(list)
for idx, r in enumerate(rows):
    name = r["name"]
    photos = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
    for p in photos:
        photo_map[p].append((idx, name))

print(f"Total venues: {len(rows)}")
shared_photos = {p: venues for p, venues in photo_map.items() if len(venues) > 1}
print(f"Number of shared photo URLs: {len(shared_photos)}")

for i, (photo, vlist) in enumerate(list(shared_photos.items())):
    names = [v[1] for v in vlist]
    print(f"Group {i+1} ({len(names)} venues share this photo): {names}")

