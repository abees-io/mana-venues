import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import {
  MapPin,
  Search,
  RefreshCw,
  Sparkles,
  X,
  Building2,
  ChevronRight,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import AuditoriumCard from '../components/cards/AuditoriumCard'
import { AuditoriumCardSkeletonList } from '../components/cards/AuditoriumCardSkeleton'
import LocationModal from '../components/modals/LocationModal'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCities } from '../hooks/useCities'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

export default function HomePage() {
  const navigate = useNavigate()
  const { selectedCity, setCity, clearCity } = useCityStore()
  const filters = useFilterStore()
  const { data: cities, isLoading: isCitiesLoading } = useCities()

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
  } = useAuditoriums(selectedCity?.slug, filters)

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

  // GSAP: Card grid entrance animation on data update
  useEffect(() => {
    if (isLoading || displayedAuditoriums.length === 0) return

    const ctx = gsap.context(() => {
      gsap.from('.auditorium-card', {
        opacity: 0,
        y: 30,
        stagger: 0.08,
        duration: 0.5,
        ease: 'power2.out',
      })
    }, gridRef)

    return () => ctx.revert()
  }, [displayedAuditoriums, isLoading, selectedCity])

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
        className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#6f153a] to-brand-dark text-white py-14 sm:py-20 px-4 sm:px-6 lg:px-8 shadow-inner"
      >
        {/* Subtle background decorative shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-secondary blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="hero-animate inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-pink-100">
            <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Kerala's Premier Wedding Hall Discovery</span>
          </div>

          <h1 className="hero-animate flex flex-col items-center justify-center space-y-1">
            <span
              className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.12em] text-white uppercase drop-shadow-md"
              style={{ fontFamily: "'Cinzel', 'Playfair Display', serif" }}
            >
              Grand Venues for Your
            </span>
            <span
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-brand-secondary font-normal drop-shadow-[0_4px_24px_rgba(212,175,55,0.45)] leading-tight pt-1"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Big Days
            </span>
          </h1>

          <p className="hero-animate text-base sm:text-lg text-pink-100/90 max-w-2xl mx-auto font-light">
            Discover verified auditoriums, convention centres, and luxury wedding
            halls across Kerala with real-time pricing and availability.
          </p>

          {/* Centered Search Bar */}
          <div className="hero-animate max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center shadow-2xl rounded-full overflow-hidden bg-white p-1.5 focus-within:ring-4 focus-within:ring-brand-secondary/40 transition-all"
            >
              <div className="pl-3 sm:pl-4 text-gray-400">
                <Search className="w-5 h-5 text-brand-primary" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search venues by name, landmark, or amenities..."
                className="w-full px-3 py-2 text-sm sm:text-base text-brand-dark bg-transparent focus:outline-none placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded-full"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 px-4 sm:px-6 py-2.5 rounded-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Search</span>
                <ChevronRight className="w-4 h-4 hidden sm:inline" />
              </button>
            </form>
          </div>

          {/* Quick City Selector Chips */}
          <div className="hero-animate pt-3">
            <p className="text-xs uppercase tracking-wider text-pink-200/80 mb-2 font-medium">
              Popular Cities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => clearCity()}
                className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  !selectedCity
                    ? 'bg-brand-secondary text-brand-dark font-bold shadow-md scale-105'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                }`}
              >
                All Kerala
              </button>

              {!isCitiesLoading &&
                cities?.map((city) => {
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
                      className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-brand-secondary text-brand-dark font-bold shadow-md scale-105'
                          : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
                      }`}
                    >
                      {city.name}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 & 3: FEED & GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/70 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
                {selectedCity ? `Venues in ${selectedCity.name}` : 'All Venues in Kerala'}
              </h2>
              {!isLoading && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-brand-accent text-brand-primary border border-brand-primary/20">
                  {displayedAuditoriums.length}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-brand-primary bg-white border border-brand-primary/30 hover:bg-brand-accent hover:border-brand-primary transition-all shadow-xs"
            >
              <MapPin className="w-4 h-4 text-brand-primary" />
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
            <div className="text-center py-16 bg-white rounded-2xl border border-red-100 shadow-xs max-w-lg mx-auto p-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 mx-auto flex items-center justify-center">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                Failed to load auditoriums
              </h3>
              <p className="text-sm text-gray-500">
                We encountered an issue fetching venues. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-primary/90 text-white font-medium text-sm transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && displayedAuditoriums.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-xs max-w-lg mx-auto p-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-brand-accent text-brand-primary mx-auto flex items-center justify-center">
                <Building2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-brand-dark">
                No venues found {selectedCity ? `in ${selectedCity.name}` : ''}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                {searchQuery
                  ? `No venues match the query "${searchQuery}". Try a different keyword or clear the search.`
                  : 'We could not find any active venues matching your criteria in this city.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-brand-dark bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => clearCity()}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors shadow-sm"
                  >
                    View All Cities
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-brand-primary bg-brand-accent hover:bg-pink-100 transition-colors border border-brand-primary/20"
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
