/**
 * Shared photo and location display utilities for venue components.
 * Extracted to avoid duplication between AuditoriumCard and PhotoGallery.
 */

/**
 * Filters a raw photos array to only real, deduplicated venue photo URLs.
 * Removes duplicates, unsplash stock images, placeholder strings, and
 * any entry that isn't a real http(s) URL.
 */
export function filterRealPhotos(photos: unknown[]): string[] {
  if (!photos || photos.length === 0) return []
  const seen = new Set<string>()
  return photos.filter((p): p is string => {
    if (
      typeof p !== 'string' ||
      !p.startsWith('http') ||
      p.includes('unsplash.com') ||
      p.includes('placeholder')
    ) return false
    const key = p.trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/**
 * Returns a city/location display string from auditorium fields.
 * Prefers a specific town name over a generic district or state name.
 * Strips generic "Palakkad" and cleans up Google Maps Plus Code prefixes.
 *
 * @param city     The venue's city field (e.g. "Kulappully")
 * @param address  The venue's full address string
 * @param district The venue's district (e.g. "Palakkad")
 */
export function getVenueCityDisplay(
  city?: string | null,
  address?: string | null,
  district?: string | null,
): string {
  // Show specific town if available; ignore generic "Palakkad" / "Kerala" labels
  if (
    city &&
    city.toLowerCase() !== 'palakkad' &&
    city.toLowerCase() !== 'kerala'
  ) {
    return `${city}, Kerala`
  }

  if (address) {
    const clean = address
      .replace(/[\uE000-\uF8FF]/g, '')           // strip PUA characters
      .replace(/^[A-Z0-9\+]{4,9},\s*/i, '')      // strip Google Plus Codes at the start
      .replace(/\bPalakkad\b/gi, '')              // remove generic district name
      .replace(/,\s*,/g, ',')                     // collapse double commas
      .replace(/^\s*,\s*|\s*,\s*$/g, '')          // trim leading/trailing commas
      .trim()
    if (clean) return clean
  }

  if (district && district.toLowerCase() !== 'palakkad') {
    return `${district}, Kerala`
  }

  return 'Kerala'
}

