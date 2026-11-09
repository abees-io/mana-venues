import csv
import json
from collections import defaultdict

with open("scripts/ingestion/kerala_venues_master.csv", "r", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

photo_to_venues = defaultdict(list)
for r in rows:
    name = r["name"]
    p = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
    for url in p:
        photo_to_venues[url].append(name)

duplicates = {url: venues for url, venues in photo_to_venues.items() if len(venues) > 1}
print(f"Total unique photo URLs: {len(photo_to_venues)}")
print(f"Photo URLs shared across multiple venues: {len(duplicates)}")

venue_conflicts = defaultdict(set)
for url, venues in duplicates.items():
    for v in venues:
        venue_conflicts[v].update(venues)

print(f"Venues with shared/shuffled photos: {len(venue_conflicts)}")
for v, others in list(venue_conflicts.items()):
    shared_with = [o for o in others if o != v]
    print(f"  Venue '{v}' shares photos with: {shared_with}")

