import asyncio
import csv
import json
import re
import sys
from pathlib import Path
from playwright.async_api import async_playwright
from supabase import create_client

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")
SUPABASE_URL = "https://efhmmsprizhptpecllrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaG1tc3ByaXpocHRwZWNsbHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTE5MDYsImV4cCI6MjEwOTE4NzkwNn0.Xm3KFeOpcQpFNlmEG83X_TguqkW3hPCN21eD7GtpZ_Q"

def filter_real(photos):
    if not photos or not isinstance(photos, list):
        return []
    res = []
    seen = set()
    for p in photos:
        if isinstance(p, str) and p.startswith("http") and "unsplash.com" not in p and "placeholder" not in p:
            clean = p.strip()
            if clean not in seen:
                res.append(clean)
                seen.add(clean)
    return res

async def fetch_photos_for_venue(page, name: str, city: str, district: str) -> list:
    queries = [
        f"{name} {city} {district} Kerala",
        f"{name} {district} Kerala"
    ]

    for q_idx, query in enumerate(queries):
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        try:
            await page.goto(url, wait_until="domcontentloaded", timeout=20000)
            await page.wait_for_timeout(3500)

            # Accept consent if shown
            try:
                consent = page.locator("button:has-text('Accept all'), button:has-text('I agree')")
                if await consent.count() > 0:
                    await consent.first.click(timeout=1500)
                    await page.wait_for_timeout(1500)
            except Exception:
                pass

            # If search returns multiple listings, click the first one
            listings = page.locator("a.hfpxzc, a[href*='/maps/place/']")
            if await listings.count() > 0:
                first_name_token = name.split()[0].lower().replace(",", "")
                clicked = False
                count_listings = min(await listings.count(), 5)
                for i in range(count_listings):
                    label = (await listings.nth(i).get_attribute("aria-label") or "").lower()
                    if first_name_token in label or (city and city.lower() in label):
                        await listings.nth(i).click(timeout=2000)
                        clicked = True
                        await page.wait_for_timeout(3000)
                        break
                if not clicked:
                    await listings.first.click(timeout=2000)
                    await page.wait_for_timeout(3000)

            # Check cover photo button first
            photos = []
            cover_btns = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo of'], div[role='region'] button[aria-label*='Photo']")
            if await cover_btns.count() > 0:
                imgs = cover_btns.first.locator("img")
                if await imgs.count() > 0:
                    src = await imgs.first.get_attribute("src") or ""
                    if any(x in src for x in ["googleusercontent.com", "ggpht.com"]):
                        clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                        if clean not in photos:
                            photos.append(clean)

            # Secondary: scan place images
            all_imgs = page.locator("button[aria-label*='Photo'] img, div[role='region'] img, a[aria-label*='Photo'] img, img")
            cnt = await all_imgs.count()
            for k in range(cnt):
                src = await all_imgs.nth(k).get_attribute("src") or ""
                if any(x in src for x in ["googleusercontent.com", "ggpht.com"]):
                    if any(x in src for x in ["grass-cs", "gps-cs-s", "/p/", "p-k-no", "lh3.googleusercontent.com/p/"]):
                        if not any(x in src for x in ["w36-h36", "w48-h48", "w60-h60", "/a/", "=s"]):
                            clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                            if clean not in photos:
                                photos.append(clean)
                if len(photos) >= 3:
                    break

            if photos:
                return photos

            # If no photos on first query and second query exists, try second query
            if q_idx == 0 and len(queries) > 1:
                continue

        except Exception as e:
            print(f"    [Error fetching query '{query}']: {e}")
            continue

    return []

async def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # 1. Load Supabase venues
    res = client.table("auditoriums").select("id, name, title, slug, district, city, photos").execute()
    sb_rows = res.data or []
    
    # Filter active
    sb_active = [r for r in sb_rows if r.get("district") != "ARCHIVED" and "[DELETED_DUMMY]" not in (r.get("title") or "") and "[DELETED_DUMMY]" not in (r.get("name") or "")]
    
    # 2. Load CSV
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        csv_fieldnames = list(reader.fieldnames or [])
        csv_rows = list(reader)

    # Determine missing venues
    missing_venues = []
    for r in sb_active:
        p = r.get("photos")
        if isinstance(p, str):
            try:
                p = json.loads(p)
            except Exception:
                p = []
        real = filter_real(p)
        if not real:
            missing_venues.append(r)

    print(f"==================================================")
    print(f"Total active venues in DB:       {len(sb_active)}")
    print(f"Active venues WITH photos:       {len(sb_active) - len(missing_venues)}")
    print(f"Active venues WITHOUT photos:    {len(missing_venues)}")
    print(f"==================================================")

    if not missing_venues:
        print("All venues already have photos!")
        return

    # Index CSV rows by slug and by name for instant updates
    csv_by_slug = {r.get("slug"): r for r in csv_rows}
    csv_by_name = {r.get("name"): r for r in csv_rows}

    collected_count = 0
    not_found_count = 0

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        for idx, venue in enumerate(missing_venues, start=1):
            venue_id = venue["id"]
            name = venue.get("title") or venue.get("name") or venue.get("slug")
            city = venue.get("city") or ""
            district = venue.get("district") or ""
            slug = venue.get("slug") or ""

            print(f"[{idx}/{len(missing_venues)}] Searching: {name} ({city}, {district})...")
            photos = await fetch_photos_for_venue(page, name, city, district)

            if photos:
                collected_count += 1
                print(f"  -> SUCCESS! Found {len(photos)} photos. Updating DB & CSV...")
                
                # Update Supabase
                try:
                    client.table("auditoriums").update({"photos": photos}).eq("id", venue_id).execute()
                except Exception as db_err:
                    print(f"  [DB Update Warning]: {db_err}")

                # Update CSV row
                matched_csv = csv_by_slug.get(slug) or csv_by_name.get(name)
                if matched_csv:
                    matched_csv["photos"] = json.dumps(photos)

                print(f"  -> Sample URL: {photos[0][:80]}...")
            else:
                not_found_count += 1
                print(f"  -> No photo found on Maps.")

            # Flush CSV checkpoint after each venue
            with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=csv_fieldnames)
                writer.writeheader()
                writer.writerows(csv_rows)

        await browser.close()

    print("\n==================================================")
    print(f"Collection Complete!")
    print(f"Total processed:      {len(missing_venues)}")
    print(f"Photos found & saved: {collected_count}")
    print(f"No photo on Maps:     {not_found_count}")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(main())

