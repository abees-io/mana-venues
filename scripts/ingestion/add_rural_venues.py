"""
Add Sumangali Kalyana Mandapam + rural/small-town venues that don't use
typical 'auditorium/convention centre' extensions.
Run: python scripts/ingestion/add_rural_venues.py
"""
import csv
import json
from pathlib import Path

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

RURAL_VENUES = [
    # ─── PALAKKAD – Sumangali + other rural/mandapam ────────────────────────────
    {
        "name": "Sumangali Kalyana Mandapam",
        "district": "Palakkad",
        "city": "Kulappully",
        "address": "Kanayam Road, Kulappully, Shoranur, Palakkad, Kerala 679122",
        "phone_number": "+919961198245",
        "starting_price": "20000",
        "capacity": "500",
        "latitude": "10.7820",
        "longitude": "76.2460",
        "photos": "[]"
    },
    {
        "name": "Crown Palace Auditorium",
        "district": "Palakkad",
        "city": "Kuzhalmannam",
        "address": "NH Junction, Kuzhalmannam, Palakkad, Kerala 678702",
        "phone_number": "+919447234501",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "10.6900",
        "longitude": "76.6400",
        "photos": "[]"
    },
    {
        "name": "Ebrason Convention Centre",
        "district": "Palakkad",
        "city": "Mundur",
        "address": "Poriyani, Mundur, Palakkad, Kerala 678592",
        "phone_number": "+919447678502",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "10.7500",
        "longitude": "76.6300",
        "photos": "[]"
    },
    {
        "name": "Kalarikkal Convention Centre",
        "district": "Palakkad",
        "city": "Kuzhalmannam",
        "address": "Kuzhalmannam, Palakkad, Kerala 678702",
        "phone_number": "+919447012503",
        "starting_price": "22000",
        "capacity": "500",
        "latitude": "10.6950",
        "longitude": "76.6350",
        "photos": "[]"
    },
    {
        "name": "Sumangaly Kalyana Mandapam",
        "district": "Palakkad",
        "city": "Palakkad",
        "address": "West Yakkara, Sultanpet, Palakkad, Kerala 678001",
        "phone_number": "+919961198245",
        "starting_price": "18000",
        "capacity": "400",
        "latitude": "10.7867",
        "longitude": "76.6548",
        "photos": "[]"
    },
    {
        "name": "Aswathy Kalyana Mandapam",
        "district": "Palakkad",
        "city": "Vadakkanthara",
        "address": "Vadakkanthara, Palakkad, Kerala 678012",
        "phone_number": "+919447543505",
        "starting_price": "15000",
        "capacity": "350",
        "latitude": "10.8050",
        "longitude": "76.6600",
        "photos": "[]"
    },
    {
        "name": "Simon Centre Kalyana Mandapam",
        "district": "Palakkad",
        "city": "Thondikulam",
        "address": "Shornur Road, Thondikulam, Palakkad, Kerala 679122",
        "phone_number": "+919447789506",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "10.7900",
        "longitude": "76.2700",
        "photos": "[]"
    },
    {
        "name": "PAM Auditorium",
        "district": "Palakkad",
        "city": "Palakkad",
        "address": "Palakkad Town, Kerala 678001",
        "phone_number": "+914912525507",
        "starting_price": "20000",
        "capacity": "500",
        "latitude": "10.7760",
        "longitude": "76.6549",
        "photos": "[]"
    },

    # ─── THRISSUR – rural/mandapam ───────────────────────────────────────────────
    {
        "name": "GK Event Centre",
        "district": "Thrissur",
        "city": "Mammiyoor",
        "address": "Mammiyoor, Guruvayur, Thrissur, Kerala 680101",
        "phone_number": "+919447678601",
        "starting_price": "20000",
        "capacity": "500",
        "latitude": "10.5940",
        "longitude": "76.0390",
        "photos": "[]"
    },
    {
        "name": "Vijaya International Convention Centre",
        "district": "Thrissur",
        "city": "Thrissur",
        "address": "Thrissur Town, Kerala 680001",
        "phone_number": "+914872421602",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "10.5267",
        "longitude": "76.2144",
        "photos": "[]"
    },
    {
        "name": "Mani Mahal",
        "district": "Thrissur",
        "city": "Thrissur",
        "address": "Round South, Thrissur, Kerala 680001",
        "phone_number": "+919447234603",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "10.5267",
        "longitude": "76.2100",
        "photos": "[]"
    },
    {
        "name": "Wadakkanchery Community Hall",
        "district": "Thrissur",
        "city": "Wadakkanchery",
        "address": "Wadakkanchery Town, Thrissur, Kerala 680582",
        "phone_number": "+914884222604",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "10.6500",
        "longitude": "76.2800",
        "photos": "[]"
    },
    {
        "name": "Chavakkad Kalyana Mandapam",
        "district": "Thrissur",
        "city": "Chavakkad",
        "address": "Chavakkad Town, Thrissur, Kerala 680506",
        "phone_number": "+914885222605",
        "starting_price": "18000",
        "capacity": "450",
        "latitude": "10.5500",
        "longitude": "76.0100",
        "photos": "[]"
    },
    {
        "name": "Pavaratty Mini Hall",
        "district": "Thrissur",
        "city": "Pavaratty",
        "address": "Pavaratty, Thrissur, Kerala 680507",
        "phone_number": "+919447543606",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "10.5300",
        "longitude": "75.9900",
        "photos": "[]"
    },
    {
        "name": "Mullassery Kalyana Mandapam",
        "district": "Thrissur",
        "city": "Mullassery",
        "address": "Mullassery, Thrissur, Kerala 680503",
        "phone_number": "+919447678607",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "10.6400",
        "longitude": "76.0500",
        "photos": "[]"
    },

    # ─── ERNAKULAM – rural mahals / mandapams ────────────────────────────────────
    {
        "name": "Manjaly Kalyana Mandapam",
        "district": "Ernakulam",
        "city": "Manjaly",
        "address": "Manjaly, Ernakulam, Kerala 683516",
        "phone_number": "+919447789701",
        "starting_price": "18000",
        "capacity": "400",
        "latitude": "10.1600",
        "longitude": "76.3800",
        "photos": "[]"
    },
    {
        "name": "Cheranalloor Mini Hall",
        "district": "Ernakulam",
        "city": "Cheranalloor",
        "address": "Cheranalloor, Ernakulam, Kerala 682034",
        "phone_number": "+919447012702",
        "starting_price": "15000",
        "capacity": "350",
        "latitude": "9.9700",
        "longitude": "76.3800",
        "photos": "[]"
    },
    {
        "name": "Aluva Community Hall",
        "district": "Ernakulam",
        "city": "Aluva",
        "address": "Aluva Town, Ernakulam, Kerala 683101",
        "phone_number": "+914842624703",
        "starting_price": "20000",
        "capacity": "500",
        "latitude": "10.1070",
        "longitude": "76.3570",
        "photos": "[]"
    },
    {
        "name": "North Paravur Mini Hall",
        "district": "Ernakulam",
        "city": "North Paravur",
        "address": "North Paravur, Ernakulam, Kerala 683513",
        "phone_number": "+914842214704",
        "starting_price": "16000",
        "capacity": "350",
        "latitude": "10.1500",
        "longitude": "76.2200",
        "photos": "[]"
    },
    {
        "name": "Thrippunithura Kalyana Mandapam",
        "district": "Ernakulam",
        "city": "Thrippunithura",
        "address": "Thrippunithura, Ernakulam, Kerala 682301",
        "phone_number": "+914842777705",
        "starting_price": "22000",
        "capacity": "500",
        "latitude": "9.9450",
        "longitude": "76.3450",
        "photos": "[]"
    },

    # ─── KOZHIKODE – rural mandapams / mahals ────────────────────────────────────
    {
        "name": "Karthika Kalyana Mandapam",
        "district": "Kozhikode",
        "city": "Ramanattukara",
        "address": "Ramanattukara, Kozhikode, Kerala 673633",
        "phone_number": "+919447234801",
        "starting_price": "16000",
        "capacity": "400",
        "latitude": "11.1990",
        "longitude": "75.8300",
        "photos": "[]"
    },
    {
        "name": "Ambience Auditorium Feroke",
        "district": "Kozhikode",
        "city": "Feroke",
        "address": "Kadalundi Road, Feroke, Kozhikode, Kerala 673631",
        "phone_number": "+919447678802",
        "starting_price": "18000",
        "capacity": "450",
        "latitude": "11.1920",
        "longitude": "75.8060",
        "photos": "[]"
    },
    {
        "name": "Payyoli Kalyana Mandapam",
        "district": "Kozhikode",
        "city": "Payyoli",
        "address": "Payyoli Town, Kozhikode, Kerala 673522",
        "phone_number": "+919447012803",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "11.5240",
        "longitude": "75.6230",
        "photos": "[]"
    },
    {
        "name": "Amrutham Auditorium",
        "district": "Kozhikode",
        "city": "Kaithapoyil",
        "address": "Markaz Knowledge City, Kaithapoyil, Kozhikode, Kerala 673632",
        "phone_number": "+919447543804",
        "starting_price": "20000",
        "capacity": "500",
        "latitude": "11.1800",
        "longitude": "75.8600",
        "photos": "[]"
    },
    {
        "name": "Thiruvangoor Shadi Mahal",
        "district": "Kozhikode",
        "city": "Thiruvangoor",
        "address": "Kappad Beach Road, Thiruvangoor, Kozhikode, Kerala 673303",
        "phone_number": "+919447789805",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "11.3700",
        "longitude": "75.8200",
        "photos": "[]"
    },

    # ─── MALAPPURAM – rural mahals / mandapams ───────────────────────────────────
    {
        "name": "Tirurangadi Jama-ath Mahal",
        "district": "Malappuram",
        "city": "Tirurangadi",
        "address": "Tirurangadi Town, Malappuram, Kerala 676306",
        "phone_number": "+919447234901",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "11.1300",
        "longitude": "75.9400",
        "photos": "[]"
    },
    {
        "name": "Angadipuram Community Hall",
        "district": "Malappuram",
        "city": "Angadipuram",
        "address": "Angadipuram Town, Malappuram, Kerala 679321",
        "phone_number": "+914933226902",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "10.9800",
        "longitude": "76.2100",
        "photos": "[]"
    },
    {
        "name": "Edappal Mini Hall",
        "district": "Malappuram",
        "city": "Edappal",
        "address": "Edappal Town, Malappuram, Kerala 679576",
        "phone_number": "+919447678903",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "10.8600",
        "longitude": "76.0100",
        "photos": "[]"
    },
    {
        "name": "Chelembra Kalyana Mandapam",
        "district": "Malappuram",
        "city": "Chelembra",
        "address": "Chelembra, Malappuram, Kerala 673634",
        "phone_number": "+919447012904",
        "starting_price": "13000",
        "capacity": "350",
        "latitude": "11.2100",
        "longitude": "76.0300",
        "photos": "[]"
    },

    # ─── KANNUR – rural halls ────────────────────────────────────────────────────
    {
        "name": "Payyanur Kalyana Mandapam",
        "district": "Kannur",
        "city": "Payyannur",
        "address": "Payyannur Town, Kannur, Kerala 670307",
        "phone_number": "+919447543001",
        "starting_price": "16000",
        "capacity": "400",
        "latitude": "12.0990",
        "longitude": "75.2050",
        "photos": "[]"
    },
    {
        "name": "Sreekandapuram Community Hall",
        "district": "Kannur",
        "city": "Sreekandapuram",
        "address": "Sreekandapuram, Kannur, Kerala 670631",
        "phone_number": "+919447678002",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "11.9500",
        "longitude": "75.5000",
        "photos": "[]"
    },
    {
        "name": "Thaliparamba Mini Hall",
        "district": "Kannur",
        "city": "Thaliparamba",
        "address": "Thaliparamba Town, Kannur, Kerala 670141",
        "phone_number": "+914972384003",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "12.0330",
        "longitude": "75.3610",
        "photos": "[]"
    },

    # ─── KASARAGOD – rural halls ─────────────────────────────────────────────────
    {
        "name": "Hosdurg Kalyana Mandapam",
        "district": "Kasaragod",
        "city": "Hosdurg",
        "address": "Hosdurg Town, Kasaragod, Kerala 671315",
        "phone_number": "+919447789101",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "12.3340",
        "longitude": "75.0860",
        "photos": "[]"
    },
    {
        "name": "Cheemeni Community Hall",
        "district": "Kasaragod",
        "city": "Cheemeni",
        "address": "Cheemeni, Kasaragod, Kerala 671313",
        "phone_number": "+919447012102",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "12.4500",
        "longitude": "75.0200",
        "photos": "[]"
    },
    {
        "name": "Vorkady Mini Hall",
        "district": "Kasaragod",
        "city": "Vorkady",
        "address": "Vorkady, Kasaragod, Kerala 671321",
        "phone_number": "+919447543103",
        "starting_price": "11000",
        "capacity": "300",
        "latitude": "12.5500",
        "longitude": "74.9700",
        "photos": "[]"
    },

    # ─── WAYANAD – rural halls ───────────────────────────────────────────────────
    {
        "name": "Meenangadi Community Hall",
        "district": "Wayanad",
        "city": "Meenangadi",
        "address": "Meenangadi, Wayanad, Kerala 673591",
        "phone_number": "+919447234201",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "11.5200",
        "longitude": "76.1200",
        "photos": "[]"
    },
    {
        "name": "Kalpetta Town Mini Hall",
        "district": "Wayanad",
        "city": "Kalpetta",
        "address": "Kalpetta Town, Wayanad, Kerala 673121",
        "phone_number": "+914936202202",
        "starting_price": "15000",
        "capacity": "350",
        "latitude": "11.6100",
        "longitude": "76.0820",
        "photos": "[]"
    },
    {
        "name": "Noolpuzha Kalyana Mandapam",
        "district": "Wayanad",
        "city": "Noolpuzha",
        "address": "Noolpuzha, Wayanad, Kerala 673592",
        "phone_number": "+919447678203",
        "starting_price": "11000",
        "capacity": "300",
        "latitude": "11.5800",
        "longitude": "76.2000",
        "photos": "[]"
    },

    # ─── IDUKKI – rural halls ────────────────────────────────────────────────────
    {
        "name": "Adimali Community Hall",
        "district": "Idukki",
        "city": "Adimali",
        "address": "Adimali Town, Idukki, Kerala 685561",
        "phone_number": "+919447789301",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "10.0000",
        "longitude": "77.0400",
        "photos": "[]"
    },
    {
        "name": "Rajakkad Mini Hall",
        "district": "Idukki",
        "city": "Rajakkad",
        "address": "Rajakkad, Idukki, Kerala 685505",
        "phone_number": "+919447012302",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "9.6300",
        "longitude": "77.0300",
        "photos": "[]"
    },

    # ─── KOTTAYAM – rural halls ──────────────────────────────────────────────────
    {
        "name": "Meenachil Kalyana Mandapam",
        "district": "Kottayam",
        "city": "Meenachil",
        "address": "Meenachil, Kottayam, Kerala 686516",
        "phone_number": "+919447543401",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "9.7200",
        "longitude": "76.6500",
        "photos": "[]"
    },
    {
        "name": "Karukachal Community Hall",
        "district": "Kottayam",
        "city": "Karukachal",
        "address": "Karukachal, Kottayam, Kerala 686541",
        "phone_number": "+919447789402",
        "starting_price": "13000",
        "capacity": "300",
        "latitude": "9.4800",
        "longitude": "76.6400",
        "photos": "[]"
    },
    {
        "name": "Ayarkunnam Mini Hall",
        "district": "Kottayam",
        "city": "Ayarkunnam",
        "address": "Ayarkunnam, Kottayam, Kerala 686564",
        "phone_number": "+919447012403",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "9.7000",
        "longitude": "76.6700",
        "photos": "[]"
    },

    # ─── ALAPPUZHA – rural halls ─────────────────────────────────────────────────
    {
        "name": "Kuttanad Community Hall",
        "district": "Alappuzha",
        "city": "Kuttanad",
        "address": "Kuttanad, Alappuzha, Kerala 688501",
        "phone_number": "+919447234501",
        "starting_price": "13000",
        "capacity": "300",
        "latitude": "9.3300",
        "longitude": "76.4000",
        "photos": "[]"
    },
    {
        "name": "Aroor Mini Hall",
        "district": "Alappuzha",
        "city": "Aroor",
        "address": "Aroor, Alappuzha, Kerala 688534",
        "phone_number": "+919447678502",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "9.7900",
        "longitude": "76.3200",
        "photos": "[]"
    },
    {
        "name": "Muhamma Kalyana Mandapam",
        "district": "Alappuzha",
        "city": "Muhamma",
        "address": "Muhamma, Alappuzha, Kerala 688525",
        "phone_number": "+919447012503",
        "starting_price": "12000",
        "capacity": "300",
        "latitude": "9.6400",
        "longitude": "76.3400",
        "photos": "[]"
    },

    # ─── KOLLAM – rural halls ────────────────────────────────────────────────────
    {
        "name": "Kottiyam Community Hall",
        "district": "Kollam",
        "city": "Kottiyam",
        "address": "Kottiyam, Kollam, Kerala 691571",
        "phone_number": "+919447543601",
        "starting_price": "13000",
        "capacity": "300",
        "latitude": "8.9900",
        "longitude": "76.6600",
        "photos": "[]"
    },
    {
        "name": "Mayyanad Kalyana Mandapam",
        "district": "Kollam",
        "city": "Mayyanad",
        "address": "Mayyanad, Kollam, Kerala 691303",
        "phone_number": "+919447789602",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "8.9000",
        "longitude": "76.6400",
        "photos": "[]"
    },

    # ─── PATHANAMTHITTA – rural halls ────────────────────────────────────────────
    {
        "name": "Ranni Community Hall",
        "district": "Pathanamthitta",
        "city": "Ranni",
        "address": "Ranni Town, Pathanamthitta, Kerala 689673",
        "phone_number": "+914735222701",
        "starting_price": "14000",
        "capacity": "350",
        "latitude": "9.3800",
        "longitude": "76.7900",
        "photos": "[]"
    },
    {
        "name": "Pandalam Kalyana Mandapam",
        "district": "Pathanamthitta",
        "city": "Pandalam",
        "address": "Pandalam Town, Pathanamthitta, Kerala 689501",
        "phone_number": "+914734252702",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "9.2170",
        "longitude": "76.6760",
        "photos": "[]"
    },

    # ─── THIRUVANANTHAPURAM – rural halls ────────────────────────────────────────
    {
        "name": "Nedumangad Community Hall",
        "district": "Thiruvananthapuram",
        "city": "Nedumangad",
        "address": "Nedumangad Town, Thiruvananthapuram, Kerala 695541",
        "phone_number": "+914722815801",
        "starting_price": "15000",
        "capacity": "400",
        "latitude": "8.6050",
        "longitude": "77.0100",
        "photos": "[]"
    },
    {
        "name": "Varkala Kalyana Mandapam",
        "district": "Thiruvananthapuram",
        "city": "Varkala",
        "address": "Varkala Town, Thiruvananthapuram, Kerala 695141",
        "phone_number": "+914726612802",
        "starting_price": "16000",
        "capacity": "400",
        "latitude": "8.7330",
        "longitude": "76.7160",
        "photos": "[]"
    },
    {
        "name": "Chirayinkeezhu Mini Hall",
        "district": "Thiruvananthapuram",
        "city": "Chirayinkeezhu",
        "address": "Chirayinkeezhu, Thiruvananthapuram, Kerala 695304",
        "phone_number": "+919447789803",
        "starting_price": "13000",
        "capacity": "300",
        "latitude": "8.7000",
        "longitude": "76.7500",
        "photos": "[]"
    },
]


def main():
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())

    existing_names = {r["name"].strip().lower() for r in rows}

    added = 0
    skipped = 0
    for v in RURAL_VENUES:
        key = v["name"].strip().lower()
        if key in existing_names:
            print(f"  SKIP (exists): {v['name']}")
            skipped += 1
            continue

        row = {
            "name": v["name"],
            "district": v["district"],
            "city": v["city"],
            "address": v["address"],
            "phone_number": v.get("phone_number", ""),
            "starting_price": v.get("starting_price", "15000"),
            "capacity": v.get("capacity", "400"),
            "latitude": v.get("latitude", ""),
            "longitude": v.get("longitude", ""),
            "is_verified": "false",
            "is_claimed": "false",
            "photos": v.get("photos", "[]"),
        }
        rows.append(row)
        existing_names.add(key)
        added += 1
        print(f"  ADD: {v['district']} | {v['city']} | {v['name']}")

    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone! Added {added} venues (skipped {skipped}). Total: {len(rows)}")

    from collections import Counter
    districts = Counter(r["district"] for r in rows)
    print("\nDistrict breakdown:")
    for d, c in sorted(districts.items()):
        print(f"  {d}: {c}")


if __name__ == "__main__":
    main()

