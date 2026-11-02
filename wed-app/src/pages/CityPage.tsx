import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { MapPin, SlidersHorizontal } from 'lucide-react'
import Layout from '../components/layout/Layout'
import FilterPanel from '../components/filters/FilterPanel'
import AuditoriumCard from '../components/cards/AuditoriumCard'
import { AuditoriumCardSkeletonList } from '../components/cards/AuditoriumCardSkeleton'
import { useCities } from '../hooks/useCities'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

type SortOption = 'price_asc' | 'price_desc' | 'capacity_desc'

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.toLowerCase() ?? ''

  const { data: cities } = useCities()
  const setCity = useCityStore((state) => state.setCity)

  // Filter store
  const capacityMin = useFilterStore((state) => state.capacityMin)
  const capacityMax = useFilterStore((state) => state.capacityMax)
  const priceMin = useFilterStore((state) => state.priceMin)
  const priceMax = useFilterStore((state) => state.priceMax)
  const amenities = useFilterStore((state) => state.amenities)
  const resetFilters = useFilterStore((state) => state.resetFilters)

  // Local state
  const [sortBy, setSortBy] = useState<SortOption>('price_asc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Sync selected city with cityStore
  const matchedCity = useMemo(() => {
    if (!cities || !slug) return null
    return cities.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null
  }, [cities, slug])

  useEffect(() => {
    if (matchedCity) {
      setCity({
        id: matchedCity.id,
        name: matchedCity.name,
        slug: matchedCity.slug,
      })
    }
  }, [matchedCity, setCity])

  const cityName = matchedCity?.name ?? (slug ? slug.charAt(0).toUpperCase() + slug.slice(1) : 'Kerala')
  const stateName = matchedCity?.state ?? 'Kerala'

  // Query auditoriums with active filters
  const filterParams = useMemo(
    () => ({
      capacityMin,
      capacityMax,
      priceMin,
      priceMax,
      amenities,
    }),
    [capacityMin, capacityMax, priceMin, priceMax, amenities]
  )

  const { data: auditoriums, isLoading } = useAuditoriums(slug, filterParams)

  // Calculate active filter count (how many differ from default values)
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (capacityMin > 0) count++
    if (capacityMax < 5000) count++
    if (priceMin > 0) count++
    if (priceMax < 500000) count++
    if (amenities.length > 0) count++
    return count
  }, [capacityMin, capacityMax, priceMin, priceMax, amenities])

  // Filter and sort client-side
  const sortedAuditoriums = useMemo(() => {
    if (!auditoriums) return []
    let list = [...auditoriums]

    // Optional search term filtering if ?q= is present
    if (searchQuery) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery) ||
          a.address?.toLowerCase().includes(searchQuery)
      )
    }

    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => a.base_price_per_day - b.base_price_per_day)
      case 'price_desc':
        return list.sort((a, b) => b.base_price_per_day - a.base_price_per_day)
      case 'capacity_desc':
        return list.sort((a, b) => b.seating_capacity - a.seating_capacity)
      default:
        return list
    }
  }, [auditoriums, sortBy, searchQuery])

  return (
    <Layout>
      {/* Mobile Sticky Bar */}
      <div className="md:hidden sticky top-16 z-30 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-sm font-bold text-brand-dark truncate max-w-[170px]">
            Venues in {cityName}
          </h1>
          <p className="text-[11px] text-gray-500">
            {isLoading ? 'Loading...' : `${sortedAuditoriums.length} venues found`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort venues"
            className="bg-gray-50 border border-gray-200 text-xs font-medium text-brand-dark rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="capacity_desc">Capacity</option>
          </select>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-transform"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-white text-brand-primary text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer FilterPanel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        mode="drawer"
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden md:block">
            <FilterPanel mode="sidebar" />
          </div>

          {/* Right Column: Header + Card Grid */}
          <div className="flex-1 min-w-0 w-full space-y-6">
            {/* Desktop City Header */}
            <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-xs">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-brand-primary mb-1">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {cityName}, {stateName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-brand-dark">
                    Venues in {cityName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-accent text-brand-primary text-xs font-semibold">
                    {sortedAuditoriums.length} venues found
                  </span>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-gray-500 font-medium whitespace-nowrap"
                >
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-white border border-gray-200 text-xs font-medium text-brand-dark rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer shadow-xs"
                >
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="capacity_desc">Capacity: Large First</option>
                </select>
              </div>
            </div>

            {/* Auditoriums Grid or States */}
            {isLoading ? (
              <AuditoriumCardSkeletonList count={6} />
            ) : sortedAuditoriums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAuditoriums.map((auditorium) => (
                  <AuditoriumCard key={auditorium.id} auditorium={auditorium} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-full bg-brand-accent mx-auto flex items-center justify-center text-brand-primary">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-brand-dark">
                    No venues match your filters
                  </h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Try adjusting your capacity range, daily budget, or amenities to find available venues in {cityName}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-xs"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
