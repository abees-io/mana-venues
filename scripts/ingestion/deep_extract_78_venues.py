import asyncio
import csv
import json
import re
from pathlib import Path
from playwright.async_api import async_playwright
from supabase import create_client

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")
SUPABASE_URL = "https://efhmmsprizhptpecllrh.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmaG1tc3ByaXpocHRwZWNsbHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM2MTE5MDYsImV4cCI6MjEwOTE4NzkwNn0.Xm3KFeOpcQpFNlmEG83X_TguqkW3hPCN21eD7GtpZ_Q"

def clean_photo_url(url: str) -> str:
    if not url:
        return ""
    # Upgrade to high resolution
    return re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", url)

def is_valid_venue_photo(url: str) -> bool:
    if not url or not isinstance(url, str):
        return False
    if not url.startswith("http"):
        return False
    if "unsplash.com" in url or "placeholder" in url:
        return False
    # Exclude reviewer avatars, user profile icons, thumbnails
    if any(bad in url for bad in ["/a/", "/a-/", "w36-h36", "w48-h48", "w60-h60", "=s32", "=s48", "=s64", "default_avatar"]):
        return False
    # Must be Google Place / Maps photo
    if any(good in url for good in ["grass-cs", "gps-cs-s", "/p/", "p-k-no", "lh3.googleusercontent.com/p/"]):
        return True
    if "googleusercontent.com" in url or "ggpht.com" in url:
        return True
    return False

async def extract_gallery_photos(page, name: str, city: str, district: str) -> list:
    queries = [
        f"{name} {city} {district} Kerala",
        f"{name} {district} Kerala"
    ]

    all_photos = []

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
                    await page.wait_for_timeout(1000)
            except Exception:
                pass

            # If search returns multiple listings, click the first / best match
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

            # Click cover photo or Photos tab to open full gallery
            cover_btn = page.locator(
                "button[aria-label^='Photo of'], button[aria-label*='Photo of'], button[role='tab']:has-text('Photos'), button:has-text('Photos')"
            )
            if await cover_btn.count() > 0:
                try:
                    await cover_btn.first.click(timeout=2500)
                    await page.wait_for_timeout(2500)
                except Exception:
                    pass

                # Scroll gallery to load more photos
                try:
                    gallery_scroll = page.locator("div[role='region'][aria-label*='Photos'], div.m6QErb.DxyBCb.kA9KIf.dS8AEf, div.m6QErb")
                    if await gallery_scroll.count() > 0:
                        for _ in range(4):
                            await gallery_scroll.first.evaluate("(el) => el.scrollBy(0, 1500)")
                            await page.wait_for_timeout(800)
                    else:
                        for _ in range(3):
                            await page.mouse.wheel(0, 1500)
                            await page.wait_for_timeout(800)
                except Exception:
                    pass

            # Extract from all gallery elements: images and style backgrounds
            imgs = page.locator(
                "a[data-photo-index] div[style*='background-image'], "
                "div[role='img'][style*='background-image'], "
                "div[style*='background-image'], "
                "button[aria-label*='Photo'] img, "
                "img"
            )
            cnt = await imgs.count()
            for i in range(cnt):
                style = await imgs.nth(i).get_attribute("style") or ""
                src = await imgs.nth(i).get_attribute("src") or ""
                m = re.search(r'url\(["\']?(.*?)["\']?\)', style)
                found = m.group(1) if m else src
                if is_valid_venue_photo(found):
                    clean = clean_photo_url(found)
                    if clean not in all_photos:
                        all_photos.append(clean)
                if len(all_photos) >= 12:
                    break

            if len(all_photos) >= 2:
                return all_photos

            if q_idx == 0 and len(all_photos) == 0:
                continue

        except Exception as e:
            print(f"    [Maps fetch error]: {e}")
            continue

    return all_photos

async def main():
    client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Load 78/79 venue names from task-58 log + Thrippunithura
    target_names = ['Thrippunithura Kalyana Mandapam']
    try:
        with open('C:/Users/ABHI/.gemini/antigravity/brain/274a3ad4-5474-43c5-bc82-766a31c116d4/.system_generated/tasks/task-58.log', 'r', encoding='utf-8') as f:
            text = f.read()
        matches = re.findall(r'\[(\d+)/78\] Searching: (.*?) \((.*?), (.*?)\)\.\.\.', text)
        for m in matches:
            if m[1] not in target_names:
                target_names.append(m[1])
    except Exception as e:
        print("Error reading log:", e)

    print(f"Target venues for deep extraction: {len(target_names)}")

    # Fetch from Supabase
    res = client.table("auditoriums").select("id, name, title, slug, district, city, photos").execute()
    sb_rows = res.data or []
    sb_by_name = {}
    for r in sb_rows:
        n = r.get("title") or r.get("name")
        if n:
            sb_by_name[n] = r

    target_venues = []
    for name in target_names:
        if name in sb_by_name:
            target_venues.append(sb_by_name[name])
        else:
            # Try partial match
            match = next((r for r in sb_rows if name.lower() in (r.get("title") or "").lower() or name.lower() in (r.get("name") or "").lower()), None)
            if match:
                target_venues.append(match)

    print(f"Found {len(target_venues)} matching records in Supabase.")

    # Load CSV
    with open(CSV_PATH, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        csv_fieldnames = list(reader.fieldnames or [])
        csv_rows = list(reader)

    csv_by_slug = {r.get("slug"): r for r in csv_rows}
    csv_by_name = {r.get("name"): r for r in csv_rows}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        total_extracted = 0

        for idx, venue in enumerate(target_venues, start=1):
            venue_id = venue["id"]
            name = venue.get("title") or venue.get("name") or venue.get("slug")
            city = venue.get("city") or ""
            district = venue.get("district") or ""
            slug = venue.get("slug") or ""

            print(f"\n[{idx}/{len(target_venues)}] Extracting deep photos: {name} ({city}, {district})...")
            new_photos = await extract_gallery_photos(page, name, city, district)

            # Keep existing real photos if valid, clean out any avatars
            existing_p = venue.get("photos") or []
            if isinstance(existing_p, str):
                try:
                    existing_p = json.loads(existing_p)
                except Exception:
                    existing_p = []
            
            clean_existing = [clean_photo_url(p) for p in existing_p if is_valid_venue_photo(p)]
            
            # Combine: new deep photos first, followed by existing unique ones
            combined = []
            seen = set()
            for p in new_photos + clean_existing:
                if p not in seen:
                    combined.append(p)
                    seen.add(p)

            # Cap at 10 high-resolution photos
            final_photos = combined[:10]

            if final_photos:
                total_extracted += len(final_photos)
                print(f"  -> SUCCESS! Captured {len(final_photos)} photos for {name} (was {len(clean_existing)})")
                
                # Update Supabase
                try:
                    client.table("auditoriums").update({"photos": final_photos}).eq("id", venue_id).execute()
                except Exception as db_err:
                    print(f"  [DB Update Warning]: {db_err}")

                # Update CSV
                matched_csv = csv_by_slug.get(slug) or csv_by_name.get(name)
                if matched_csv:
                    matched_csv["photos"] = json.dumps(final_photos)
            else:
                print(f"  -> No additional photos found.")

            # Flush CSV after every venue
            with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=csv_fieldnames)
                writer.writeheader()
                writer.writerows(csv_rows)

        await browser.close()

    print(f"\n==================================================")
    print(f"Deep Gallery Extraction Complete!")
    print(f"Processed: {len(target_venues)} venues")
    print(f"Total photos stored: {total_extracted}")
    print(f"==================================================")

if __name__ == "__main__":
    asyncio.run(main())

