import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  MapPin,
  Search,
  RefreshCw,
  X,
  Building2,
  ChevronRight,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import AuditoriumCard from '../components/cards/AuditoriumCard'
import { AuditoriumCardSkeletonList } from '../components/cards/AuditoriumCardSkeleton'
import LocationModal from '../components/modals/LocationModal'
import ScrollAnimatedSection from '../components/home/ScrollAnimatedSection'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCities } from '../hooks/useCities'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const navigate = useNavigate()
  const { selectedCity, setCity, clearCity } = useCityStore()
  
  const capacityMin = useFilterStore((state) => state.capacityMin)
  const capacityMax = useFilterStore((state) => state.capacityMax)
  const priceMin = useFilterStore((state) => state.priceMin)
  const priceMax = useFilterStore((state) => state.priceMax)
  const amenities = useFilterStore((state) => state.amenities)

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

  const { data: cities, isLoading: isCitiesLoading } = useCities()

  // Premier popular wedding destination hubs (top 3-4 main cities in priority order)
  const PREFERRED_POPULAR_SLUGS = ['kochi', 'trivandrum', 'kozhikode', 'thrissur']

  const popularCities = useMemo(() => {
    if (!cities) return []
    const preferred = PREFERRED_POPULAR_SLUGS.map((slug) =>
      cities.find((c) => c.slug.toLowerCase() === slug.toLowerCase())
    ).filter(Boolean) as typeof cities

    if (preferred.length < 4) {
      const remaining = cities.filter((c) => !preferred.some((p) => p.id === c.id))
      preferred.push(...remaining.slice(0, 4 - preferred.length))
    }
    return preferred.slice(0, 4)
  }, [cities])

  const [searchQuery, setSearchQuery] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Fetch auditoriums filtered by selected city and filter store
  const {
    data: auditoriums,
    isLoading,
    isError,
    refetch,
  } = useAuditoriums(selectedCity?.slug, filterParams)

  // Filter client-side by hero search term if present
  const displayedAuditoriums = useMemo(() => {
    if (!auditoriums) return []
    const term = searchQuery.trim().toLowerCase()
    if (!term) return auditoriums

    return auditoriums.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(term)
      const matchAddress = item.address?.toLowerCase().includes(term)
      const matchCity = item.cities?.name?.toLowerCase().includes(term)
      const matchAmenities = item.amenities?.some((a) =>
        a.toLowerCase().includes(term)
      )
      return matchTitle || matchAddress || matchCity || matchAmenities
    })
  }, [auditoriums, searchQuery])

  // GSAP: Hero text animation on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-animate', {
        y: 35,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  // Smooth entrance for auditorium cards when loaded
  useEffect(() => {
    if (isLoading || displayedAuditoriums.length === 0) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.auditorium-card',
        { opacity: 0, y: 25 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.06,
          duration: 0.45,
          ease: 'power2.out',
          clearProps: 'all',
        }
      )
    }, gridRef)

    return () => ctx.revert()
  }, [displayedAuditoriums.length, isLoading, selectedCity?.slug])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    const citySlug = selectedCity?.slug ?? 'kochi'
    if (trimmed) {
      navigate(`/city/${citySlug}?q=${encodeURIComponent(trimmed)}`)
    }
  }

  return (
    <Layout>
      {/* SECTION 1: HERO BANNER */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-brand-dark/50 backdrop-blur-xs text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8"
      >
        {/* Subtle background decorative shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-secondary blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-green-500 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <h1
            className="hero-animate text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.06em] sm:tracking-[0.12em] uppercase drop-shadow-md whitespace-normal sm:whitespace-nowrap bg-gradient-to-r from-[#C8901F] via-[#E0B12D] to-[#C8901F] bg-clip-text text-transparent"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Grand Venues for Your Big Days
          </h1>

          <p className="hero-animate text-base sm:text-lg text-green-100/90 max-w-2xl mx-auto font-light">
            Discover verified auditoriums, convention centres, and luxury wedding
            halls across Kerala with real-time pricing and availability.
          </p>

          {/* Centered Search Bar */}
          <div className="hero-animate max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center shadow-2xl rounded-full overflow-hidden bg-brand-dark/85 backdrop-blur-md border border-green-700/40 p-1.5 focus-within:ring-4 focus-within:ring-brand-secondary/40 transition-all"
            >
              <div className="pl-3 sm:pl-4 text-brand-secondary">
                <Search className="w-5 h-5 text-brand-secondary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues by name, landmark, or amenities..."
                className="w-full px-3 py-2 text-sm sm:text-base text-green-50 bg-transparent focus:outline-none placeholder-green-300/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-1 text-green-400 hover:text-green-200 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 px-4 sm:px-6 py-2.5 rounded-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Search</span>
                <ChevronRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </form>
          </div>

          {/* Quick City Selector Chips - Top 3-4 Premier Main Cities */}
          <div className="hero-animate pt-3">
            <p className="text-xs uppercase tracking-wider text-brand-secondary mb-2 font-semibold">
              Popular Cities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => clearCity()}
                className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  !selectedCity
                    ? 'bg-gradient-to-r from-[#C8901F] via-[#E0B12D] to-[#C8901F] text-brand-dark font-bold shadow-md scale-105 border border-[#D8A629]/70'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                All Kerala
              </button>

              {!isCitiesLoading &&
                popularCities.map((city) => {
                  const isSelected = selectedCity?.id === city.id || selectedCity?.slug === city.slug
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() =>
                        setCity({
                          id: city.id,
                          name: city.name,
                          slug: city.slug,
                        })
                      }
                      className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#C8901F] via-[#E0B12D] to-[#C8901F] text-brand-dark font-bold shadow-md scale-105 border border-[#D8A629]/70'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {city.name}
                    </button>
                  )
                })}

              {/* If selected city is outside the top 4 popular cities, display it as selected */}
              {selectedCity && !popularCities.some((c) => c.slug === selectedCity.slug || c.id === selectedCity.id) && (
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all bg-gradient-to-r from-[#C8901F] via-[#E0B12D] to-[#C8901F] text-brand-dark shadow-md scale-105 border border-[#D8A629]/70"
                >
                  {selectedCity.name}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SCROLL-ANIMATED TICKER & EDITORIAL REVEAL SECTION */}
      <ScrollAnimatedSection />

      {/* SECTION 2 & 3: FEED & GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-green-800/40 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {selectedCity ? `Venues in ${selectedCity.name}` : 'All Venues in Kerala'}
              </h2>
              {!isLoading && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-900/40 text-brand-secondary border border-green-700/40">
                  {displayedAuditoriums.length}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-green-200/70 mt-1">
              {selectedCity
                ? `Showing curated auditoriums in ${selectedCity.name}`
                : 'Showing all verified wedding auditoriums across cities'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-green-100 bg-green-900/40 border border-green-700/40 hover:bg-green-800/50 hover:text-brand-secondary transition-all shadow-xs"
            >
              <MapPin className="w-4 h-4 text-brand-secondary" />
              <span>{selectedCity ? 'Change City' : 'Select City'}</span>
            </button>
          </div>
        </div>

        {/* FEED GRID / STATES */}
        <div ref={gridRef}>
          {/* Loading Skeleton */}
          {isLoading && <AuditoriumCardSkeletonList count={6} />}

          {/* Error State */}
          {isError && (
            <div className="text-center py-16 bg-brand-dark/90 backdrop-blur-md rounded-2xl border border-red-900/40 shadow-xl max-w-lg mx-auto p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-red-200">
                Failed to load auditoriums
              </h3>
              <p className="text-sm text-red-300/70">
                We encountered an issue fetching venues. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold text-sm transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && displayedAuditoriums.length === 0 && (
            <div className="text-center py-16 bg-brand-dark/90 backdrop-blur-md rounded-2xl border border-green-800/40 shadow-xl max-w-lg mx-auto p-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-900/40 text-brand-secondary mx-auto flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">
                No venues found {selectedCity ? `in ${selectedCity.name}` : ''}
              </h3>
              <p className="text-sm text-green-200/70 max-w-sm mx-auto">
                {searchQuery
                  ? `No venues match the query "${searchQuery}". Try a different keyword or clear the search.`
                  : 'We could not find any active venues matching your criteria in this city.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-green-100 bg-green-900/40 hover:bg-green-800/60 border border-green-700/40 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => clearCity()}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-brand-dark bg-brand-secondary hover:bg-brand-secondary/90 transition-colors shadow-sm"
                  >
                    View All Cities
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-brand-secondary bg-green-950/80 hover:bg-green-900/60 transition-colors border border-green-700/50"
                >
                  Switch City
                </button>
              </div>
            </div>
          )}

          {/* Cards Grid */}
          {!isLoading && !isError && displayedAuditoriums.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedAuditoriums.map((auditorium) => (
                <AuditoriumCard key={auditorium.id} auditorium={auditorium} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </Layout>
  )
}
