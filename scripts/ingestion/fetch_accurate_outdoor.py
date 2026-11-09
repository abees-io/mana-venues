import asyncio
import re
import json
import csv
from pathlib import Path
from playwright.async_api import async_playwright

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

# Exact specific Google Maps queries to hit each venue directly
ACCURATE_QUERIES = {
    "Evaniah Gardens Convention Center": "Evaniah Gardens Convention Center Pattambi Kerala",
    "SitharaAuditorium,Pattambi": "Sithara Auditorium Guruvayoor Road Pattambi Kerala",
    "Chitra Community Hall": "Chitra Community Hall Pattambi Kerala",
    "Royal Convention center": "Royal Convention center Pattambi Kerala",
    "Chaithanya Convention Centre": "Chaithanya Convention Centre Mele Pattambi Kerala",
    "Green Oasis Convention Centre": "Green Oasis Convention Centre Cherpulassery Kerala",
    "Al-Ain Auditorium": "Al Ain Auditorium Cherpulassery Kerala",
    "Royal Auditorium, Cherpulassery": "Royal Auditorium Cherpulassery Kerala",
    "Lakshmi Kalyana Mandapam": "Lakshmi Kalyana Mandapam Cherpulassery Kerala",
    "Alankar Auditorium": "Alankar Auditorium Cherpulassery Kerala",
    "Maliyakkal Garden Auditorium": "Maliyakkal Garden Auditorium Ottapalam Kerala",
    "Sangamam Auditorium": "Sangamam Auditorium Ottapalam Kerala",
    "Pisharody's Auditorium": "Pisharody's Auditorium Ottapalam Kerala",
    "SK Convention Center": "SK Convention Center Mannarkkad Kerala",
    "Pazheri Palace Convention Centre": "Pazheri Palace Convention Centre Mannarkkad Kerala",
    "SV Convention Center": "SV Convention Center Shoranur Kerala",
    "Sree Parvathy Mandapam AC Hall Auditorium": "Sree Parvathy Mandapam Ottapalam Kerala",
}

async def fetch_venue_outdoor_unique(page, name: str, search_query: str, already_used_urls: set):
    url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
    print(f"\n==========================================")
    print(f"Searching: {name} -> {url}")
    try:
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(4500)

        # Consent if any
        try:
            consent = page.locator("button:has-text('Accept all'), button:has-text('I agree')")
            if await consent.count() > 0:
                await consent.first.click()
                await page.wait_for_timeout(1000)
        except Exception:
            pass

        # If multiple search results, look for listing that contains the main keyword
        first_token = name.split()[0].replace(",", "").lower()
        listings = page.locator("a.hfpxzc, a[href*='/maps/place/']")
        if await listings.count() > 0:
            for i in range(min(await listings.count(), 6)):
                aria = (await listings.nth(i).get_attribute("aria-label") or "").lower()
                if first_token in aria:
                    print(f"  Clicking matching listing: {aria}")
                    await listings.nth(i).click()
                    await page.wait_for_timeout(3500)
                    break

        # Check for place header / cover photo (the outdoor facade of the building)
        cover_btn = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo of']")
        outdoor_photo = None
        if await cover_btn.count() > 0:
            c_img = cover_btn.first.locator("img")
            if await c_img.count() > 0:
                src = await c_img.first.get_attribute("src")
                if src and ("googleusercontent" in src or "ggpht" in src):
                    clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                    if clean not in already_used_urls:
                        outdoor_photo = clean
                        print(f"  -> PRIMARY OUTDOOR BUILDING PHOTO: {clean[:90]}...")

        # Also get gallery photos
        photos = []
        if outdoor_photo:
            photos.append(outdoor_photo)

        if await cover_btn.count() > 0:
            try:
                await cover_btn.first.click(timeout=1500)
                await page.wait_for_timeout(2500)

                # Look for Outside tab
                tabs = page.locator("button[role='tab']")
                for t_idx in range(await tabs.count()):
                    tab_text = (await tabs.nth(t_idx).inner_text()).strip().lower()
                    if "outside" in tab_text:
                        print(f"  Switching to '{tab_text}' tab...")
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
                            if high_res not in photos and high_res not in already_used_urls:
                                photos.append(high_res)
                                if len(photos) >= 4:
                                    break
            except Exception as e:
                print(f"  Gallery error: {e}")

        # If we didn't get enough, scan place imgs
        if len(photos) < 2:
            all_imgs = page.locator("img")
            cnt = await all_imgs.count()
            for k in range(cnt):
                src = await all_imgs.nth(k).get_attribute("src")
                if src and ("grass-cs" in src or "gps-cs-s" in src or "/p/" in src):
                    if not any(x in src for x in ["w36-h36", "/a/"]):
                        clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                        if clean not in photos and clean not in already_used_urls:
                            photos.append(clean)
                            if len(photos) >= 3:
                                break

        print(f"  [RESULT for {name}]: {len(photos)} unique photos extracted.")
        return photos
    except Exception as err:
        print(f"  Error: {err}")
        return []

async def main():
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fieldnames = list(rows[0].keys())

    # Filter out NON_AUDITORIUMS from filter_clean_venues
    from filter_clean_venues import NON_AUDITORIUMS
    clean_rows = [r for r in rows if r["name"].strip() not in NON_AUDITORIUMS]
    print(f"Starting with {len(clean_rows)} verified real venues.")

    # Global set of already allocated URLs to ensure ZERO duplicates
    global_used_urls = set()
    for r in clean_rows:
        if r["name"] not in ACCURATE_QUERIES:
            p = json.loads(r["photos"]) if r.get("photos") and r["photos"] != "[]" else []
            for u in p:
                global_used_urls.add(u)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(locale="en-US")
        page = await context.new_page()

        for idx, row in enumerate(clean_rows):
            name = row["name"].strip()
            if name in ACCURATE_QUERIES:
                q = ACCURATE_QUERIES[name]
                unique_photos = await fetch_venue_outdoor_unique(page, name, q, global_used_urls)
                if unique_photos:
                    for u in unique_photos:
                        global_used_urls.add(u)
                    row["photos"] = json.dumps(unique_photos)
                    clean_rows[idx] = row
                    print(f"  => UPDATED {name} with {len(unique_photos)} distinct photos!")

        await browser.close()

    # Save cleaned dataset
    with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)

    print(f"\nSaved {len(clean_rows)} venues to CSV. Verification follows...")

if __name__ == "__main__":
    asyncio.run(main())

