import csv
import json

CSV_PATH = "scripts/ingestion/kerala_venues_master.csv"

# Non-auditorium or duplicate entries to remove
NON_AUDITORIUMS = {
    "Bizla Ready Venue",
    "Bougainvillea Heritage",
    "The Gazebo Heritage",
    "Paradise convention hall",
    "Janabheri Convention Center",
    "GOLDEN PALACE CONVENTION CENTER",
    "C.M. Auditorium, Eliyappatta. Mayyathumkara",
    "Grand Kayarat Banquet Hall",
    "MUGUNDHA Heritage Auditorium",
    "V-Grand Convention Centre & Auditorium",
    "M.P. Auditorium",
    "Al-Falah Convention Hall",
    "Mayilvahanam Community Hall",
    "Prasannalakshmi Kalyana Mandapam & Auditorium",
}

with open(CSV_PATH, "r", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

initial_count = len(rows)
clean_rows = []
removed = []

for r in rows:
    name = r["name"].strip()
    if name in NON_AUDITORIUMS:
        removed.append(name)
    else:
        clean_rows.append(r)

print(f"Initial venue count: {initial_count}")
print(f"Removed non-auditoriums/duplicates ({len(removed)}):")
for rm in removed:
    print(f"  - {rm}")
print(f"Cleaned real venues count: {len(clean_rows)}")

