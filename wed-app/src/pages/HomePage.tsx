import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin, Search, RefreshCw, X, Building2, ChevronRight } from 'lucide-react'
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
  const filters = useFilterStore()
  const { data: cities, isLoading: isCitiesLoading } = useCities()

  const [searchQuery, setSearchQuery] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const { data: auditoriums, isLoading, isError, refetch } = useAuditoriums(selectedCity?.slug, filters)

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

  // Hero entrance — subtle, no parallax
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.hero-eyebrow', { y: 14, opacity: 0, duration: 0.65, ease: 'power3.out' })
      gsap.from('.hero-title-anim', { y: 28, opacity: 0, duration: 0.85, delay: 0.12, ease: 'power3.out' })
      gsap.from('.hero-divider', { scaleX: 0, opacity: 0, duration: 0.6, delay: 0.28, ease: 'power2.out', transformOrigin: 'center' })
      gsap.from('.hero-subtitle-anim', { y: 18, opacity: 0, duration: 0.65, delay: 0.35, ease: 'power2.out' })
      gsap.from('.hero-search-anim', { y: 16, opacity: 0, duration: 0.6, delay: 0.48, ease: 'power2.out' })
      gsap.from('.hero-chip', { y: 10, opacity: 0, duration: 0.45, delay: 0.62, stagger: 0.045, ease: 'power2.out' })
    }, heroRef)
    return () => ctx.revert()
  }, [])

  // Card grid entrance
  useEffect(() => {
    if (isLoading || displayedAuditoriums.length === 0) return
    const ctx = gsap.context(() => {
      gsap.from('.auditorium-card', {
        opacity: 0,
        y: 24,
        stagger: 0.065,
        duration: 0.5,
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
    if (trimmed) navigate(`/city/${citySlug}?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <Layout>
      {/* HERO */}
      <section ref={heroRef} className="relative bg-brand-dark text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8">
        {/* Single hairline gold rule at top */}
        <div className="absolute top-0 left-0 right-0 h-px bg-brand-secondary opacity-40" />

        <div className="relative max-w-3xl mx-auto text-center space-y-5">
          {/* Eyebrow */}
          <p className="hero-eyebrow text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-brand-secondary font-medium">
            Kerala's Premier Venue Discovery
          </p>

          {/* Heading */}
          <h1
            className="hero-title-anim text-3xl sm:text-4xl md:text-5xl font-semibold tracking-[0.05em] text-white leading-tight"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Grand Venues for{' '}
            <span className="text-brand-secondary">Your Big Days</span>
          </h1>

          {/* Hairline divider */}
          <div className="hero-divider flex items-center justify-center gap-3 py-1">
            <span className="block h-px w-10 bg-brand-secondary/35" />
            <span className="block w-1 h-1 bg-brand-secondary/60" />
            <span className="block h-px w-10 bg-brand-secondary/35" />
          </div>

          {/* Subtitle */}
          <p className="hero-subtitle-anim text-sm text-neutral-400 max-w-lg mx-auto font-light leading-loose">
            Verified auditoriums, convention centres and luxury wedding halls
            across Kerala with transparent pricing and real-time availability.
          </p>

          {/* Search */}
          <div className="hero-search-anim max-w-xl mx-auto pt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-stretch border border-white/10 hover:border-white/20 focus-within:border-brand-secondary/50 transition-colors"
            >
              <div className="flex items-center pl-4 text-neutral-500 bg-white/5">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, landmark, or amenity..."
                className="w-full px-3 py-3.5 text-sm text-white bg-white/5 focus:outline-none placeholder-neutral-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear"
                  className="px-3 text-neutral-500 hover:text-neutral-300 bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="shrink-0 px-5 py-3.5 bg-brand-secondary hover:bg-brand-gold-dark text-brand-dark font-semibold text-xs tracking-widest uppercase transition-colors flex items-center gap-1.5"
              >
                Search
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* City Chips */}
          <div className="pt-2 space-y-2.5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-600 font-medium">
              Browse by City
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => clearCity()}
                className={`hero-chip px-4 py-1.5 text-[11px] font-medium tracking-wider uppercase border transition-colors ${
                  !selectedCity
                    ? 'bg-brand-secondary border-brand-secondary text-brand-dark'
                    : 'border-white/15 text-neutral-500 hover:border-brand-secondary/50 hover:text-white'
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
                      className={`hero-chip px-4 py-1.5 text-[11px] font-medium tracking-wider uppercase border transition-colors ${
                        isSelected
                          ? 'bg-brand-secondary border-brand-secondary text-brand-dark'
                          : 'border-white/15 text-neutral-500 hover:border-brand-secondary/50 hover:text-white'
                      }`}
                    >
                      {city.name}
                    </button>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Bottom hairline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-brand-secondary opacity-20" />
      </section>

      {/* SCROLL ANIMATED EDITORIAL SECTION */}
      <ScrollAnimatedSection />

      {/* VENUE FEED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Feed header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-5 border-b border-neutral-100">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-brand-secondary font-medium mb-1.5">
              {selectedCity ? `Venues in ${selectedCity.name}` : 'All Kerala'}
            </p>
            <h2
              className="text-xl sm:text-2xl font-semibold text-brand-dark tracking-wide"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {selectedCity ? selectedCity.name : 'All Venues'}
              {!isLoading && (
                <span className="ml-2.5 text-sm font-normal text-neutral-400">
                  ({displayedAuditoriums.length})
                </span>
              )}
            </h2>
            <p className="text-xs text-neutral-400 mt-1 font-light">
              {selectedCity
                ? `Curated wedding spaces in ${selectedCity.name}`
                : 'Verified wedding venues across Kerala'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-medium text-neutral-500 border border-neutral-200 hover:border-brand-secondary hover:text-brand-secondary transition-colors self-start sm:self-auto shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            {selectedCity ? 'Change City' : 'Select City'}
          </button>
        </div>

        {/* Grid / States */}
        <div ref={gridRef}>
          {isLoading && <AuditoriumCardSkeletonList count={6} />}

          {isError && (
            <div className="text-center py-20 max-w-sm mx-auto space-y-4">
              <div className="w-10 h-10 border border-red-200 text-red-400 mx-auto flex items-center justify-center">
                <RefreshCw className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-brand-dark">Failed to load venues</h3>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-dark hover:bg-brand-secondary text-white hover:text-brand-dark text-[11px] font-medium tracking-widest uppercase transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && displayedAuditoriums.length === 0 && (
            <div className="text-center py-20 max-w-sm mx-auto space-y-4">
              <div className="w-10 h-10 border border-neutral-200 text-neutral-400 mx-auto flex items-center justify-center">
                <Building2 className="w-4 h-4" />
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
                    className="px-4 py-2 text-[11px] font-medium text-neutral-600 border border-neutral-200 hover:border-brand-secondary transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                {selectedCity && (
                  <button
                    type="button"
                    onClick={() => clearCity()}
                    className="px-4 py-2 text-[11px] font-medium text-white bg-brand-dark hover:bg-brand-secondary hover:text-brand-dark transition-colors"
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

      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} />
    </Layout>
  )
}
