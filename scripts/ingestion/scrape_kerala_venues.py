#!/usr/bin/env python3
"""
=============================================================================
Mana Venues - Automated Kerala Wedding Venues Scraper with Real Photos
Author: AI Engineering Team
Description:
    Production-ready asynchronous web scraper built with Playwright and Pandas.
    Extracts real wedding auditoriums, convention centers, full addresses, 
    phone numbers, geolocation coordinates, and direct Google Maps venue photos
    across all 14 districts of Kerala.
    Outputs structured data into `kerala_venues_master.csv`.

Usage:
    python scrape_kerala_venues.py [--headless] [--max-results 30]
=============================================================================
"""

import asyncio
import re
import json
import argparse
import logging
from typing import List, Dict, Optional, Any
from pathlib import Path
import pandas as pd
from playwright.async_api import async_playwright, Page, TimeoutError as PlaywrightTimeoutError

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("scraper.log", encoding="utf-8")
    ]
)
logger = logging.getLogger("ManaVenuesScraper")

# All 14 Districts of Kerala
KERALA_DISTRICTS = [
    "Thiruvananthapuram",
    "Kollam",
    "Pathanamthitta",
    "Alappuzha",
    "Kottayam",
    "Idukki",
    "Ernakulam",
    "Thrissur",
    "Palakkad",
    "Malappuram",
    "Kozhikode",
    "Wayanad",
    "Kannur",
    "Kasaragod"
]

OUTPUT_CSV_PATH = Path("kerala_venues_master.csv")

# Regular expression to extract coordinates from Google Maps URLs
COORD_REGEX = re.compile(r"@(-?\d+\.\d+),(-?\d+\.\d+)")
ALT_COORD_REGEX = re.compile(r"!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)")

# Indian Phone number regex: Landline with STD (0471/0484/etc.) or Mobile (10 digits, opt +91)
PHONE_REGEX = re.compile(r"(?:\+91[\-\s]?)?[6-9]\d{9}|0\d{2,4}[\-\s]?\d{6,8}")


async def handle_cookie_consent(page: Page) -> None:
    """Dismiss any Google cookie or privacy consent dialogues."""
    try:
        consent_button = page.locator(
            "button:has-text('Accept all'), button:has-text('I agree'), form[action*='consent'] button"
        )
        if await consent_button.count() > 0:
            await consent_button.first.click(timeout=3000)
            logger.info("Dismissed cookie consent modal.")
    except Exception:
        pass


async def extract_venue_details(page: Page, district: str) -> Optional[Dict[str, Any]]:
    """Extract full information and real photos from a currently opened Google Maps venue details pane."""
    try:
        # 1. Venue Name
        name = ""
        name_locator = page.locator("h1.DUwDvf, div.DUwDvf, h1[class*='fontHeadlineLarge']")
        if await name_locator.count() > 0:
            name = (await name_locator.first.inner_text()).strip()

        if not name:
            return None

        # 2. Phone Number
        phone_number = ""
        phone_btn = page.locator("button[data-item-id^='phone:tel:']")
        if await phone_btn.count() > 0:
            raw_phone = await phone_btn.first.get_attribute("data-item-id")
            if raw_phone:
                phone_number = raw_phone.replace("phone:tel:", "").strip()

        # Fallback to inspecting text content with telephone tooltip or regex
        if not phone_number:
            tooltip_phone = page.locator("button[data-tooltip*='phone'], button[aria-label*='Phone']")
            if await tooltip_phone.count() > 0:
                text = await tooltip_phone.first.inner_text()
                match = PHONE_REGEX.search(text)
                if match:
                    phone_number = match.group(0).strip()

        # 3. Full Address
        address = ""
        address_btn = page.locator("button[data-item-id='address'], button[data-tooltip*='address']")
        if await address_btn.count() > 0:
            address = (await address_btn.first.inner_text()).strip()

        # 4. Latitude and Longitude from URL
        latitude = None
        longitude = None
        current_url = page.url
        coord_match = COORD_REGEX.search(current_url)
        if coord_match:
            latitude = float(coord_match.group(1))
            longitude = float(coord_match.group(2))
        else:
            alt_match = ALT_COORD_REGEX.search(current_url)
            if alt_match:
                latitude = float(alt_match.group(1))
                longitude = float(alt_match.group(2))

        # 5. Extract City / Locality heuristic from address
        city = district
        if address:
            parts = [p.strip() for p in address.split(",") if p.strip()]
            if len(parts) >= 2:
                city = parts[-2] if not any(c.isdigit() for c in parts[-2]) else parts[0]

        # 6. Extract Real Venue Photos from Google Maps Header
        photos = []
        try:
            photo_selectors = [
                "button[aria-label*='Photo'] img",
                "button[jsaction*='pane.heroHeaderImage'] img",
                "div.Z6bGeb img",
                "div[role='region'] img[src*='googleusercontent.com']",
                "img[src*='googleusercontent.com']",
                "img[src*='ggpht.com']"
            ]
            for sel in photo_selectors:
                elements = page.locator(sel)
                count = await elements.count()
                for idx in range(min(count, 5)):
                    src = await elements.nth(idx).get_attribute("src")
                    if src and ("googleusercontent.com" in src or "ggpht.com" in src):
                        # Upgrade thumbnail to high-res (w1200-h800)
                        high_res = re.sub(r"=w\d+-h\d+.*", "=w1200-h800-k-no", src)
                        if high_res not in photos:
                            photos.append(high_res)
                if len(photos) >= 3:
                    break
        except Exception as p_err:
            logger.debug(f"Photo extraction error: {p_err}")

        return {
            "name": name,
            "district": district,
            "city": city,
            "address": address or f"{name}, {district}, Kerala",
            "phone_number": phone_number or None,
            "latitude": latitude,
            "longitude": longitude,
            "starting_price": 40000.00,
            "capacity": 500,
            "photos": json.dumps(photos) if photos else "[]",
            "is_verified": True,
            "is_claimed": False
        }

    except Exception as e:
        logger.debug(f"Error parsing detail pane: {e}")
        return None


