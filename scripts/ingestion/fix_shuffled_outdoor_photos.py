import asyncio
import re
import json
import csv
import sys
from pathlib import Path
from playwright.async_api import async_playwright

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

def get_venue_search_query(row: dict) -> str:
    name = row.get("name", "").strip()
    city = row.get("city", "").strip()
    district = row.get("district", "").strip()
    return f"{name} {city} {district} Kerala"

async def fetch_distinct_outdoor_photos(page, name: str, city: str, district: str, global_seen_urls: set) -> list:
    query = f"{name} {city} {district} Kerala"
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    print(f"\n==============================================")
    print(f"[FETCHING]: {name} in {city}, {district}")
    
    try:
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(4000)

        # Handle consent dialog if present
        try:
            consent = page.locator("button:has-text('Accept all'), button:has-text('I agree')")
            if await consent.count() > 0:
                await consent.first.click()
                await page.wait_for_timeout(1500)
        except Exception:
            pass

        # Check if list of search results appeared; if so, click the closest match
        listings = page.locator("a[href*='/maps/place/']")
        if await listings.count() > 0:
            best_link = None
            first_name = name.split()[0].lower()
            for idx in range(min(await listings.count(), 5)):
                aria = (await listings.nth(idx).get_attribute("aria-label") or "").lower()
                if first_name in aria:
                    best_link = listings.nth(idx)
                    break
            
            target = best_link if best_link else listings.first
            print(f"  Clicking specific place listing: {await target.get_attribute('aria-label') or 'first'}")
            await target.click()
            await page.wait_for_timeout(3500)

        # 1. Capture the OUTDOOR / FACADE COVER PHOTO
        outdoor_cover = None
        cover_btn = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo of']")
        if await cover_btn.count() > 0:
            c_img = cover_btn.first.locator("img")
            if await c_img.count() > 0:
                src = await c_img.first.get_attribute("src")
                if src and ("googleusercontent" in src or "ggpht" in src):
                    clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                    if clean not in global_seen_urls:
                        outdoor_cover = clean
                        print(f"  [OUTDOOR COVER FOUND]: {clean[:90]}...")

        # 2. Open Gallery to grab more photos specific to THIS venue
        photos = []
        if outdoor_cover:
            photos.append(outdoor_cover)

        if await cover_btn.count() > 0:
            try:
                await cover_btn.first.click(timeout=1500)
                await page.wait_for_timeout(2500)

                # Look for "Outside" or "By owner" tab
                tabs = page.locator("button[role='tab']")
                for t_idx in range(await tabs.count()):
                    tab_text = (await tabs.nth(t_idx).inner_text()).strip().lower()
                    if "outside" in tab_text:
                        print(f"  Clicking '{tab_text}' tab...")
                        await tabs.nth(t_idx).click()
                        await page.wait_for_timeout(1500)
                        break

                gallery_imgs = page.locator("div[role='img'], a[data-photo-index] div[style*='background-image'], img")
                cnt = await gallery_imgs.count()
                for j in range(cnt):
                    style = await gallery_imgs.nth(j).get_attribute("style") or ""
                    src = await gallery_imgs.nth(j).get_attribute("src") or ""
                    match = re.search(r'url\("?([^"\)]+)"?\)', style)
                    f_url = match.group(1) if match else src
                    if f_url and ("googleusercontent" in f_url or "ggpht" in f_url):
                        if not any(x in f_url for x in ["w36-h36", "w48-h48", "w60-h60", "/a/"]):
                            high_res = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", f_url)
                            if high_res not in photos and high_res not in global_seen_urls:
                                photos.append(high_res)
                                if len(photos) >= 4:
                                    break
            except Exception as e:
                print(f"  Gallery error: {e}")

        # Fallback to general page images if gallery didn't yield enough
        if len(photos) < 2:
            all_imgs = page.locator("img")
            cnt = await all_imgs.count()
            for k in range(cnt):
                src = await all_imgs.nth(k).get_attribute("src")
                if src and ("grass-cs" in src or "gps-cs-s" in src or "/p/" in src):
                    if not any(x in src for x in ["w36-h36", "/a/"]):
                        clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                        if clean not in photos and clean not in global_seen_urls:
                            photos.append(clean)
                            if len(photos) >= 3:
                                break

        print(f"  -> Successfully extracted {len(photos)} UNIQUE photos for {name}")
        return photos
    except Exception as err:
        print(f"  -> Error fetching {name}: {err}")
        return []

async def main():
    if not CSV_PATH.exists():
        print("CSV not found!")
        return

    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    # 1. Identify which photos are duplicated across venues
    photo_venues = {}
    duplicate_urls = set()
    for r in rows:
        name = r["name"]
        p = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
        for u in p:
            if u in photo_venues:
                duplicate_urls.add(u)
            else:
                photo_venues[u] = name

    venues_to_refetch = []
    for idx, r in enumerate(rows):
        p = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
        has_dup = any(u in duplicate_urls for u in p)
        if has_dup or len(p) == 0:
            venues_to_refetch.append((idx, r))

    print(f"Found {len(venues_to_refetch)} venues needing distinct outdoor photos & deduplication.")

    # Unique global photos set to avoid any cross-venue sharing
    global_seen = set()
    # Populate with photos from venues that are NOT being refetched
    for idx, r in enumerate(rows):
        if not any(idx == item[0] for item in venues_to_refetch):
            p = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
            for u in p:
                global_seen.add(u)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        for idx, row in venues_to_refetch:
            name = row["name"]
            city = row["city"]
            district = row["district"]

            unique_photos = await fetch_distinct_outdoor_photos(page, name, city, district, global_seen)
            if unique_photos:
                for u in unique_photos:
                    global_seen.add(u)
                row["photos"] = json.dumps(unique_photos)
                rows[idx] = row

                # Save progress
                with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(rows)
                print(f"  [SAVED DISTINCT PHOTOS FOR]: {name} ({len(unique_photos)} photos)")
            else:
                print(f"  [WARNING]: Could not get new unique photos for {name}, keeping existing fallback.")

        await browser.close()

    print("\nAll venues have been cleaned and deduplicated!")

if __name__ == "__main__":
    asyncio.run(main())

