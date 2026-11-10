"""
Script to add comprehensive new venues across all 14 Kerala districts.
Run: python scripts/ingestion/add_new_venues.py
"""
import csv
import json
import os

NEW_VENUES = [
    # ─── THIRUVANANTHAPURAM (10 more) ───────────────────────────────────────────
    {
        "name": "Uday Palace Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Kowdiar",
        "address": "Kowdiar Palace Road, Kowdiar, Thiruvananthapuram, Kerala 695003",
        "phone_number": "+914712722222",
        "starting_price": "80000",
        "capacity": "2000",
        "latitude": "8.5241",
        "longitude": "76.9366",
        "photos": "[]"
    },
    {
        "name": "RDR Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Thycaud",
        "address": "Thycaud, Thiruvananthapuram, Kerala 695014",
        "phone_number": "+914712337733",
        "starting_price": "55000",
        "capacity": "1500",
        "latitude": "8.5083",
        "longitude": "76.9519",
        "photos": "[]"
    },
    {
        "name": "Alakapuri Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Sasthamangalam",
        "address": "Sasthamangalam Junction, Thiruvananthapuram, Kerala 695010",
        "phone_number": "+914712724444",
        "starting_price": "40000",
        "capacity": "800",
        "latitude": "8.5125",
        "longitude": "76.9411",
        "photos": "[]"
    },
    {
        "name": "Rashaj Windsor Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Nagaroor",
        "address": "Nagaroor, Thiruvananthapuram, Kerala 695126",
        "phone_number": "+919847010101",
        "starting_price": "60000",
        "capacity": "2000",
        "latitude": "8.6150",
        "longitude": "76.9500",
        "photos": "[]"
    },
    {
        "name": "Travancore International Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Kariavattom",
        "address": "Kariavattom, Thiruvananthapuram, Kerala 695581",
        "phone_number": "+914712418000",
        "starting_price": "100000",
        "capacity": "3000",
        "latitude": "8.5590",
        "longitude": "76.8820",
        "photos": "[]"
    },
    {
        "name": "Royal Palace Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Pirappancode",
        "address": "Pirappancode, Thiruvananthapuram, Kerala 695301",
        "phone_number": "+919447551234",
        "starting_price": "45000",
        "capacity": "1200",
        "latitude": "8.6700",
        "longitude": "76.9200",
        "photos": "[]"
    },
    {
        "name": "Jeevan Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Attingal",
        "address": "Attingal Junction, Attingal, Thiruvananthapuram, Kerala 695101",
        "phone_number": "+919447789012",
        "starting_price": "35000",
        "capacity": "1000",
        "latitude": "8.6975",
        "longitude": "76.8156",
        "photos": "[]"
    },
    {
        "name": "Neyyattinkara Convention Hall",
        "district": "Thiruvananthapuram",
        "city": "Neyyattinkara",
        "address": "Main Road, Neyyattinkara, Thiruvananthapuram, Kerala 695121",
        "phone_number": "+919447654321",
        "starting_price": "30000",
        "capacity": "800",
        "latitude": "8.3990",
        "longitude": "77.0870",
        "photos": "[]"
    },
    {
        "name": "Vellayani Gardens Convention Centre",
        "district": "Thiruvananthapuram",
        "city": "Vellayani",
        "address": "Vellayani Road, Thiruvananthapuram, Kerala 695522",
        "phone_number": "+919847223344",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "8.4700",
        "longitude": "76.9500",
        "photos": "[]"
    },
    {
        "name": "Sreekaryam Grand Convention Hall",
        "district": "Thiruvananthapuram",
        "city": "Sreekaryam",
        "address": "Sreekaryam Road, Thiruvananthapuram, Kerala 695017",
        "phone_number": "+914712591234",
        "starting_price": "50000",
        "capacity": "1200",
        "latitude": "8.5340",
        "longitude": "76.9080",
        "photos": "[]"
    },

    # ─── KOLLAM (8 more) ─────────────────────────────────────────────────────────
    {
        "name": "Grand Highness Convention Centre",
        "district": "Kollam",
        "city": "Ayiramthengu",
        "address": "Ayiramthengu, Kollam, Kerala 690544",
        "phone_number": "+919447678901",
        "starting_price": "50000",
        "capacity": "1500",
        "latitude": "9.0100",
        "longitude": "76.5300",
        "photos": "[]"
    },
    {
        "name": "Platinum Convention Centre",
        "district": "Kollam",
        "city": "Kollam",
        "address": "Bishop Jerome Nagar, Kollam, Kerala 691001",
        "phone_number": "+914742792345",
        "starting_price": "60000",
        "capacity": "2000",
        "latitude": "8.8932",
        "longitude": "76.6141",
        "photos": "[]"
    },
    {
        "name": "Deepika Convention Hall",
        "district": "Kollam",
        "city": "Paravur",
        "address": "Paravur, Kollam, Kerala 691301",
        "phone_number": "+919447512345",
        "starting_price": "35000",
        "capacity": "800",
        "latitude": "8.9850",
        "longitude": "76.6760",
        "photos": "[]"
    },
    {
        "name": "Karunagapally Convention Centre",
        "district": "Kollam",
        "city": "Karunagapally",
        "address": "Main Road, Karunagapally, Kollam, Kerala 690518",
        "phone_number": "+919447098765",
        "starting_price": "30000",
        "capacity": "700",
        "latitude": "9.0620",
        "longitude": "76.5400",
        "photos": "[]"
    },
    {
        "name": "Rohini Auditorium",
        "district": "Kollam",
        "city": "Punalur",
        "address": "Punalur Town, Kollam, Kerala 691305",
        "phone_number": "+919447987654",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "9.0100",
        "longitude": "76.9300",
        "photos": "[]"
    },
    {
        "name": "Thangam Convention Centre",
        "district": "Kollam",
        "city": "Kundara",
        "address": "Kundara Town, Kollam, Kerala 691501",
        "phone_number": "+919447543210",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "8.9900",
        "longitude": "76.6900",
        "photos": "[]"
    },
    {
        "name": "Sastha Convention Hall",
        "district": "Kollam",
        "city": "Anchal",
        "address": "Anchal, Kollam, Kerala 691306",
        "phone_number": "+919847345678",
        "starting_price": "22000",
        "capacity": "500",
        "latitude": "8.9800",
        "longitude": "77.0100",
        "photos": "[]"
    },
    {
        "name": "Green Meadows Convention Centre",
        "district": "Kollam",
        "city": "Chavara",
        "address": "Chavara, Kollam, Kerala 691583",
        "phone_number": "+919447234567",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "8.9600",
        "longitude": "76.5300",
        "photos": "[]"
    },

    # ─── PATHANAMTHITTA (6 more) ─────────────────────────────────────────────────
    {
        "name": "M Convention Centre",
        "district": "Pathanamthitta",
        "city": "Vallicode",
        "address": "Vallicode, Pathanamthitta, Kerala 689624",
        "phone_number": "+919447789123",
        "starting_price": "55000",
        "capacity": "2000",
        "latitude": "9.2500",
        "longitude": "76.7800",
        "photos": "[]"
    },
    {
        "name": "Anns Convention Centre",
        "district": "Pathanamthitta",
        "city": "Kadapra",
        "address": "Kadapra, Thiruvalla, Pathanamthitta, Kerala 689115",
        "phone_number": "+919447456789",
        "starting_price": "45000",
        "capacity": "1500",
        "latitude": "9.3600",
        "longitude": "76.5800",
        "photos": "[]"
    },
    {
        "name": "Geetham Convention Centre",
        "district": "Pathanamthitta",
        "city": "Adoor",
        "address": "Market Junction, Adoor, Pathanamthitta, Kerala 691523",
        "phone_number": "+914734224567",
        "starting_price": "30000",
        "capacity": "800",
        "latitude": "9.1570",
        "longitude": "76.6600",
        "photos": "[]"
    },
    {
        "name": "Anjali Auditorium",
        "district": "Pathanamthitta",
        "city": "Omalloor",
        "address": "Omalloor, Pathanamthitta, Kerala 689647",
        "phone_number": "+919447123890",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "9.3000",
        "longitude": "76.7300",
        "photos": "[]"
    },
    {
        "name": "Balakrishna Convention Centre",
        "district": "Pathanamthitta",
        "city": "Mulakuzha",
        "address": "Mulakuzha, Chengannur, Pathanamthitta, Kerala 689508",
        "phone_number": "+919447678234",
        "starting_price": "60000",
        "capacity": "2500",
        "latitude": "9.3200",
        "longitude": "76.6200",
        "photos": "[]"
    },
    {
        "name": "Kozhenchery Grand Hall",
        "district": "Pathanamthitta",
        "city": "Kozhenchery",
        "address": "Kozhenchery Town, Pathanamthitta, Kerala 689641",
        "phone_number": "+914732212345",
        "starting_price": "32000",
        "capacity": "900",
        "latitude": "9.3700",
        "longitude": "76.7100",
        "photos": "[]"
    },

    # ─── ALAPPUZHA (8 more) ──────────────────────────────────────────────────────
    {
        "name": "Bhuvi Convention Centre",
        "district": "Alappuzha",
        "city": "Nangyarkulangara",
        "address": "Nangyarkulangara, Alappuzha, Kerala 688503",
        "phone_number": "+919447345890",
        "starting_price": "55000",
        "capacity": "1500",
        "latitude": "9.3800",
        "longitude": "76.4200",
        "photos": "[]"
    },
    {
        "name": "Preethi Convention Centre",
        "district": "Alappuzha",
        "city": "Mavelikara",
        "address": "Near Municipal Court, Mavelikara, Alappuzha, Kerala 690101",
        "phone_number": "+919447987321",
        "starting_price": "35000",
        "capacity": "800",
        "latitude": "9.2700",
        "longitude": "76.5600",
        "photos": "[]"
    },
    {
        "name": "Grace Convention Centre",
        "district": "Alappuzha",
        "city": "Mavelikara",
        "address": "Laha Junction, Mavelikara, Alappuzha, Kerala 690101",
        "phone_number": "+919447654789",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "9.2750",
        "longitude": "76.5650",
        "photos": "[]"
    },
    {
        "name": "Chengannur Convention Hall",
        "district": "Alappuzha",
        "city": "Chengannur",
        "address": "Main Road, Chengannur, Alappuzha, Kerala 689121",
        "phone_number": "+919447234890",
        "starting_price": "40000",
        "capacity": "1200",
        "latitude": "9.3240",
        "longitude": "76.6160",
        "photos": "[]"
    },
    {
        "name": "Haripad Convention Centre",
        "district": "Alappuzha",
        "city": "Haripad",
        "address": "Haripad Town, Alappuzha, Kerala 690514",
        "phone_number": "+919447789456",
        "starting_price": "30000",
        "capacity": "700",
        "latitude": "9.2300",
        "longitude": "76.4700",
        "photos": "[]"
    },
    {
        "name": "Mararikulam Convention Hall",
        "district": "Alappuzha",
        "city": "Mararikulam",
        "address": "Mararikulam North, Alappuzha, Kerala 688523",
        "phone_number": "+919447098234",
        "starting_price": "28000",
        "capacity": "600",
        "latitude": "9.5750",
        "longitude": "76.3200",
        "photos": "[]"
    },
    {
        "name": "Ambalappuzha Palace Hall",
        "district": "Alappuzha",
        "city": "Ambalappuzha",
        "address": "Ambalappuzha Town, Alappuzha, Kerala 688561",
        "phone_number": "+919447543789",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "9.3700",
        "longitude": "76.3600",
        "photos": "[]"
    },
    {
        "name": "Cherthala Grand Convention Centre",
        "district": "Alappuzha",
        "city": "Cherthala",
        "address": "NH 66, Cherthala, Alappuzha, Kerala 688524",
        "phone_number": "+919447678567",
        "starting_price": "45000",
        "capacity": "1200",
        "latitude": "9.6830",
        "longitude": "76.3350",
        "photos": "[]"
    },

    # ─── KOTTAYAM (8 more) ──────────────────────────────────────────────────────
    {
        "name": "Grand Arena Convention Centre",
        "district": "Kottayam",
        "city": "Ettumanoor",
        "address": "Pattithanam, Ettumanoor, Kottayam, Kerala 686631",
        "phone_number": "+919447890123",
        "starting_price": "70000",
        "capacity": "2500",
        "latitude": "9.6700",
        "longitude": "76.5600",
        "photos": "[]"
    },
    {
        "name": "Aithousa Convention Centre",
        "district": "Kottayam",
        "city": "Kumaranalloor",
        "address": "Kumaranalloor, Kottayam, Kerala 686016",
        "phone_number": "+919447345123",
        "starting_price": "50000",
        "capacity": "1500",
        "latitude": "9.5500",
        "longitude": "76.5300",
        "photos": "[]"
    },
    {
        "name": "Nazrani Auditorium",
        "district": "Kottayam",
        "city": "Changanacherry",
        "address": "Changanacherry Town, Kottayam, Kerala 686101",
        "phone_number": "+914812424567",
        "starting_price": "40000",
        "capacity": "1200",
        "latitude": "9.4440",
        "longitude": "76.5410",
        "photos": "[]"
    },
    {
        "name": "Pala Convention Hall",
        "district": "Kottayam",
        "city": "Pala",
        "address": "Pala Town, Kottayam, Kerala 686575",
        "phone_number": "+914822212345",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "9.7100",
        "longitude": "76.6900",
        "photos": "[]"
    },
    {
        "name": "Erattupetta Convention Centre",
        "district": "Kottayam",
        "city": "Erattupetta",
        "address": "Erattupetta Town, Kottayam, Kerala 686121",
        "phone_number": "+914822234567",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "9.6900",
        "longitude": "76.7800",
        "photos": "[]"
    },
    {
        "name": "Vaikom Heritage Convention Hall",
        "district": "Kottayam",
        "city": "Vaikom",
        "address": "Vaikom Town, Kottayam, Kerala 686141",
        "phone_number": "+914829236789",
        "starting_price": "30000",
        "capacity": "800",
        "latitude": "9.7510",
        "longitude": "76.3980",
        "photos": "[]"
    },
    {
        "name": "Kanjikuzhy Grand Auditorium",
        "district": "Kottayam",
        "city": "Kottayam",
        "address": "Kanjikuzhy, Kottayam, Kerala 686004",
        "phone_number": "+914812560123",
        "starting_price": "55000",
        "capacity": "1500",
        "latitude": "9.5894",
        "longitude": "76.5223",
        "photos": "[]"
    },
    {
        "name": "Mundakkayam Convention Hall",
        "district": "Kottayam",
        "city": "Mundakkayam",
        "address": "Mundakkayam, Kottayam, Kerala 686513",
        "phone_number": "+919447456012",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "9.5200",
        "longitude": "76.9000",
        "photos": "[]"
    },

    # ─── IDUKKI (6 more) ────────────────────────────────────────────────────────
    {
        "name": "Munnar Convention Centre",
        "district": "Idukki",
        "city": "Munnar",
        "address": "Munnar Town, Idukki, Kerala 685612",
        "phone_number": "+914865232123",
        "starting_price": "40000",
        "capacity": "800",
        "latitude": "10.0889",
        "longitude": "77.0595",
        "photos": "[]"
    },
    {
        "name": "Nedumkandam Grand Hall",
        "district": "Idukki",
        "city": "Nedumkandam",
        "address": "Nedumkandam Town, Idukki, Kerala 685553",
        "phone_number": "+914868233456",
        "starting_price": "22000",
        "capacity": "500",
        "latitude": "9.8740",
        "longitude": "77.1750",
        "photos": "[]"
    },
    {
        "name": "Kothamangalam Convention Centre",
        "district": "Idukki",
        "city": "Kothamangalam",
        "address": "Kothamangalam Town, Ernakulam border, Kerala 686691",
        "phone_number": "+914852212567",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "10.0570",
        "longitude": "76.6670",
        "photos": "[]"
    },
    {
        "name": "Vagamon Hill Convention Hall",
        "district": "Idukki",
        "city": "Vagamon",
        "address": "Vagamon, Idukki, Kerala 685503",
        "phone_number": "+919447789567",
        "starting_price": "30000",
        "capacity": "600",
        "latitude": "9.6900",
        "longitude": "76.9000",
        "photos": "[]"
    },
    {
        "name": "Peermade Convention Centre",
        "district": "Idukki",
        "city": "Peermade",
        "address": "Peermade, Idukki, Kerala 685531",
        "phone_number": "+919447234678",
        "starting_price": "25000",
        "capacity": "500",
        "latitude": "9.5500",
        "longitude": "77.0100",
        "photos": "[]"
    },
    {
        "name": "Devikulam Convention Hall",
        "district": "Idukki",
        "city": "Devikulam",
        "address": "Devikulam, Idukki, Kerala 685613",
        "phone_number": "+914865253789",
        "starting_price": "20000",
        "capacity": "400",
        "latitude": "10.0400",
        "longitude": "77.1100",
        "photos": "[]"
    },

    # ─── ERNAKULAM / KOCHI (10 more) ────────────────────────────────────────────
    {
        "name": "Chakolas Pavilion Convention Centre",
        "district": "Ernakulam",
        "city": "Kalamassery",
        "address": "NH 544, Kalamassery, Ernakulam, Kerala 683104",
        "phone_number": "+914842553535",
        "starting_price": "120000",
        "capacity": "3000",
        "latitude": "10.0540",
        "longitude": "76.3320",
        "photos": "[]"
    },
    {
        "name": "Zamra International Convention Centre",
        "district": "Ernakulam",
        "city": "Edappally",
        "address": "Edappally, Kochi, Ernakulam, Kerala 682024",
        "phone_number": "+914842339900",
        "starting_price": "90000",
        "capacity": "2500",
        "latitude": "10.0290",
        "longitude": "76.3080",
        "photos": "[]"
    },
    {
        "name": "Adlux International Convention Centre",
        "district": "Ernakulam",
        "city": "Angamaly",
        "address": "Angamaly, Ernakulam, Kerala 683572",
        "phone_number": "+914842452000",
        "starting_price": "150000",
        "capacity": "5000",
        "latitude": "10.1980",
        "longitude": "76.3860",
        "photos": "[]"
    },
    {
        "name": "Maria Convention Centre",
        "district": "Ernakulam",
        "city": "Kakkanad",
        "address": "Kakkanad, Ernakulam, Kerala 682030",
        "phone_number": "+914842330123",
        "starting_price": "60000",
        "capacity": "1500",
        "latitude": "9.9890",
        "longitude": "76.3510",
        "photos": "[]"
    },
    {
        "name": "Nakshatra Convention Centre",
        "district": "Ernakulam",
        "city": "Muvattupuzha",
        "address": "Muvattupuzha, Ernakulam, Kerala 686661",
        "phone_number": "+914852216789",
        "starting_price": "50000",
        "capacity": "1200",
        "latitude": "9.9810",
        "longitude": "76.5790",
        "photos": "[]"
    },
    {
        "name": "IMA Hall Kochi",
        "district": "Ernakulam",
        "city": "Kaloor",
        "address": "Behind Jawaharlal Nehru Stadium, Kaloor, Kochi, Kerala 682017",
        "phone_number": "+914842348456",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "9.9847",
        "longitude": "76.2946",
        "photos": "[]"
    },
    {
        "name": "Thejus Auditorium Kochi",
        "district": "Ernakulam",
        "city": "Palarivattom",
        "address": "Palarivattom, Kochi, Ernakulam, Kerala 682025",
        "phone_number": "+914842334567",
        "starting_price": "35000",
        "capacity": "800",
        "latitude": "9.9890",
        "longitude": "76.3080",
        "photos": "[]"
    },
    {
        "name": "Udyan Convention Centre Kochi",
        "district": "Ernakulam",
        "city": "Ernakulam North",
        "address": "Ernakulam North, Kochi, Kerala 682018",
        "phone_number": "+914842355678",
        "starting_price": "55000",
        "capacity": "1500",
        "latitude": "9.9950",
        "longitude": "76.2890",
        "photos": "[]"
    },
    {
        "name": "Kothamangalam Central Hall",
        "district": "Ernakulam",
        "city": "Kothamangalam",
        "address": "Kothamangalam Town, Ernakulam, Kerala 686691",
        "phone_number": "+914852212789",
        "starting_price": "30000",
        "capacity": "700",
        "latitude": "10.0574",
        "longitude": "76.6618",
        "photos": "[]"
    },
    {
        "name": "Perumbavoor Grand Convention Hall",
        "district": "Ernakulam",
        "city": "Perumbavoor",
        "address": "Perumbavoor Town, Ernakulam, Kerala 683542",
        "phone_number": "+914852223456",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "10.1070",
        "longitude": "76.4700",
        "photos": "[]"
    },

    # ─── THRISSUR (10 more) ──────────────────────────────────────────────────────
    {
        "name": "Chakolas Palazzo Convention Centre",
        "district": "Thrissur",
        "city": "Thrissur",
        "address": "Near Thrissur Railway Station, Thrissur, Kerala 680001",
        "phone_number": "+914872420444",
        "starting_price": "100000",
        "capacity": "3000",
        "latitude": "10.5276",
        "longitude": "76.2144",
        "photos": "[]"
    },
    {
        "name": "Miya Convention Centre",
        "district": "Thrissur",
        "city": "Thalikulam",
        "address": "Thalikulam, Thrissur, Kerala 680569",
        "phone_number": "+914872250500",
        "starting_price": "60000",
        "capacity": "2000",
        "latitude": "10.5100",
        "longitude": "76.1200",
        "photos": "[]"
    },
    {
        "name": "Puzhayoram International Convention Centre",
        "district": "Thrissur",
        "city": "Eravimangalam",
        "address": "Puthur Road, Eravimangalam, Thrissur, Kerala 680022",
        "phone_number": "+919447890234",
        "starting_price": "75000",
        "capacity": "2500",
        "latitude": "10.5200",
        "longitude": "76.2500",
        "photos": "[]"
    },
    {
        "name": "MCP International Convention Centre",
        "district": "Thrissur",
        "city": "Irinjalakuda",
        "address": "Irinjalakuda North, Thrissur, Kerala 680121",
        "phone_number": "+914802823456",
        "starting_price": "50000",
        "capacity": "1500",
        "latitude": "10.3410",
        "longitude": "76.2130",
        "photos": "[]"
    },
    {
        "name": "Idam Event Centre",
        "district": "Thrissur",
        "city": "Guruvayur",
        "address": "Thrissur Road, Guruvayur, Thrissur, Kerala 680101",
        "phone_number": "+914872552567",
        "starting_price": "45000",
        "capacity": "1200",
        "latitude": "10.5940",
        "longitude": "76.0390",
        "photos": "[]"
    },
    {
        "name": "Kbees Durbar Convention Centre",
        "district": "Thrissur",
        "city": "Kodungallur",
        "address": "Kavilkadavu, Kodungallur, Thrissur, Kerala 680664",
        "phone_number": "+919447678890",
        "starting_price": "55000",
        "capacity": "1800",
        "latitude": "10.2320",
        "longitude": "76.2050",
        "photos": "[]"
    },
    {
        "name": "Thiruvambady Convention Centre",
        "district": "Thrissur",
        "city": "Thrissur",
        "address": "Marar Road, Thrissur, Kerala 680001",
        "phone_number": "+914872423789",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "10.5267",
        "longitude": "76.2191",
        "photos": "[]"
    },
    {
        "name": "Sree Parvathy Auditorium Ollur",
        "district": "Thrissur",
        "city": "Ollur",
        "address": "Near Durga Temple, Ollur, Thrissur, Kerala 680306",
        "phone_number": "+919447234901",
        "starting_price": "30000",
        "capacity": "800",
        "latitude": "10.4800",
        "longitude": "76.1900",
        "photos": "[]"
    },
    {
        "name": "Chalakudy Grand Convention Hall",
        "district": "Thrissur",
        "city": "Chalakudy",
        "address": "Chalakudy Town, Thrissur, Kerala 680307",
        "phone_number": "+914802820678",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "10.3010",
        "longitude": "76.3310",
        "photos": "[]"
    },
    {
        "name": "Kunnamkulam Convention Centre",
        "district": "Thrissur",
        "city": "Kunnamkulam",
        "address": "Kunnamkulam Town, Thrissur, Kerala 680503",
        "phone_number": "+914885222345",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "10.6500",
        "longitude": "76.0800",
        "photos": "[]"
    },

    # ─── MALAPPURAM (8 more) ────────────────────────────────────────────────────
    {
        "name": "Rozia International Convention Centre",
        "district": "Malappuram",
        "city": "Kondotty",
        "address": "Kondotty, Malappuram, Kerala 673638",
        "phone_number": "+919447987456",
        "starting_price": "80000",
        "capacity": "2500",
        "latitude": "11.1500",
        "longitude": "75.9700",
        "photos": "[]"
    },
    {
        "name": "Shifa Convention Centre",
        "district": "Malappuram",
        "city": "Perinthalmanna",
        "address": "Ponniyakurissi, Perinthalmanna, Malappuram, Kerala 679322",
        "phone_number": "+914933225678",
        "starting_price": "60000",
        "capacity": "2000",
        "latitude": "10.9750",
        "longitude": "76.2250",
        "photos": "[]"
    },
    {
        "name": "Olive International Convention Centre",
        "district": "Malappuram",
        "city": "Kuttippuram",
        "address": "Kuttippuram, Malappuram, Kerala 679571",
        "phone_number": "+919447543012",
        "starting_price": "50000",
        "capacity": "1500",
        "latitude": "10.8700",
        "longitude": "75.9800",
        "photos": "[]"
    },
    {
        "name": "Parappan Square Convention Centre",
        "district": "Malappuram",
        "city": "Venniyur",
        "address": "Venniyur, Malappuram, Kerala 676501",
        "phone_number": "+919447012345",
        "starting_price": "55000",
        "capacity": "1800",
        "latitude": "10.9700",
        "longitude": "75.9500",
        "photos": "[]"
    },
    {
        "name": "Bianco Castle Convention Hall",
        "district": "Malappuram",
        "city": "Tirur",
        "address": "Tirur, Malappuram, Kerala 676101",
        "phone_number": "+914942225678",
        "starting_price": "70000",
        "capacity": "2000",
        "latitude": "10.9120",
        "longitude": "75.9210",
        "photos": "[]"
    },
    {
        "name": "Manjeri Convention Hall",
        "district": "Malappuram",
        "city": "Manjeri",
        "address": "Manjeri Town, Malappuram, Kerala 676121",
        "phone_number": "+914832324567",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "11.1190",
        "longitude": "76.1210",
        "photos": "[]"
    },
    {
        "name": "Nilambur Grand Auditorium",
        "district": "Malappuram",
        "city": "Nilambur",
        "address": "Nilambur Town, Malappuram, Kerala 679329",
        "phone_number": "+914931220678",
        "starting_price": "30000",
        "capacity": "700",
        "latitude": "11.2800",
        "longitude": "76.2200",
        "photos": "[]"
    },
    {
        "name": "Ponnani Convention Centre",
        "district": "Malappuram",
        "city": "Ponnani",
        "address": "Ponnani Town, Malappuram, Kerala 679577",
        "phone_number": "+914932222789",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "10.7870",
        "longitude": "75.9120",
        "photos": "[]"
    },

    # ─── KOZHIKODE (8 more) ──────────────────────────────────────────────────────
    {
        "name": "Luxmore Convention Centre",
        "district": "Kozhikode",
        "city": "Atholi",
        "address": "Kozhikode Bypass, Atholi, Kozhikode, Kerala 673303",
        "phone_number": "+914952720500",
        "starting_price": "90000",
        "capacity": "2000",
        "latitude": "11.3000",
        "longitude": "75.9500",
        "photos": "[]"
    },
    {
        "name": "Malabar Marina Convention Centre",
        "district": "Kozhikode",
        "city": "Kozhikode",
        "address": "South Beach, Kozhikode, Kerala 673032",
        "phone_number": "+914952766789",
        "starting_price": "75000",
        "capacity": "1800",
        "latitude": "11.2440",
        "longitude": "75.7730",
        "photos": "[]"
    },
    {
        "name": "Green Park Convention Centre",
        "district": "Kozhikode",
        "city": "Kozhikode",
        "address": "East Hill, Kozhikode, Kerala 673005",
        "phone_number": "+914952720345",
        "starting_price": "55000",
        "capacity": "1500",
        "latitude": "11.2550",
        "longitude": "75.7820",
        "photos": "[]"
    },
    {
        "name": "Vatakara Convention Centre",
        "district": "Kozhikode",
        "city": "Vatakara",
        "address": "Vatakara Town, Kozhikode, Kerala 673101",
        "phone_number": "+914972240234",
        "starting_price": "35000",
        "capacity": "800",
        "latitude": "11.6010",
        "longitude": "75.5900",
        "photos": "[]"
    },
    {
        "name": "Koyilandy Convention Hall",
        "district": "Kozhikode",
        "city": "Koyilandy",
        "address": "Koyilandy Town, Kozhikode, Kerala 673307",
        "phone_number": "+914982304567",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "11.4360",
        "longitude": "75.7000",
        "photos": "[]"
    },
    {
        "name": "Feroke Grand Auditorium",
        "district": "Kozhikode",
        "city": "Feroke",
        "address": "Feroke, Kozhikode, Kerala 673631",
        "phone_number": "+914952497890",
        "starting_price": "30000",
        "capacity": "800",
        "latitude": "11.1920",
        "longitude": "75.8060",
        "photos": "[]"
    },
    {
        "name": "Ramanattukara Convention Hall",
        "district": "Kozhikode",
        "city": "Ramanattukara",
        "address": "Ramanattukara, Kozhikode, Kerala 673633",
        "phone_number": "+914952487123",
        "starting_price": "32000",
        "capacity": "800",
        "latitude": "11.1990",
        "longitude": "75.8300",
        "photos": "[]"
    },
    {
        "name": "Nadapuram Grand Convention Centre",
        "district": "Kozhikode",
        "city": "Nadapuram",
        "address": "Nadapuram, Kozhikode, Kerala 673504",
        "phone_number": "+914982362456",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "11.5700",
        "longitude": "75.6800",
        "photos": "[]"
    },

    # ─── WAYANAD (6 more) ────────────────────────────────────────────────────────
    {
        "name": "Mananthavady Convention Centre",
        "district": "Wayanad",
        "city": "Mananthavady",
        "address": "Mananthavady Town, Wayanad, Kerala 670645",
        "phone_number": "+914935240234",
        "starting_price": "30000",
        "capacity": "700",
        "latitude": "11.8000",
        "longitude": "76.0100",
        "photos": "[]"
    },
    {
        "name": "Ambalavayal Convention Hall",
        "district": "Wayanad",
        "city": "Ambalavayal",
        "address": "Ambalavayal, Wayanad, Kerala 673593",
        "phone_number": "+919447890678",
        "starting_price": "25000",
        "capacity": "500",
        "latitude": "11.7000",
        "longitude": "76.1500",
        "photos": "[]"
    },
    {
        "name": "Vythiri Grand Convention Hall",
        "district": "Wayanad",
        "city": "Vythiri",
        "address": "Vythiri, Wayanad, Kerala 673576",
        "phone_number": "+919447543456",
        "starting_price": "28000",
        "capacity": "600",
        "latitude": "11.5700",
        "longitude": "76.0300",
        "photos": "[]"
    },
    {
        "name": "Kalpetta Grand Convention Centre",
        "district": "Wayanad",
        "city": "Kalpetta",
        "address": "Kalpetta Town, Wayanad, Kerala 673121",
        "phone_number": "+914936202567",
        "starting_price": "35000",
        "capacity": "800",
        "latitude": "11.6100",
        "longitude": "76.0820",
        "photos": "[]"
    },
    {
        "name": "Pulpally Convention Hall",
        "district": "Wayanad",
        "city": "Pulpally",
        "address": "Pulpally, Wayanad, Kerala 673579",
        "phone_number": "+919447234567",
        "starting_price": "20000",
        "capacity": "500",
        "latitude": "11.7300",
        "longitude": "76.0100",
        "photos": "[]"
    },
    {
        "name": "Panamaram Convention Centre",
        "district": "Wayanad",
        "city": "Panamaram",
        "address": "Panamaram, Wayanad, Kerala 670721",
        "phone_number": "+919447678901",
        "starting_price": "22000",
        "capacity": "500",
        "latitude": "11.7900",
        "longitude": "76.0500",
        "photos": "[]"
    },

    # ─── KANNUR (8 more) ────────────────────────────────────────────────────────
    {
        "name": "Kairali Heritage Convention Centre",
        "district": "Kannur",
        "city": "Kannur",
        "address": "Fort Road, Kannur, Kerala 670001",
        "phone_number": "+914972704234",
        "starting_price": "55000",
        "capacity": "1500",
        "latitude": "11.8745",
        "longitude": "75.3704",
        "photos": "[]"
    },
    {
        "name": "Surya Convention Centre",
        "district": "Kannur",
        "city": "Kannur",
        "address": "Thavakkara, Kannur, Kerala 670001",
        "phone_number": "+914972705678",
        "starting_price": "60000",
        "capacity": "2000",
        "latitude": "11.8780",
        "longitude": "75.3690",
        "photos": "[]"
    },
    {
        "name": "Thalassery Convention Hall",
        "district": "Kannur",
        "city": "Thalassery",
        "address": "Thalassery Town, Kannur, Kerala 670101",
        "phone_number": "+914902325678",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "11.7520",
        "longitude": "75.4930",
        "photos": "[]"
    },
    {
        "name": "Payyannur Grand Auditorium",
        "district": "Kannur",
        "city": "Payyannur",
        "address": "Payyannur Town, Kannur, Kerala 670307",
        "phone_number": "+914982442789",
        "starting_price": "30000",
        "capacity": "800",
        "latitude": "12.0990",
        "longitude": "75.2050",
        "photos": "[]"
    },
    {
        "name": "Iritty Convention Centre",
        "district": "Kannur",
        "city": "Iritty",
        "address": "Iritty Town, Kannur, Kerala 670703",
        "phone_number": "+919447678234",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "11.9900",
        "longitude": "75.5900",
        "photos": "[]"
    },
    {
        "name": "Mattannur Convention Hall",
        "district": "Kannur",
        "city": "Mattannur",
        "address": "Mattannur Town, Kannur, Kerala 670702",
        "phone_number": "+914988260456",
        "starting_price": "28000",
        "capacity": "700",
        "latitude": "11.9300",
        "longitude": "75.5700",
        "photos": "[]"
    },
    {
        "name": "Peravoor Grand Convention Centre",
        "district": "Kannur",
        "city": "Peravoor",
        "address": "Peravoor, Kannur, Kerala 670673",
        "phone_number": "+919447012678",
        "starting_price": "22000",
        "capacity": "500",
        "latitude": "11.9500",
        "longitude": "75.6200",
        "photos": "[]"
    },
    {
        "name": "Kuthuparamba Convention Hall",
        "district": "Kannur",
        "city": "Kuthuparamba",
        "address": "Kuthuparamba Town, Kannur, Kerala 670643",
        "phone_number": "+914972764789",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "11.8000",
        "longitude": "75.5500",
        "photos": "[]"
    },

    # ─── KASARAGOD (6 more) ──────────────────────────────────────────────────────
    {
        "name": "Alliance Convention Centre",
        "district": "Kasaragod",
        "city": "Kasaragod",
        "address": "Kasaragod Town, Kerala 671121",
        "phone_number": "+914994222234",
        "starting_price": "60000",
        "capacity": "1800",
        "latitude": "12.4996",
        "longitude": "74.9869",
        "photos": "[]"
    },
    {
        "name": "AH Palace Convention Centre",
        "district": "Kasaragod",
        "city": "Manjeshwar",
        "address": "Manjeshwar, Kasaragod, Kerala 671323",
        "phone_number": "+914998200567",
        "starting_price": "55000",
        "capacity": "2000",
        "latitude": "12.7300",
        "longitude": "74.9000",
        "photos": "[]"
    },
    {
        "name": "Palladium Convention Centre",
        "district": "Kasaragod",
        "city": "Kasaragod",
        "address": "NH 66, Kasaragod, Kerala 671121",
        "phone_number": "+914994224789",
        "starting_price": "50000",
        "capacity": "1500",
        "latitude": "12.5050",
        "longitude": "74.9900",
        "photos": "[]"
    },
    {
        "name": "Kanz Convention Centre",
        "district": "Kasaragod",
        "city": "Chamnad",
        "address": "Chamnad, Kasaragod, Kerala 671319",
        "phone_number": "+919447543890",
        "starting_price": "40000",
        "capacity": "1000",
        "latitude": "12.6500",
        "longitude": "74.9500",
        "photos": "[]"
    },
    {
        "name": "Nakshathra Auditorium Kanhangad",
        "district": "Kasaragod",
        "city": "Kanhangad",
        "address": "Kanhangad Town, Kasaragod, Kerala 671315",
        "phone_number": "+914972701234",
        "starting_price": "35000",
        "capacity": "900",
        "latitude": "12.3340",
        "longitude": "75.0860",
        "photos": "[]"
    },
    {
        "name": "Uppala Convention Hall",
        "district": "Kasaragod",
        "city": "Uppala",
        "address": "Uppala, Kasaragod, Kerala 671322",
        "phone_number": "+919447678023",
        "starting_price": "25000",
        "capacity": "600",
        "latitude": "12.6000",
        "longitude": "74.9400",
        "photos": "[]"
    },
]

