import asyncio
import re
import json
import csv
from pathlib import Path
from playwright.async_api import async_playwright

CSV_PATH = Path("scripts/ingestion/kerala_venues_master.csv")

async def fetch_dinesh():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        queries = [
            "Dinesh Auditorium Kannur Kerala",
            "Dinesh Bhavan Kannur",
            "Dinesh Hall Kannur",
            "Kerala Dinesh Head Office Kannur Auditorium"
        ]

        photos = []
        for q in queries:
            print(f"Trying query: {q}")
            url = f"https://www.google.com/maps/search/{q.replace(' ', '+')}"
            await page.goto(url, wait_until="commit", timeout=20000)
            await page.wait_for_timeout(4000)

            results = page.locator("a[href*='/maps/place/']")
            if await results.count() > 0:
                try:
                    await results.first.click()
                    await page.wait_for_timeout(3000)
                except Exception:
                    pass

            # Check cover photo button
            btn = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo']")
            if await btn.count() > 0:
                c_img = btn.first.locator("img")
                if await c_img.count() > 0:
                    src = await c_img.first.get_attribute("src")
                    if src and ("googleusercontent" in src or "ggpht" in src):
                        clean = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                        photos.append(clean)

                try:
                    await btn.first.click(timeout=1500)
                    await page.wait_for_timeout(2500)
                    g_imgs = page.locator("div[role='img'], a[data-photo-index] div[style*='background-image'], img")
                    cnt = await g_imgs.count()
                    for j in range(cnt):
                        style = await g_imgs.nth(j).get_attribute("style") or ""
                        src = await g_imgs.nth(j).get_attribute("src") or ""
                        match = re.search(r'url\("?([^"\)]+)"?\)', style)
                        f_url = match.group(1) if match else src
                        if f_url and ("googleusercontent" in f_url or "ggpht" in f_url):
                            if not any(x in f_url for x in ["w36-h36", "w48-h48", "w60-h60", "/a/"]):
                                high_res = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", f_url)
                                if high_res not in photos:
                                    photos.append(high_res)
                                    if len(photos) >= 4:
                                        break
                except Exception:
                    pass

            if photos:
                print(f"Success with {q}! Got {len(photos)} photos.")
                break

        await browser.close()

        if photos:
            with open(CSV_PATH, "r", encoding="utf-8") as f:
                rows = list(csv.DictReader(f))
                fieldnames = list(rows[0].keys())

            for r in rows:
                if r["name"] == "Dinesh Auditorium":
                    r["photos"] = json.dumps(photos)
                    print("Updated Dinesh Auditorium in CSV!")

            with open(CSV_PATH, "w", encoding="utf-8", newline="") as f:
                writer = csv.DictWriter(f, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(rows)

if __name__ == "__main__":
    asyncio.run(fetch_dinesh())

