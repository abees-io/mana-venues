import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  MapPin,
  Search,
  RefreshCw,
  X,
  Building2,
  ChevronRight,
  Sparkles,
  Package,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import AuditoriumCard from '../components/cards/AuditoriumCard'
import { AuditoriumCardSkeletonList } from '../components/cards/AuditoriumCardSkeleton'
import LocationModal from '../components/modals/LocationModal'
import ScrollAnimatedSection from '../components/home/ScrollAnimatedSection'
import StackedDestinationImages from '../components/home/StackedDestinationImages'
import { WEDDING_PACKAGES } from './PackagesPage'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCities } from '../hooks/useCities'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

gsap.registerPlugin(ScrollTrigger)

// Haversine formula to calculate distance in km between two GPS coordinates
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function HomePage() {
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

  // Premier popular wedding destination hubs
  const PREFERRED_POPULAR_SLUGS = ['palakkad', 'kochi', 'kozhikode', 'thrissur']

  const popularCities = useMemo(() => {
    if (!cities) return []
    const valid = cities.filter(
      (c) => c.slug.toLowerCase() !== 'all-kerala' && c.name.toLowerCase() !== 'all kerala'
    )
    const preferred = PREFERRED_POPULAR_SLUGS.map((slug) =>
      valid.find((c) => c.slug.toLowerCase() === slug.toLowerCase() || c.name.toLowerCase().includes(slug))
    ).filter(Boolean) as typeof cities

    if (preferred.length < 4) {
      const remaining = valid.filter((c) => !preferred.some((p) => p.id === c.id))
      preferred.push(...remaining.slice(0, 4 - preferred.length))
    }
    return preferred.slice(0, 4)
  }, [cities])

  const [searchQuery, setSearchQuery] = useState('')
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)

  // Near Me Geolocation States
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [isNearMeActive, setIsNearMeActive] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Fetch auditoriums filtered by selected city and filter store
  const {
    data: auditoriums,
    isLoading,
    isError,
    refetch,
  } = useAuditoriums(isNearMeActive ? null : selectedCity?.slug, filterParams)

  // Handle clicking the "Near Me" button
  const handleNearMeClick = () => {
    if (isNearMeActive) {
      setIsNearMeActive(false)
      return
    }

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    setLocationError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserCoords(coords)
        setIsNearMeActive(true)
        setIsLocating(false)
        clearCity()
      },
      (err) => {
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Please allow location access in your browser.')
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setLocationError('Location position is unavailable.')
        } else if (err.code === err.TIMEOUT) {
          setLocationError('Location request timed out. Please try again.')
        } else {
          setLocationError('Could not retrieve your location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  const handleClearNearMe = () => {
    setIsNearMeActive(false)
    setLocationError(null)
  }

  // Filter client-side by search term and sort by proximity if Near Me is active
  const displayedAuditoriums = useMemo(() => {
    if (!auditoriums) return []
    const term = searchQuery.trim().toLowerCase()

    let list = auditoriums
    if (term) {
      list = list.filter((item) => {
        const matchTitle = (item.title || item.name || '').toLowerCase().includes(term)
        const matchAddress = (item.address || '').toLowerCase().includes(term)
        const matchCity = (item.city || item.cities?.name || item.district || '').toLowerCase().includes(term)
        const matchAmenities = item.amenities?.some((a) =>
          a.toLowerCase().includes(term)
        )
        return matchTitle || matchAddress || matchCity || matchAmenities
      })
    }

    // Attach distance & sort closest first if Near Me is active
    if (isNearMeActive && userCoords) {
      return list
        .map((venue) => {
          let dist: number | null = null
          if (venue.latitude && venue.longitude) {
            dist = calculateDistanceKm(
              userCoords.lat,
              userCoords.lng,
              Number(venue.latitude),
              Number(venue.longitude)
            )
          }
          return { ...venue, distanceKm: dist }
        })
        .sort((a, b) => {
          if (a.distanceKm === null && b.distanceKm === null) return 0
          if (a.distanceKm === null) return 1
          if (b.distanceKm === null) return -1
          return a.distanceKm - b.distanceKm
        })
    }

    return list
  }, [auditoriums, searchQuery, isNearMeActive, userCoords])

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
  }, [displayedAuditoriums.length, isLoading, selectedCity?.slug, isNearMeActive])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <Layout>
      {/* SECTION 1: HERO */}
      <section
        ref={heroRef}
        className="relative overflow-hidden bg-brand-dark/60 backdrop-blur-xs text-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 border-b border-green-950/40"
      >
        {/* Subtle background decorative shapes */}
        <div className="absolute inset-0 pointer-events-none opacity-15">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-secondary/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* LEFT COLUMN: Destination Wedding & Venue Content (Left-Aligned) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Kerala Destination Wedding Badge */}
              <div className="hero-animate inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-brand-secondary/40 text-xs font-semibold text-brand-secondary shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                <span className="tracking-wide">Bespoke Destination Weddings in God’s Own Country</span>
              </div>

              {/* Exact Main Heading */}
              <h1
                className="hero-animate text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold tracking-[0.03em] uppercase py-1 leading-[1.15] bg-[linear-gradient(135deg,#FFAE00_0%,#F9E866_100%)] bg-clip-text text-transparent drop-shadow-md text-left"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                GRAND VENUES FOR YOUR BIG DAYS
              </h1>

              {/* Exact Description text with bold modern font style aligned to left */}
              <p className="hero-animate font-sans font-semibold sm:font-bold text-base sm:text-lg lg:text-[1.125rem] text-emerald-50/95 leading-relaxed tracking-tight sm:tracking-normal text-left max-w-2xl border-l-2 border-brand-secondary/70 pl-4">
                Your celebration deserves the warmth and safety of home. Explore verified venues and bespoke destination wedding packages across God's Own Country, thoughtfully designed to honor Kerala’s rich cultural tapestry while keeping you in expert, caring hands
              </p>

              {/* Search Bar + Action CTAs */}
              <div className="hero-animate max-w-2xl pt-1 space-y-3">
                <form
                  onSubmit={handleSearchSubmit}
                  className="relative flex items-center shadow-2xl rounded-full overflow-hidden bg-brand-dark/90 backdrop-blur-md border border-green-700/50 p-1.5 focus-within:ring-4 focus-within:ring-brand-secondary/40 transition-all"
                >
                  <div className="pl-3 sm:pl-4 text-brand-secondary">
                    <Search className="w-5 h-5 text-brand-secondary" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search venues by name, landmark, or amenities..."
                    aria-label="Search venues"
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

                {/* Explore Destination Packages & Venues CTAs */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <Link
                    to="/packages"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-brand-secondary via-amber-400 to-brand-secondary text-brand-dark font-bold text-xs sm:text-sm shadow-lg hover:shadow-brand-secondary/20 hover:scale-[1.02] transition-all"
                  >
                    <Package className="w-4 h-4" />
                    <span>Explore Wedding Packages</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      if (gridRef.current) {
                        gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-100 border border-emerald-700/50 font-semibold text-xs sm:text-sm transition-all"
                  >
                    <Building2 className="w-4 h-4 text-brand-secondary" />
                    <span>Browse Venues</span>
                  </button>
                </div>
              </div>

              {/* Quick City Selector Chips (Left-aligned) */}
              <div className="hero-animate pt-2 text-left">
                <p className="text-xs uppercase tracking-wider text-brand-secondary mb-2 font-semibold">
                  Popular Kerala Locations
                </p>
                <div className="flex flex-wrap items-center justify-start gap-2">
                  {!isCitiesLoading &&
                    popularCities.map((city) => {
                      const isSelected = !isNearMeActive && (selectedCity?.id === city.id || selectedCity?.slug === city.slug)
                      return (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => {
                            setIsNearMeActive(false)
                            setCity({
                              id: city.id,
                              name: city.name,
                              slug: city.slug,
                            })
                          }}
                          className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
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
                  {!isNearMeActive && selectedCity && !popularCities.some((c) => c.slug === selectedCity.slug || c.id === selectedCity.id) && (
                    <button
                      type="button"
                      className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all bg-gradient-to-r from-[#C8901F] via-[#E0B12D] to-[#C8901F] text-brand-dark shadow-md scale-105 border border-[#D8A629]/70"
                    >
                      {selectedCity.name}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stacked Destination Wedding Image Animation */}
            <div className="lg:col-span-5 hero-animate w-full flex items-center justify-center lg:justify-end pt-4 lg:pt-0">
              <StackedDestinationImages />
            </div>
          </div>
        </div>
      </section>

      {/* SCROLL-ANIMATED TICKER & EDITORIAL REVEAL SECTION */}
      <ScrollAnimatedSection />

      {/* SECTION: DESTINATION WEDDING PACKAGES SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-green-900/40">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div className="text-left space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-secondary">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Destination Plans</span>
            </div>
            <h2
              className="text-2xl sm:text-3xl font-extrabold text-white tracking-wide uppercase"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Kerala Destination Packages
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200/80 max-w-2xl">
              From backwater serenity to misty tea-clad hills, connect with verified planners offering complete celebration arrangements.
            </p>
          </div>

          <Link
            to="/packages"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-secondary hover:text-white transition-colors group shrink-0"
          >
            <span>View All Packages</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 3-4 Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEDDING_PACKAGES.slice(0, 3).map((pkg) => (
            <Link
              key={pkg.id}
              to="/packages"
              className="group block rounded-xl overflow-hidden bg-brand-dark/85 backdrop-blur-md border border-green-800/40 shadow-xl hover:border-brand-secondary/60 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-brand-dark">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/30 to-transparent" />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-brand-dark/80 backdrop-blur-md border border-brand-secondary/40 text-[11px] font-semibold text-brand-secondary">
                  {pkg.backdrop}
                </div>
                <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded bg-brand-dark/90 backdrop-blur-md border border-emerald-700/50 text-right">
                  <span className="block text-[9px] uppercase tracking-wider text-emerald-300">From</span>
                  <span className="text-sm font-extrabold text-brand-secondary">{pkg.startingPrice}</span>
                </div>
              </div>

              <div className="p-4 space-y-2 text-left">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300/90 font-medium">
                  <MapPin className="w-3 h-3 text-brand-secondary shrink-0" />
                  <span className="truncate">{pkg.location}</span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-brand-secondary transition-colors line-clamp-1">
                  {pkg.title}
                </h3>

                <p className="text-xs text-gray-300/80 line-clamp-2 leading-relaxed">
                  {pkg.tagline}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-brand-secondary">
                  <span>Explore Inclusions</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 2 & 3: FEED & GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-green-800/40 mb-8">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {isNearMeActive
                  ? 'Venues Near You'
                  : selectedCity
                  ? `Venues in ${selectedCity.name}`
                  : 'Wedding Venues in Kerala'}
              </h2>
              {!isLoading && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-900/40 text-brand-secondary border border-green-700/40">
                  {displayedAuditoriums.length}
                </span>
              )}
            </div>

            {/* Sub-heading */}
            <p className="text-xs sm:text-sm text-green-200/70 mt-1">
              {isNearMeActive
                ? 'Showing curated auditoriums closest to your current location (sorted by proximity)'
                : selectedCity
                ? `Showing curated auditoriums in ${selectedCity.name}`
                : 'Showing verified wedding auditoriums across Kerala'}
              {searchQuery ? ` matching "${searchQuery}"` : ''}
            </p>

            {/* WORKING NEAR ME BUTTON UNDER SUB-HEADING */}
            <div className="flex items-center gap-2.5 mt-3 flex-wrap">
              <button
                type="button"
                onClick={handleNearMeClick}
                disabled={isLocating}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isNearMeActive
                    ? 'bg-brand-secondary text-brand-dark ring-2 ring-brand-secondary/70 shadow-md scale-105'
                    : 'bg-green-900/50 hover:bg-green-800/70 text-green-100 hover:text-brand-secondary border border-green-700/60'
                }`}
              >
                <MapPin
                  className={`w-3.5 h-3.5 ${isNearMeActive ? 'fill-current' : ''}`}
                />
                <span>
                  {isLocating
                    ? 'Detecting Location...'
                    : isNearMeActive
                    ? 'Near Me (Active)'
                    : 'Near Me'}
                </span>
              </button>

              {isNearMeActive && (
                <button
                  type="button"
                  onClick={handleClearNearMe}
                  className="text-xs text-green-300/80 hover:text-white underline transition"
                >
                  Clear Near Me
                </button>
              )}

              {locationError && (
                <span className="text-xs text-amber-300 bg-amber-950/70 border border-amber-800/60 px-2.5 py-1 rounded-md">
                  {locationError}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-green-100 bg-green-900/40 border border-green-700/40 hover:bg-green-800/50 hover:text-brand-secondary transition-all shadow-xs"
            >
              <MapPin className="w-4 h-4 text-brand-secondary" />
              <span>{selectedCity && !isNearMeActive ? 'Change City' : 'Select City'}</span>
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
                <AuditoriumCard key={auditorium.id || auditorium.slug} auditorium={auditorium} />
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