CSV_PATH = "scripts/ingestion/kerala_venues_master.csv"

def load_existing():
    with open(CSV_PATH, encoding="utf-8") as f:
        return list(csv.DictReader(f))

def save_csv(rows):
    fieldnames = ["name","district","city","address","phone_number",
                  "starting_price","capacity","latitude","longitude",
                  "is_verified","is_claimed","photos"]
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

existing = load_existing()
existing_names = {r["name"].strip().lower() for r in existing}

added = 0
for v in NEW_VENUES:
    if v["name"].strip().lower() in existing_names:
        print(f"  SKIP (exists): {v['name']}")
        continue
    row = {
        "name": v["name"],
        "district": v["district"],
        "city": v["city"],
        "address": v["address"],
        "phone_number": v.get("phone_number",""),
        "starting_price": v.get("starting_price","50000"),
        "capacity": v.get("capacity","1000"),
        "latitude": v.get("latitude",""),
        "longitude": v.get("longitude",""),
        "is_verified": "false",
        "is_claimed": "false",
        "photos": v.get("photos","[]"),
    }
    existing.append(row)
    existing_names.add(v["name"].strip().lower())
    added += 1
    print(f"  ADD: {v['district']} | {v['city']} | {v['name']}")

save_csv(existing)
print(f"\nDone! Added {added} new venues. Total: {len(existing)}")
from collections import Counter
districts = Counter(r["district"] for r in existing)
print("\nDistrict breakdown:")
for d, c in sorted(districts.items()):
    print(f"  {d}: {c}")

