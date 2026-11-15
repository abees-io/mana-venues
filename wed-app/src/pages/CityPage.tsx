import { useState, useEffect, useMemo } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { MapPin, SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react'
import Layout from '../components/layout/Layout'
import FilterPanel from '../components/filters/FilterPanel'
import LocationModal from '../components/modals/LocationModal'
import AuditoriumCard from '../components/cards/AuditoriumCard'
import { AuditoriumCardSkeletonList } from '../components/cards/AuditoriumCardSkeleton'
import { useCities, KERALA_DISTRICTS_CITIES } from '../hooks/useCities'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

type SortOption = 'price_asc' | 'price_desc' | 'capacity_desc'

export default function CityPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('q')?.toLowerCase() ?? ''
  const navigate = useNavigate()

  const { data: cities } = useCities()
  const selectedCity = useCityStore((state) => state.selectedCity)
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
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [mobileSearchTerm, setMobileSearchTerm] = useState('')

  // Sync selected city with cityStore and fallback districts
  const matchedCity = useMemo(() => {
    if (!slug) return null
    const list = cities && cities.length > 0 ? cities : KERALA_DISTRICTS_CITIES
    const lowerSlug = slug.toLowerCase()
    return (
      list.find((c) => c.slug.toLowerCase() === lowerSlug) ||
      list.find((c) => c.name.toLowerCase().includes(lowerSlug)) ||
      null
    )
  }, [cities, slug])

  // 1. If store selectedCity changes while on CityPage, navigate to the new city URL
  useEffect(() => {
    if (selectedCity?.slug && slug && selectedCity.slug.toLowerCase() !== slug.toLowerCase()) {
      const q = searchParams.get('q')
      const queryString = q ? `?q=${encodeURIComponent(q)}` : ''
      navigate(`/city/${selectedCity.slug}${queryString}`, { replace: true })
    }
  }, [selectedCity?.slug, slug, navigate, searchParams])

  // 2. If URL slug changes, sync store city
  useEffect(() => {
    if (matchedCity && matchedCity.slug.toLowerCase() !== selectedCity?.slug?.toLowerCase()) {
      setCity({
        id: matchedCity.id,
        name: matchedCity.name,
        slug: matchedCity.slug,
      })
    }
  }, [matchedCity, selectedCity?.slug, setCity])

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

    // Optional search term filtering (from URL query or local mobile search bar)
    const activeSearch = (mobileSearchTerm || searchQuery).trim().toLowerCase()
    if (activeSearch) {
      list = list.filter(
        (a) =>
          (a.title || a.name || '').toLowerCase().includes(activeSearch) ||
          a.address?.toLowerCase().includes(activeSearch)
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
  }, [auditoriums, sortBy, searchQuery, mobileSearchTerm])

  return (
    <Layout>
      {/* Mobile Sticky Bar */}
      <div className="md:hidden sticky top-16 z-30 bg-brand-dark/95 backdrop-blur-md border-b border-green-800/40 px-3 py-2 flex items-center justify-between gap-2 shadow-xs text-white">
        {!isMobileSearchOpen ? (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="flex items-center gap-1 text-left group cursor-pointer max-w-[calc(100%-2rem)]"
                aria-label={`Change city, currently ${cityName}`}
              >
                <h1 className="text-xs sm:text-sm font-bold text-white group-hover:text-brand-secondary transition-colors truncate">
                  Venues in {cityName}
                </h1>
                <ChevronDown className="w-3.5 h-3.5 text-green-400 group-hover:text-brand-secondary transition-colors shrink-0" />
              </button>
              {/* Small search icon on the side of Venues in Palakkad (mobile only) */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="p-1 rounded-full text-green-300 hover:text-white hover:bg-green-800/40 transition-colors shrink-0"
                aria-label="Search venues"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] sm:text-[11px] text-green-300/70 truncate">
              {isLoading ? 'Loading...' : `${sortedAuditoriums.length} venues found`}
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center gap-1.5 min-w-0">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-green-400/60 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={mobileSearchTerm}
                onChange={(e) => setMobileSearchTerm(e.target.value)}
                placeholder={`Search in ${cityName}...`}
                className="w-full pl-8 pr-7 py-1 text-xs bg-green-950/80 border border-green-700/50 rounded-full text-white placeholder-green-400/50 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {mobileSearchTerm && (
                <button
                  type="button"
                  onClick={() => setMobileSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-green-300/70 hover:text-white"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMobileSearchOpen(false)
                setMobileSearchTerm('')
              }}
              className="text-[11px] font-medium text-green-300 hover:text-white px-1 shrink-0"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            aria-label="Sort venues"
            className="bg-green-950/80 border border-green-700/40 text-xs font-medium text-green-100 rounded-lg px-2 py-1.5 focus:outline-none max-w-[110px]"
          >
            <option value="price_asc">Price: Low-High</option>
            <option value="price_desc">Price: High-Low</option>
            <option value="capacity_desc">Capacity</option>
          </select>

          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-transform shrink-0"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold flex items-center justify-center">
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
            <div className="hidden md:flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-dark/85 backdrop-blur-md p-5 rounded-xl border border-green-800/40 shadow-xl">
              <div>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-brand-secondary hover:text-[#FFF04B] mb-1 cursor-pointer transition-colors group"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    {cityName}, {stateName}
                  </span>
                  <ChevronDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" />
                </button>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    Venues in {cityName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-green-900/50 text-brand-secondary border border-green-700/40 text-xs font-semibold">
                    {sortedAuditoriums.length} venues found
                  </span>
                </div>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-select"
                  className="text-xs text-green-300/70 font-medium whitespace-nowrap"
                >
                  Sort by:
                </label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="bg-green-950/80 border border-green-700/40 text-xs font-medium text-green-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-secondary cursor-pointer shadow-xs"
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
              <div className="bg-brand-dark/85 backdrop-blur-md rounded-xl p-10 text-center border border-green-800/40 shadow-xl space-y-4">
                <div className="w-12 h-12 rounded-full bg-green-900/40 mx-auto flex items-center justify-center text-brand-secondary">
                  <SlidersHorizontal className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-white">
                    No venues match your filters
                  </h3>
                  <p className="text-xs text-green-200/70 max-w-sm mx-auto">
                    Try adjusting your capacity range, daily budget, or amenities to find available venues in {cityName}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 bg-brand-secondary text-brand-dark text-xs font-bold rounded-lg hover:bg-brand-secondary/90 transition-colors cursor-pointer shadow-xs"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Location Modal for City Selection */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </Layout>
  )
}
