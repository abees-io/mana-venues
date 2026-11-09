import asyncio
import re
from playwright.async_api import async_playwright

async def test():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()
        query = "Emirates Convention Centre Kulappully Kerala"
        url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
        print("Navigating to:", url)
        await page.goto(url, wait_until="commit", timeout=20000)
        await page.wait_for_timeout(6000)
        
        print("URL now:", page.url)
        print("Title now:", await page.title())

        # Check for consent button
        buttons = page.locator("button")
        btn_count = await buttons.count()
        print("Buttons count:", btn_count)
        for i in range(btn_count):
            txt = (await buttons.nth(i).inner_text()).strip()
            if any(w in txt.lower() for w in ["accept", "agree", "consent"]):
                print(f"Clicking consent: {txt}")
                await buttons.nth(i).click()
                await page.wait_for_timeout(3000)
                break

        # Look for images
        imgs = page.locator("img")
        img_count = await imgs.count()
        print("Images found:", img_count)
        matches = []
        for i in range(img_count):
            src = await imgs.nth(i).get_attribute("src")
            if src and ("googleusercontent" in src or "ggpht" in src):
                high_res = re.sub(r"=w\d+-h\d+.*", "=w1200-h800-k-no", src)
                if high_res not in matches:
                    matches.append(high_res)
                    print("Found REAL MAPS PHOTO:", high_res)

        await page.screenshot(path="maps_screenshot.png")
        print("Saved maps_screenshot.png")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(test())
