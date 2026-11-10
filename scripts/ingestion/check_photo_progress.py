import csv, json
from collections import Counter

with open('scripts/ingestion/kerala_venues_master.csv', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

total = len(rows)
with_photos = [r for r in rows if r.get('photos','[]').strip() not in ('[]','','null')]
without_photos = [r for r in rows if r.get('photos','[]').strip() in ('[]','','null')]

print(f'Total venues:    {total}')
print(f'With photos:     {len(with_photos)}')
print(f'Without photos:  {len(without_photos)}')

if without_photos:
    districts = Counter(r['district'] for r in without_photos)
    print('\nStill missing photos by district:')
    for d, c in sorted(districts.items()):
        print(f'  {d}: {c}')
    print('\nFirst 10 missing:')
    for r in without_photos[:10]:
        print(f"  {r['district']} | {r['city']} | {r['name']}")

