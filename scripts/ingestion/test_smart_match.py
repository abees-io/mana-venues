import asyncio
import re
from playwright.async_api import async_playwright

def find_best_matching_listing(aria_labels, venue_name):
    clean_v = re.sub(r"[^\w\s]", " ", venue_name.lower())
    words = [w for w in clean_v.split() if w not in ["auditorium", "convention", "centre", "center", "hall", "and", "kerala", "palakkad", "the"]]
    if not words:
        words = [clean_v.split()[0]]

    best_idx = None
    best_score = 0
    for idx, label in enumerate(aria_labels):
        clean_l = re.sub(r"[^\w\s]", " ", label.lower())
        label_words = clean_l.split()
        score = sum(1 for w in words if w in clean_l)
        if score > best_score:
            best_score = score
            best_idx = idx

    return best_idx, best_score

async def test_search():
    venues = [
        ("Kalladi Convention Centre & Auditorium", "Pattambi", "Palakkad"),
        ("The Gazebo Heritage", "Pattambi", "Palakkad"),
        ("Janabheri Convention Center", "Pattambi", "Palakkad"),
        ("Al-Manama Auditorium & Convention Hall", "Pattambi", "Palakkad"),
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, channel="chrome")
        context = await browser.new_context(locale="en-US")
        page = await context.new_page()

        for name, city, district in venues:
            query = f"{name} {city} Kerala"
            url = f"https://www.google.com/maps/search/{query.replace(' ', '+')}"
            print(f"\nSearching: {query}")
            await page.goto(url, wait_until="commit", timeout=20000)
            await page.wait_for_timeout(3500)

            listings = page.locator("a.hfpxzc, a[href*='/maps/place/']")
            count = await listings.count()
            labels = []
            for i in range(count):
                lbl = (await listings.nth(i).get_attribute("aria-label") or "").strip()
                if lbl and lbl not in labels:
                    labels.append(lbl)

            print(f"  Found {len(labels)} listing labels: {labels[:4]}")
            best_idx, score = find_best_matching_listing(labels, name)
            if best_idx is not None and score > 0:
                print(f"  -> CORRECT MATCH (score={score}): '{labels[best_idx]}'")
            else:
                print(f"  -> NO CONFIDENT MATCH for '{name}'")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(test_search())

