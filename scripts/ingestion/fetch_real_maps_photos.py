import asyncio
import re
import json
import csv
from pathlib import Path
from playwright.async_api import async_playwright

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

async def extract_venue_photo(page, name: str, city: str, district: str) -> list:
    query = f"{name} {city} {district} Kerala"
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    
    try:
        await page.goto(url, wait_until="commit", timeout=15000)
        await page.wait_for_timeout(3500)
        
        # Check consent on first load if any
        try:
            consent = page.locator("button:has-text('Accept all'), button:has-text('I agree')")
            if await consent.count() > 0:
                await consent.first.click(timeout=1500)
                await page.wait_for_timeout(2000)
        except Exception:
            pass

        imgs = page.locator("button[aria-label*='Photo'] img, div[role='region'] img, img")
        count = await imgs.count()
        venue_photos = []
        
        for i in range(count):
            src = await imgs.nth(i).get_attribute("src")
            if not src:
                continue
            # Google Maps venue photos use grass-cs or /p/
            if "googleusercontent.com" in src or "ggpht.com" in src:
                if "grass-cs" in src or "/p/" in src:
                    # Upscale to high-res
                    clean = re.sub(r"=w\d+-h\d+.*", "=w1200-h800-k-no", src)
                    if clean not in venue_photos:
                        venue_photos.append(clean)
                        if len(venue_photos) >= 3:
                            break

        return venue_photos
    except Exception as e:
        print(f"  [Error fetching {name}]: {e}")
        return []

async def main():
    if not CSV_PATH.exists():
        print("CSV not found:", CSV_PATH)
        return

    # Read rows
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = list(reader.fieldnames or [])
        rows = list(reader)

    if "photos" not in fieldnames:
        fieldnames.append("photos")

    print(f"Total venues in CSV: {len(rows)}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        # Prioritize Palakkad venues first so user sees immediate results
        palakkad_first = sorted(rows, key=lambda r: 0 if r.get("district") == "Palakkad" else 1)

        captured_count = 0
        for idx, row in enumerate(palakkad_first):
            name = row.get("name", "").strip()
            city = row.get("city", "").strip()
            district = row.get("district", "").strip()
            
            existing_photos = row.get("photos", "")
            # If already has a real google photo, keep it
            if existing_photos and "googleusercontent" in existing_photos:
                print(f"[{idx+1}/{len(rows)}] Skipping (already has photo): {name}")
                continue

            print(f"[{idx+1}/{len(rows)}] Scraping Maps photo for: {name} ({city}, {district})...")
            photos = await extract_venue_photo(page, name, city, district)
            
            if photos:
                row["photos"] = json.dumps(photos)
                captured_count += 1
                print(f"  -> SUCCESS! Captured {len(photos)} photos for {name}: {photos[0][:90]}...")
            else:
                print(f"  -> No direct photo found for {name}.")

            # Save progress every 5 venues
            if (idx + 1) % 5 == 0 or idx == len(rows) - 1:
                with open(CSV_PATH, "w", newline="", encoding="utf-8") as f:
                    writer = csv.DictWriter(f, fieldnames=fieldnames)
                    writer.writeheader()
                    writer.writerows(rows)
                print(f"--> Saved checkpoint to {CSV_PATH.name} (Total real photos: {captured_count})")

        await browser.close()

    print(f"\nFinished! Total real photos captured: {captured_count}")

if __name__ == "__main__":
    asyncio.run(main())