async def scrape_district_venues(
    page: Page,
    district: str,
    max_results_per_district: int = 30
) -> List[Dict[str, Any]]:
    """Scrapes Google Maps for wedding venues & convention centers in a given district."""
    search_query = f"wedding auditoriums convention centers in {district} Kerala"
    search_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"
    
    logger.info(f"==> [{district}] Navigating to: {search_url}")
    try:
        await page.goto(search_url, wait_until="domcontentloaded", timeout=45000)
    except PlaywrightTimeoutError:
        logger.warning(f"Timeout while opening query for {district}. Retrying...")
        await page.goto(search_url, wait_until="load", timeout=60000)

    await handle_cookie_consent(page)
    await page.wait_for_timeout(3000)

    # Locate the scrollable results feed
    feed_selector = "div[role='feed']"
    try:
        await page.wait_for_selector(feed_selector, timeout=12000)
    except Exception:
        logger.warning(f"Results feed not immediately found for {district}. Proceeding with alternative layout.")

    venues: List[Dict[str, Any]] = []
    seen_names = set()

    # Progressively scroll the feed pane to load dynamic listings
    scroll_attempts = 0
    max_scrolls = 25
    prev_listing_count = 0

    while scroll_attempts < max_scrolls:
        listing_locators = page.locator("a.hfpxzc, div[role='article']")
        count = await listing_locators.count()

        if count >= max_results_per_district or (count > 0 and count == prev_listing_count and scroll_attempts > 6):
            logger.info(f"Loaded {count} venue listings for {district}.")
            break

        prev_listing_count = count

        # Scroll feed down
        feed = page.locator(feed_selector)
        if await feed.count() > 0:
            await feed.evaluate("node => node.scrollBy(0, 1500)")
        else:
            await page.keyboard.press("PageDown")

        await page.wait_for_timeout(1500)
        scroll_attempts += 1

    # Extract details for each loaded venue
    listings = page.locator("a.hfpxzc")
    total_found = await listings.count()
    logger.info(f"Processing up to {min(total_found, max_results_per_district)} cards for {district}...")

    for i in range(min(total_found, max_results_per_district)):
        try:
            item = listings.nth(i)
            aria_label = await item.get_attribute("aria-label")
            if aria_label and aria_label in seen_names:
                continue

            # Click on listing to open detail view panel
            await item.click()
            await page.wait_for_timeout(1800)

            venue_data = await extract_venue_details(page, district)
            if venue_data and venue_data["name"] and venue_data["name"] not in seen_names:
                seen_names.add(venue_data["name"])
                venues.append(venue_data)
                phone_str = venue_data['phone_number'] or 'N/A'
                photo_count = len(json.loads(venue_data['photos'])) if venue_data.get('photos') else 0
                logger.info(f"  [{district}] Added: {venue_data['name']} | Phone: {phone_str} | Photos: {photo_count}")

        except Exception as err:
            logger.debug(f"Failed processing item #{i}: {err}")
            continue

    logger.info(f"Completed {district}: {len(venues)} venues captured.")
    return venues


async def main():
    parser = argparse.ArgumentParser(description="Mana Venues 14-District Scraper with Photos")
    parser.add_argument("--headless", action="store_true", default=True, help="Run browser in headless mode")
    parser.add_argument("--head", dest="headless", action="store_false", help="Run browser in headed mode for debugging")
    parser.add_argument("--max-results", type=int, default=25, help="Maximum venues to scrape per district")
    parser.add_argument("--districts", nargs="+", default=KERALA_DISTRICTS, help="Specific districts to target")
    args = parser.parse_args()

    all_venues: List[Dict[str, Any]] = []

    logger.info("Starting Kerala 14-District Ingestion Pipeline with Photo Extraction...")
    logger.info(f"Target districts: {len(args.districts)} | Max results per district: {args.max_results}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=args.headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage"
            ]
        )
        context = await browser.new_context(
            viewport={"width": 1366, "height": 850},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            locale="en-US"
        )
        page = await context.new_page()

        for district in args.districts:
            try:
                district_venues = await scrape_district_venues(page, district, args.max_results)
                all_venues.extend(district_venues)
            except Exception as e:
                logger.error(f"Error during scraping for district '{district}': {e}", exc_info=True)

        await browser.close()

    # Compile and export into master CSV
    if all_venues:
        df = pd.DataFrame(all_venues)
        df.drop_duplicates(subset=["name", "district"], inplace=True)
        df.to_csv(OUTPUT_CSV_PATH, index=False, encoding="utf-8")
        logger.info("============================================================")
        logger.info(f"Successfully scraped {len(df)} venues across Kerala.")
        logger.info(f"Exported to master CSV: {OUTPUT_CSV_PATH.resolve()}")
        logger.info("============================================================")
    else:
        logger.warning("No venue records were extracted.")


if __name__ == "__main__":
    asyncio.run(main())
