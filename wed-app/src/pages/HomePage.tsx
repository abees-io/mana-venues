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
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCities } from '../hooks/useCities'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const navigate = useNavigate()
  const { selectedCity, setCity, clearCity } = useCityStore()
  const filters = useFilterStore()
  const { data: cities, isLoading: isCitiesLoading } = useCities()

  const [searchQuery, setSearchQuery] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const {
    data: auditoriums,
    isLoading,
    isError,
    refetch,
  } = useAuditoriums(selectedCity?.slug, filters)

  const displayedAuditoriums = useMemo(() => {
    if (!auditoriums) return []
    const term = searchQuery.trim().toLowerCase()
    if (!term) return auditoriums
    return auditoriums.filter((item) => {
      const matchTitle = item.title?.toLowerCase().includes(term)
      const matchAddress = item.address?.toLowerCase().includes(term)
      const matchCity = item.cities?.name?.toLowerCase().includes(term)
      const matchAmenities = item.amenities?.some((a) => a.toLowerCase().includes(term))
      return matchTitle || matchAddress || matchCity || matchAmenities
    })
  }, [auditoriums, searchQuery])

  // Hero entrance animation only — no parallax/scroll effects
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' })
      gsap.from('.hero-title-anim', { y: 30, opacity: 0, duration: 0.9, delay: 0.15, ease: 'power3.out' })
      gsap.from('.hero-subtitle-anim', { y: 20, opacity: 0, duration: 0.7, delay: 0.3, ease: 'power2.out' })
      gsap.from('.hero-search-anim', { y: 18, opacity: 0, duration: 0.7, delay: 0.45, ease: 'power2.out' })
      gsap.from('.hero-chip', { y: 10, opacity: 0, duration: 0.5, delay: 0.6, stagger: 0.04, ease: 'power2.out' })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Card grid entrance
  useEffect(() => {
    if (isLoading || displayedAuditoriums.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.auditorium-card', {
        opacity: 0,
        y: 30,
        stagger: 0.07,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
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
      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative bg-brand-dark text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Minimal gold accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-secondary to-transparent opacity-60" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          {/* Eyebrow label */}
          <p
            className="hero-eyebrow text-[10px] sm:text-xs uppercase tracking-[0.3em] text-brand-secondary font-medium"
          >
            Kerala's Premier Venue Discovery
          </p>

          {/* Main heading */}
          <h1
            className="hero-title-anim text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-[0.06em] sm:tracking-[0.1em] text-white leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Grand Venues for{' '}
            <span className="text-brand-secondary">Your Big Days</span>
          </h1>

          {/* Thin gold divider */}
          <div className="flex items-center justify-center gap-4">
            <span className="block h-px w-12 bg-brand-secondary/40" />
            <span className="text-brand-secondary text-xs">✦</span>
            <span className="block h-px w-12 bg-brand-secondary/40" />
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle-anim text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            Verified auditoriums, convention centres & luxury wedding halls
            across Kerala — with real-time pricing and instant booking.
          </p>

          {/* Search Bar */}
          <div className="hero-search-anim max-w-xl mx-auto pt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center bg-white/5 border border-white/10 focus-within:border-brand-secondary/60 focus-within:bg-white/8 transition-all"
            >
              <div className="pl-4 text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, landmark, amenities..."
                className="w-full px-3 py-3.5 text-sm text-white bg-transparent focus:outline-none placeholder-neutral-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-2 text-neutral-500 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 px-5 py-3.5 bg-brand-secondary hover:bg-brand-gold-dark text-brand-dark font-semibold text-xs tracking-widest uppercase transition-colors flex items-center gap-1.5"
              >
                <span>Search</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* City Chips */}
          <div className="pt-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 mb-3 font-medium">
              Popular Cities
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => clearCity()}
                className={`hero-chip px-4 py-1.5 text-xs font-medium tracking-wider uppercase transition-all ${
                  !selectedCity
                    ? 'bg-brand-secondary text-brand-dark'
                    : 'border border-white/20 text-neutral-400 hover:border-brand-secondary/60 hover:text-white'
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
                      onClick={() => setCity({ id: city.id, name: city.name, slug: city.slug })}
                      className={`hero-chip px-4 py-1.5 text-xs font-medium tracking-wider uppercase transition-all ${
                        isSelected
                          ? 'bg-brand-secondary text-brand-dark'
                          : 'border border-white/20 text-neutral-400 hover:border-brand-secondary/60 hover:text-white'
                      }`}
                    >
                      {city.name}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-secondary to-transparent opacity-30" />
      </section>

      {/* ── VENUE FEED ───────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 mb-10 border-b border-neutral-100">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-secondary font-medium mb-2">
              {selectedCity ? `Venues in ${selectedCity.name}` : 'All Kerala'}
            </p>
            <h2
              className="text-2xl sm:text-3xl font-semibold text-brand-dark tracking-tight"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {selectedCity ? selectedCity.name : 'All Venues'}
              {!isLoading && (
                <span className="ml-3 text-base font-normal text-neutral-400">
                  ({displayedAuditoriums.length})
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5 font-light">
              {selectedCity
                ? `Curated wedding spaces in ${selectedCity.name}`
                : 'Verified wedding venues across Kerala'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-500 border border-neutral-200 hover:border-brand-secondary hover:text-brand-secondary transition-colors self-start sm:self-auto"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{selectedCity ? 'Change City' : 'Select City'}</span>
          </button>
        </div>

        {/* Grid / States */}
        <div ref={gridRef}>
          {isLoading && <AuditoriumCardSkeletonList count={6} />}

          {isError && (
            <div className="text-center py-20 max-w-sm mx-auto space-y-4">
              <div className="w-10 h-10 border border-red-200 text-red-400 mx-auto flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-brand-dark">Failed to load venues</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                We encountered an issue. Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark hover:bg-brand-secondary text-white hover:text-brand-dark text-xs font-medium tracking-wider uppercase transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {!isLoading && !isError && displayedAuditoriums.length === 0 && (
            <div className="text-center py-20 max-w-sm mx-auto space-y-4">
              <div className="w-10 h-10 border border-neutral-200 text-neutral-400 mx-auto flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-brand-dark">
                No venues found{selectedCity ? ` in ${selectedCity.name}` : ''}
              </h3>
              <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                {searchQuery
                  ? `No results for "${searchQuery}". Try a different keyword.`
                  : 'No active venues match your criteria in this location.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 text-xs font-medium text-neutral-600 border border-neutral-200 hover:border-brand-secondary transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => clearCity()}
                    className="px-4 py-2 text-xs font-medium text-white bg-brand-dark hover:bg-brand-secondary hover:text-brand-dark transition-colors"
                  >
                    View All Cities
                  </button>
                )}
              </div>
            </div>
          )}

          {!isLoading && !isError && displayedAuditoriums.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {displayedAuditoriums.map((auditorium) => (
                <AuditoriumCard key={auditorium.id} auditorium={auditorium} />
              ))}
            </div>
          )}
        </div>
      </section>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </Layout>
  )
}
