import asyncio
from playwright.async_api import async_playwright

async def inspect():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        query = "Blue Diamond International Convention Centre Kulappully Palakkad"
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        print("Navigating to:", url)
        await page.goto(url, wait_until="commit", timeout=25000)
        await page.wait_for_timeout(6000)
        
        # Check title/URL
        print("Final URL:", page.url)
        print("Page Title:", await page.title())

        # Check buttons with aria-label Photo
        photo_buttons = page.locator("button[aria-label*='Photo'], button[aria-label*='photo'], div[role='img']")
        pb_count = await photo_buttons.count()
        print(f"Photo buttons/elements count: {pb_count}")
        for i in range(min(pb_count, 10)):
            aria = await photo_buttons.nth(i).get_attribute("aria-label") or ""
            print(f"  El {i}: aria='{aria}'")
            img = photo_buttons.nth(i).locator("img")
            if await img.count() > 0:
                src = await img.first.get_attribute("src")
                print(f"    img src: {src[:120] if src else 'None'}")

        # Let's inspect all googleusercontent images
        all_imgs = page.locator("img")
        cnt = await all_imgs.count()
        print(f"All images count: {cnt}")
        for i in range(cnt):
            src = await all_imgs.nth(i).get_attribute("src")
            if src and ("googleusercontent" in src or "ggpht" in src):
                w = await all_imgs.nth(i).get_attribute("width") or ""
                h = await all_imgs.nth(i).get_attribute("height") or ""
                alt = await all_imgs.nth(i).get_attribute("alt") or ""
                print(f"  Img {i} (w={w}, h={h}, alt='{alt}'): {src[:110]}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect())

