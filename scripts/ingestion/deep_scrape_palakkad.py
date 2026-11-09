import asyncio
import re
import json
import csv
from pathlib import Path
from playwright.async_api import async_playwright

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

LOCAL_QUERIES = [
    "Blue Diamond International Convention Centre Kerala",
    "wedding auditoriums in Pattambi Kerala",
    "convention centres in Kulappully Kerala",
    "marriage halls in Cherpulassery Palakkad Kerala",
    "wedding convention centres in Shoranur Palakkad",
    "auditoriums marriage halls in Ottapalam Kerala",
    "convention centres in Mannarkkad Palakkad",
    "marriage halls auditoriums in Palakkad town Kerala",
]

PHONE_REGEX = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}|0\d{2,4}[\-\s]?\d{6,8}")
COORD_REGEX = re.compile(r"@(-?\d+\.\d+),(-?\d+\.\d+)")

def clean_phone(raw: str) -> str:
    if not raw:
        return ""
    m = PHONE_REGEX.search(raw)
    return m.group(0).strip() if m else ""

async def scrape_query_venues(page, query: str):
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    print(f"\n==========================================")
    print(f"Searching: {query}")
    print(f"URL: {url}")
    print(f"==========================================")
    
    try:
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(4000)
    except Exception as e:
        print(f"Navigation error: {e}")
        return []

    # Check consent if any
    try:
        consent = page.locator("button:has-text('Accept all'), button:has-text('I agree')")
        if await consent.count() > 0:
            await consent.first.click()
            await page.wait_for_timeout(2000)
    except Exception:
        pass

    # If it directly opened a single place (e.g. Blue Diamond)
    title = await page.title()
    current_url = page.url
    results = []

    # Check if direct place view opened
    h1 = page.locator("h1.DUwDvf, h1[class*='fontHeadlineLarge']")
    if await h1.count() > 0:
        place_name = (await h1.first.inner_text()).strip()
        if place_name and "google maps" not in place_name.lower():
            venue = await extract_current_place_details(page, place_name)
            if venue:
                results.append(venue)
                print(f"  [Direct Match]: {venue['name']} | Phone: {venue.get('phone_number')}")
                return results

    # Otherwise scroll sidebar feed
    feed_sel = "div[role='feed']"
    for _ in range(5):
        feed = page.locator(feed_sel)
        if await feed.count() > 0:
            await feed.evaluate("node => node.scrollBy(0, 1200)")
        else:
            await page.keyboard.press("PageDown")
        await page.wait_for_timeout(1500)

    listings = page.locator("a.hfpxzc, div[role='article']")
    count = await listings.count()
    print(f"Found {count} listings for '{query}'")

    for i in range(min(count, 12)):
        try:
            item = listings.nth(i)
            # Click listing
            await item.click()
            await page.wait_for_timeout(2200)

            # Name
            h1 = page.locator("h1.DUwDvf, h1[class*='fontHeadlineLarge']")
            if await h1.count() == 0:
                continue
            name = (await h1.first.inner_text()).strip()
            if not name or any(v['name'].lower() == name.lower() for v in results):
                continue

            venue = await extract_current_place_details(page, name)
            if venue:
                results.append(venue)
                print(f"  [+] {venue['name']} ({venue['city']}) | Phone: {venue['phone_number']} | Photos: {len(json.loads(venue['photos']))}")
        except Exception as err:
            continue

    return results

async def extract_current_place_details(page, name: str):
    # Address
    address = ""
    addr_btn = page.locator("button[data-item-id='address'], button[data-tooltip*='address']")
    if await addr_btn.count() > 0:
        address = (await addr_btn.first.inner_text()).strip()

    # Phone
    phone = ""
    phone_btn = page.locator("button[data-item-id^='phone:tel:']")
    if await phone_btn.count() > 0:
        raw = await phone_btn.first.get_attribute("data-item-id")
        if raw:
            phone = clean_phone(raw.replace("phone:tel:", ""))
    if not phone:
        tt = page.locator("button[data-tooltip*='phone'], button[aria-label*='Phone']")
        if await tt.count() > 0:
            phone = clean_phone(await tt.first.inner_text())

    # Coordinates
    lat, lng = None, None
    m = COORD_REGEX.search(page.url)
    if m:
        lat = float(m.group(1))
        lng = float(m.group(2))

    # City heuristic
    city = "Palakkad"
    for local_town in ["Pattambi", "Kulappully", "Shoranur", "Cherpulassery", "Ottapalam", "Mannarkkad", "Palakkad"]:
        if address and local_town.lower() in address.lower():
            city = local_town
            break

    # Real photos
    photos = []
    imgs = page.locator("button[aria-label*='Photo'] img, div[role='region'] img, img")
    img_count = await imgs.count()
    for j in range(img_count):
        src = await imgs.nth(j).get_attribute("src")
        if src and ("grass-cs" in src or "/p/" in src) and "googleusercontent" in src:
            high_res = re.sub(r"=w\d+-h\d+.*", "=w1200-h800-k-no", src)
            if high_res not in photos:
                photos.append(high_res)
                if len(photos) >= 3:
                    break

    return {
        "name": name,
        "district": "Palakkad",
        "city": city,
        "address": address or f"{name}, {city}, Palakkad, Kerala",
        "phone_number": phone or None,
        "starting_price": 50000.00,
        "capacity": 1000,
        "latitude": lat,
        "longitude": lng,
        "photos": json.dumps(photos) if photos else "[]",
        "is_verified": True,
        "is_claimed": False
    }

async def main():
    # Read existing CSV
    existing_rows = []
    fieldnames = []
    if CSV_PATH.exists():
        with open(CSV_PATH, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            fieldnames = list(reader.fieldnames or [])
            existing_rows = list(reader)

    existing_names = {r["name"].strip().lower() for r in existing_rows}
    print(f"Existing venues in CSV: {len(existing_rows)}")

    new_venues = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        for q in LOCAL_QUERIES:
            venues = await scrape_query_venues(page, q)
            for v in venues:
                if v["name"].strip().lower() not in existing_names:
                    existing_names.add(v["name"].strip().lower())
                    new_venues.append(v)
                    existing_rows.append(v)
                    print(f"==> ADDED NEW VENUE: {v['name']} ({v['city']})")

        await browser.close()

    print(f"\n==========================================")
    print(f"Deep Search Complete! Found {len(new_venues)} new deep local venues.")
    print(f"Total venues in master list: {len(existing_rows)}")
    print(f"==========================================")

    if new_venues:
        # Save updated CSV
        with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(existing_rows)
        print(f"Saved updated master CSV to {CSV_PATH.name}")

if __name__ == "__main__":
    asyncio.run(main())

