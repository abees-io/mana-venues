import asyncio
import re
from playwright.async_api import async_playwright

async def inspect_gallery():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        query = "Blue Diamond International Convention Centre Kulappully Palakkad"
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        await page.goto(url, wait_until="commit", timeout=25000)
        await page.wait_for_timeout(5000)
        
        # Click the cover photo button
        btn = page.locator("button[aria-label^='Photo of ']")
        if await btn.count() > 0:
            print("Found cover photo button, clicking...")
            await btn.first.click()
            await page.wait_for_timeout(4000)
            
            # Now extract high-res gallery images
            gallery_divs = page.locator("div[role='img'], a[data-photo-index]")
            c = await gallery_divs.count()
            print(f"Gallery items found: {c}")
            
            # Also check background-image or img tags in gallery
            imgs = page.locator("div[aria-label*='Photo'] div[style*='background-image'], a[data-photo-index] div[style*='background-image'], img")
            cnt = await imgs.count()
            print(f"Gallery image elements: {cnt}")
            
            photos = []
            for i in range(cnt):
                style = await imgs.nth(i).get_attribute("style") or ""
                src = await imgs.nth(i).get_attribute("src") or ""
                
                url_match = re.search(r'url\("?([^"\)]+)"?\)', style)
                found_url = url_match.group(1) if url_match else src
                
                if found_url and ("googleusercontent" in found_url or "ggpht" in found_url):
                    if not any(x in found_url for x in ["w36-h36", "w48-h48", "w60-h60"]):
                        high_res = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", found_url)
                        if high_res not in photos:
                            photos.append(high_res)
                            print(f"Photo {len(photos)}: {high_res[:100]}...")
                            if len(photos) >= 6:
                                break

        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_gallery())

