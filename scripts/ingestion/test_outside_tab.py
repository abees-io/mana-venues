import asyncio
import re
from playwright.async_api import async_playwright

async def test_venue(venue_query: str):
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        
        url = f"https://www.google.com/maps/search/{venue_query.replace(' ', '+')}"
        print(f"\nSearching: {venue_query}")
        await page.goto(url, wait_until="commit", timeout=25000)
        await page.wait_for_timeout(5000)
        
        # Check if direct place or list of results
        print("Current URL:", page.url)
        print("Title:", await page.title())
        
        # If search result list, click first match
        place_links = page.locator("a[href*='/maps/place/']")
        if await place_links.count() > 0:
            print("Clicking first place match...")
            await place_links.first.click()
            await page.wait_for_timeout(4000)
            print("After click URL:", page.url)
        
        # Cover photo (usually outdoor facade)
        cover_btn = page.locator("button[aria-label^='Photo of '], button[aria-label*='Photo']")
        cover_photo = None
        if await cover_btn.count() > 0:
            c_img = cover_btn.first.locator("img")
            if await c_img.count() > 0:
                src = await c_img.first.get_attribute("src")
                if src and ("googleusercontent" in src or "ggpht" in src):
                    cover_photo = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", src)
                    print(f"  -> COVER (OUTDOOR/FACADE): {cover_photo[:100]}...")
            
            # Click cover to see tabs like Outside / Inside
            try:
                await cover_btn.first.click(timeout=2000)
                await page.wait_for_timeout(3000)
                
                # Check for category buttons/tabs (All, Outside, Inside, etc.)
                tab_buttons = page.locator("button[role='tab'], div[role='tab'], button")
                c = await tab_buttons.count()
                for i in range(c):
                    txt = (await tab_buttons.nth(i).inner_text()).strip()
                    if txt in ["Outside", "By owner", "Street View"]:
                        print(f"Found category tab: '{txt}'")
                        await tab_buttons.nth(i).click()
                        await page.wait_for_timeout(2000)
                        break
            except Exception as e:
                print("Gallery tab error:", e)

        # Grab all photos in gallery
        gallery_imgs = page.locator("div[role='img'], a[data-photo-index] div[style*='background-image'], img")
        g_count = await gallery_imgs.count()
        photos = []
        if cover_photo:
            photos.append(cover_photo)
            
        for j in range(g_count):
            style = await gallery_imgs.nth(j).get_attribute("style") or ""
            src = await gallery_imgs.nth(j).get_attribute("src") or ""
            match = re.search(r'url\("?([^"\)]+)"?\)', style)
            f_url = match.group(1) if match else src
            if f_url and ("googleusercontent" in f_url or "ggpht" in f_url):
                if not any(x in f_url for x in ["w36-h36", "w48-h48", "w60-h60", "/a/"]):
                    high_res = re.sub(r"=w\d+-h\d+.*", "=w1600-h1000-k-no", f_url)
                    if high_res not in photos:
                        photos.append(high_res)
                        if len(photos) >= 5:
                            break

        print(f"Total extracted photos for {venue_query}: {len(photos)}")
        for idx, p in enumerate(photos):
            print(f"  [{idx}] {p[:90]}...")

        await browser.close()

async def main():
    await test_venue("The Gazebo Heritage Pattambi Palakkad Kerala")
    await test_venue("Kalladi Convention Centre Pattambi Palakkad Kerala")

if __name__ == "__main__":
    asyncio.run(main())

