import type { City } from './types'

const CITY_ALIASES: [string, string][] = [
  ['kochi', 'ernakulam'],
  ['thiruvananthapuram', 'trivandrum'],
  ['kozhikode', 'calicut'],
  ['alappuzha', 'alleppey'],
]

function normalizeCityToken(value: string): string {
  return value.toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()
}

function tokensMatch(a: string, b: string): boolean {
  const normA = normalizeCityToken(a)
  const normB = normalizeCityToken(b)
  if (!normA || !normB) return false
  if (normA === normB || normA.includes(normB) || normB.includes(normA)) {
    return true
  }
  return CITY_ALIASES.some(
    ([x, y]) =>
      ((normA.includes(x) || normA.includes(y)) && (normB.includes(x) || normB.includes(y)))
  )
}

/**
 * Checks whether a package is available in the customer's selected city.
 * - Supports multi-city arrays (`cities?: string[]`) so packages can appear in one or more cities.
 * - Falls back to `locationText` (if provided) or `allowUnassigned` when `cities` is empty/undefined.
 */
export function matchesPackageCities(
  cities: string[] | undefined,
  selectedCity: { name: string; slug: string } | string | null | undefined,
  locationText?: string,
  allowUnassigned = false
): boolean {
  if (!selectedCity) return true

  const cityName = typeof selectedCity === 'string' ? selectedCity : selectedCity.name
  const citySlug = typeof selectedCity === 'string' ? selectedCity : selectedCity.slug

  if (Array.isArray(cities) && cities.length > 0) {
    return cities.some((c) => tokensMatch(c, citySlug) || tokensMatch(c, cityName))
  }

  if (locationText && locationText.trim()) {
    return tokensMatch(locationText, citySlug) || tokensMatch(locationText, cityName)
  }

  return allowUnassigned
}

/**
 * Formats selected city slugs into a human-readable location summary (e.g. "Kochi, Thrissur, Kottayam").
 */
export function formatSelectedCitiesLocation(selectedSlugs: string[], allCities: City[]): string {
  if (selectedSlugs.length === 0) return ''
  const names = selectedSlugs.map((slug) => {
    const match = allCities.find(
      (c) => c.slug.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase() === slug.toLowerCase()
    )
    return (match ? match.name : slug).replace(/\s*\(.*?\)\s*/g, '').trim()
  })
  return names.join(', ')
}
