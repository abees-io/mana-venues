import asyncio
import re
import json
import csv
from pathlib import Path
from playwright.async_api import async_playwright

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

# Specific search query overrides for venues that need targeted search terms on Google Maps
SEARCH_OVERRIDES = {
    "Jubilee Mission Memorial Auditorium": "Jubilee Mission Auditorium East Fort Thrissur",
    "Top in Town Auditorium": "Top in Town Auditorium Mannarkkad Palakkad",
    "Kadalavu Convention Centre": "Kadalavu Convention Centre Pantheerankavu Kozhikode Calicut",
    "Wayanad Gate Convention Centre": "Wayanad Gate Lakkidi Wayanad Kerala",
    "Dinesh Auditorium": "Dinesh Auditorium South Bazar Kannur",
    "KRS Convention Centre": "KRS Auditorium Shoranur Kulappully Palakkad",
}

async def fetch_photos_for_venue(page, name: str, city: str, district: str) -> list:
    query = SEARCH_OVERRIDES.get(name, f"{name} {city} {district} Kerala")
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    
    print(f"\n[Searching]: {name} -> {query}")
    try:
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(4500)
        
        # Check if multiple results were returned and click first result if so
        results = page.locator("a[href*='/maps/place/']")
        if await results.count() > 0:
            try:
                await results.first.click()
                await page.wait_for_timeout(3500)
            except Exception:
                pass

        photos = []
        
        # Method 1: Check cover photo button
        btn = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo']")
        if await btn.count() > 0:
            cover_img = btn.first.locator("img")
            if await cover_img.count() > 0:
                c_src = await cover_img.first.get_attribute("src")
                if c_src and ("googleusercontent" in c_src or "ggpht" in c_src):
                    clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", c_src)
                    photos.append(clean)
            
            # Click cover photo to enter gallery for richer set
            try:
                await btn.first.click(timeout=2000)
                await page.wait_for_timeout(3000)
                
                # Extract gallery images
                gallery_imgs = page.locator("div[role='img'], a[data-photo-index] div[style*='background-image'], img")
                g_count = await gallery_imgs.count()
                for j in range(g_count):
                    style = await gallery_imgs.nth(j).get_attribute("style") or ""
                    src = await gallery_imgs.nth(j).get_attribute("src") or ""
                    url_match = re.search(r'url\("?([^"\)]+)"?\)', style)
                    f_url = url_match.group(1) if url_match else src
                    
                    if f_url and ("googleusercontent" in f_url or "ggpht" in f_url):
                        if not any(x in f_url for x in ["w36-h36", "w48-h48", "w60-h60", "/a/"]):
                            high_res = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", f_url)
                            if high_res not in photos:
                                photos.append(high_res)
                                if len(photos) >= 4:
                                    break
            except Exception as e:
                print(f"  Note during gallery click: {e}")

        # Method 2: If still empty or < 2, scan page images
        if len(photos) < 3:
            all_imgs = page.locator("img")
            cnt = await all_imgs.count()
            for k in range(cnt):
                src = await all_imgs.nth(k).get_attribute("src")
                if src and ("googleusercontent" in src or "ggpht" in src):
                    if ("grass-cs" in src or "gps-cs-s" in src or "/p/" in src) and not any(x in src for x in ["w36-h36", "/a/"]):
                        clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                        if clean not in photos:
                            photos.append(clean)
                            if len(photos) >= 4:
                                break

        print(f"  -> Found {len(photos)} photos for {name}")
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

    # Find rows with empty photos or < 3 photos
    targets = []
    for idx, r in enumerate(rows):
        p = r.get("photos", "")
        if not p or p == "[]":
            targets.append((idx, r, 0))
        else:
            try:
                arr = json.loads(p)
                if len(arr) < 3:
                    targets.append((idx, r, len(arr)))
            except:
                targets.append((idx, r, 0))

    print(f"Total targets to enrich: {len(targets)}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        updated_count = 0
        for item in targets:
            idx, row, current_count = item
            name = row["name"].strip()
            city = row["city"].strip()
            district = row["district"].strip()

            fetched = await fetch_photos_for_venue(page, name, city, district)
            if fetched:
                # Merge with existing photos if any, keeping fetched ones first
                existing = []
                if row.get("photos"):
                    try:
                        existing = json.loads(row["photos"])
                    except:
                        pass
                
                merged = []
                for img in fetched + existing:
                    if img not in merged:
                        merged.append(img)

                row["photos"] = json.dumps(merged[:5])
                rows[idx] = row
                updated_count += 1

                # Save after each successful find
                with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(rows)
                print(f"  [SAVED] {name} now has {len(merged[:5])} photos")

        await browser.close()
        print(f"\nAll done! Updated {updated_count} venues.")

if __name__ == "__main__":
    asyncio.run(main())

