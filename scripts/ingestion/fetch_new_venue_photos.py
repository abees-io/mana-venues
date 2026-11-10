"""
Fetch outdoor/facade photos for all venues that have empty photo arrays.
Run: python scripts/ingestion/fetch_new_venue_photos.py
"""
import asyncio
import re
import json
import csv
from pathlib import Path

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")


async def fetch_venue_photos(page, name: str, city: str, district: str, already_used: set):
    """Search Google Maps for the venue and get outdoor photos."""
    query = f"{name} {city} {district} Kerala"
    url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
    print(f"\n--- Searching: {name} ({city}, {district})")
    photos = []

    try:
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(4000)

        # Accept consent if shown
        try:
            consent = page.locator("button:has-text('Accept all'), button:has-text('I agree')")
            if await consent.count() > 0:
                await consent.first.click()
                await page.wait_for_timeout(1000)
        except Exception:
            pass

        # If search results list, click matching listing
        first_token = name.split()[0].replace(",", "").lower()
        listings = page.locator("a.hfpxzc, a[href*='/maps/place/']")
        if await listings.count() > 0:
            for i in range(min(await listings.count(), 5)):
                aria = (await listings.nth(i).get_attribute("aria-label") or "").lower()
                if first_token in aria or city.lower() in aria:
                    print(f"  Clicking listing: {aria[:60]}")
                    await listings.nth(i).click()
                    await page.wait_for_timeout(3000)
                    break

        # PRIMARY: Cover / outdoor photo button
        cover_btn = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo of']")
        if await cover_btn.count() > 0:
            c_img = cover_btn.first.locator("img")
            if await c_img.count() > 0:
                src = await c_img.first.get_attribute("src")
                if src and ("googleusercontent" in src or "ggpht" in src):
                    clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                    if clean not in already_used:
                        photos.append(clean)
                        already_used.add(clean)
                        print(f"  -> Cover photo: {clean[:80]}...")

        # SECONDARY: Scan all img tags for Google place photos
        all_imgs = page.locator("img")
        cnt = await all_imgs.count()
        for k in range(cnt):
            src = await all_imgs.nth(k).get_attribute("src") or ""
            if ("grass-cs" in src or "gps-cs-s" in src or "/p/" in src or "lh3.googleusercontent" in src):
                if not any(x in src for x in ["w36-h36", "w48-h48", "w60-h60", "/a/"]):
                    clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                    if clean not in already_used and clean not in photos:
                        photos.append(clean)
                        already_used.add(clean)
            if len(photos) >= 3:
                break

    except Exception as e:
        print(f"  Error: {e}")

    print(f"  => Got {len(photos)} photos")
    return photos


async def main():
    # Read CSV
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())

    # Build set of already-used URLs
    global_used = set()
    for r in rows:
        try:
            urls = json.loads(r["photos"]) if r.get("photos") and r["photos"] not in ("[]", "") else []
            global_used.update(urls)
        except Exception:
            pass

    # Find rows needing photos
    empty_rows = [(i, r) for i, r in enumerate(rows)
                  if r.get("photos", "").strip() in ("[]", "", "null")]
    print(f"Venues needing photos: {len(empty_rows)}")

    async with asyncio.timeout(3600):  # 1 hour max
        async with __import__("playwright.async_api", fromlist=["async_playwright"]).async_playwright() as p:
            browser = await p.chromium.launch(headless=True, channel="chrome")
            context = await browser.new_context(locale="en-US")
            page = await context.new_page()

            for idx, (row_idx, row) in enumerate(empty_rows):
                name = row["name"].strip()
                city = row["city"].strip()
                district = row["district"].strip()

                photos = await fetch_venue_photos(page, name, city, district, global_used)

                if photos:
                    rows[row_idx]["photos"] = json.dumps(photos)
                    print(f"  SAVED {len(photos)} photos for: {name}")
                else:
                    # Keep empty array — will show placeholder in UI
                    rows[row_idx]["photos"] = "[]"
                    print(f"  NO PHOTOS FOUND for: {name}")

                # Save every 10 venues as checkpoint
                if (idx + 1) % 10 == 0:
                    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
                        writer = csv.DictWriter(f, fieldnames=fieldnames)
                        writer.writeheader()
                        writer.writerows(rows)
                    print(f"\n  ** Checkpoint saved at {idx+1}/{len(empty_rows)} **\n")

            await browser.close()

    # Final save
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    # Summary
    filled = sum(1 for r in rows if r.get("photos","[]") not in ("[]",""))
    print(f"\nDone! {filled}/{len(rows)} venues now have photos.")


if __name__ == "__main__":
    asyncio.run(main())

