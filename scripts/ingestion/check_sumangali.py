import csv

with open('scripts/ingestion/kerala_venues_master.csv', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

print('=== Searching for Sumangali ===')
matches = [r for r in rows if 'sumangali' in r['name'].lower()]
print(f'Found: {len(matches)}')
for r in matches:
    print(f"  {r['district']} | {r['city']} | {r['name']}")

print()
print('=== All Palakkad Kulappully venues ===')
kula = [r for r in rows if 'kulappully' in r['city'].lower() or 'kulap' in r['city'].lower()]
for r in kula:
    print(f"  {r['city']} | {r['name']}")

print()
print('=== Total venues:', len(rows))

