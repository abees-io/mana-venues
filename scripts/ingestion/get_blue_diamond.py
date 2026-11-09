import asyncio
import re
import json
from playwright.async_api import async_playwright

async def get_blue_diamond():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True, channel="chrome")
        context = await b.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        url = "https://www.google.com/maps/search/Blue+Diamond+International+Convention+Centre+Kerala"
        print("Navigating to:", url)
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(4500)
        
        # Check title / H1
        h1 = page.locator("h1.DUwDvf, h1[class*='fontHeadlineLarge']")
        name = (await h1.first.inner_text()).strip() if await h1.count() > 0 else "Blue Diamond International Convention Centre"
        
        # Address
        addr_el = page.locator("button[data-item-id='address']")
        addr = (await addr_el.first.inner_text()).strip() if await addr_el.count() > 0 else ""
        
        # Phone
        phone_el = page.locator("button[data-item-id^='phone:tel:']")
        phone = await phone_el.first.get_attribute("data-item-id") if await phone_el.count() > 0 else ""
        phone = phone.replace("phone:tel:", "").strip()
        
        # Photos
        imgs = page.locator("button[aria-label*='Photo'] img, div[role='region'] img, img")
        count = await imgs.count()
        photos = []
        for i in range(count):
            src = await imgs.nth(i).get_attribute("src")
            if src and ("grass-cs" in src or "/p/" in src) and "googleusercontent" in src:
                clean = re.sub(r"=w\d+-h\d+.*", "=w1200-h800-k-no", src)
                if clean not in photos:
                    photos.append(clean)
                    if len(photos) >= 4:
                        break
        
        print("NAME:", name)
        print("ADDRESS:", addr)
        print("PHONE:", phone)
        print("PHOTOS COUNT:", len(photos))
        if photos:
            print("PHOTO 1:", photos[0])
        await b.close()

        return {
            "name": name,
            "address": addr,
            "phone": phone,
            "photos": photos
        }

if __name__ == "__main__":
    asyncio.run(get_blue_diamond())

