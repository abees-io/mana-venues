import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  MapPin,
  RefreshCw,
  Building2,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import AuditoriumCard from '../components/cards/AuditoriumCard'
import { AuditoriumCardSkeletonList } from '../components/cards/AuditoriumCardSkeleton'
import LocationModal from '../components/modals/LocationModal'
import { useAuth } from '../contexts/AuthContext'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'

gsap.registerPlugin(ScrollTrigger)

const CATEGORIES = [
  {
    id: 'heritage',
    title: 'Heritage & Tradition',
    badge: 'Heritage & Tradition',
    image: '/dest-wedding-1.jpg',
    query: 'heritage',
  },
  {
    id: 'lakeside',
    title: 'Lakeside & Backwaters',
    badge: 'Lakeside & Backwaters',
    image: '/category-lakeside.jpg',
    query: 'backwater',
  },
  {
    id: 'beach',
    title: 'Beach & Coastline',
    badge: 'Beach & Coastline',
    image: '/dest-wedding-2.jpg',
    query: 'beach',
  },
  {
    id: 'highland',
    title: 'Highland & Hills',
    badge: 'Highland & Hills',
    image: '/dest-wedding-3.jpg',
    query: 'resort',
  },
] as const

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
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'
  const { selectedCity, clearCity } = useCityStore()

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

  // When selectedCity changes, deactivate Near Me so city filter takes effect immediately
  useEffect(() => {
    if (selectedCity?.slug) {
      setIsNearMeActive(false)
    }
  }, [selectedCity?.slug])

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

  // GSAP: Hero loading entrance & scroll reveal animations
  useEffect(() => {
    let ctx: gsap.Context | null = null
    let hasRevealed = false

    const runReveal = () => {
      if (hasRevealed) return
      hasRevealed = true

      ctx = gsap.context(() => {
        // 1. Hero Card entrance zoom/fade (GPU accelerated for 60/120fps)
        gsap.fromTo(
          '.hero-card-animate',
          { scale: 0.95, opacity: 0, y: 18 },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            duration: 0.85,
            ease: 'power3.out',
            force3D: true,
          }
        )

        // 2. Loading text reveal on heading & subtitle
        gsap.fromTo(
          '.hero-text-reveal',
          { y: 22, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: 0.16,
            stagger: 0.1,
            ease: 'power3.out',
            force3D: true,
          }
        )

        // 3. Explore Categories Title & Cards — ultra-smooth mobile entrance cascade
        gsap.fromTo(
          '.category-title-animate',
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            delay: 0.45,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            force3D: true,
          }
        )

        gsap.fromTo(
          '.category-card-animate',
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            delay: 0.55,
            ease: 'power3.out',
            stagger: 0.08,
            clearProps: 'transform,opacity',
            force3D: true,
          }
        )

        // 5. Fade Scroll Scrub on Editorial Description (preserves inline text colors including gold highlights)
        const words = gsap.utils.toArray<HTMLElement>('.editorial-word')
        if (words.length) {
          gsap.set(words, {
            opacity: 0.18,
            y: 0,
            filter: 'none',
          })
          gsap.to(words, {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: {
              trigger: '.editorial-quote-section',
              start: 'top 82%',
              end: 'bottom 45%',
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          })
        }
      }, heroRef)
    }

    // Trigger reveal as soon as splash intro starts dissolving or finishes
    const handleIntroEnd = () => runReveal()
    window.addEventListener('mana-splash-reveal', handleIntroEnd)
    window.addEventListener('mana-splash-end', handleIntroEnd)

    // Fallback: in case user already bypassed splash or on direct mount
    const timer = setTimeout(runReveal, 2700)

    return () => {
      window.removeEventListener('mana-splash-reveal', handleIntroEnd)
      window.removeEventListener('mana-splash-end', handleIntroEnd)
      clearTimeout(timer)
      if (ctx) ctx.revert()
    }
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

  const handleCategorySelect = (query: string) => {
    if (!isAdmin) {
      navigate('/packages')
      return
    }
    setSearchQuery(query)
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <Layout>


      {/* SECTION 1: HERO & CATEGORIES (Matches User Reference Image) */}
      <section ref={heroRef} className="w-full pt-4 sm:pt-6 pb-4">
        {/* HERO CARD CONTAINER */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="hero-card-animate relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/10] md:aspect-[2.1/1] min-h-[440px] sm:min-h-[460px] shadow-2xl border border-green-800/30 group will-change-[transform,opacity] transform-gpu">
            {/* Background Mandap Image (Exact photo from user reference) */}
            <img
              src="/dest-wedding-1.jpg"
              alt="Grand Venues for Your Big Days"
              className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Vignette Overlay for Crisp Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />

            {/* Centered Hero Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6 sm:p-10 z-10 space-y-3 sm:space-y-4">
              {/* Grand Venues Heading — Top-to-Bottom (180°) Metallic Gold Gradient */}
              <h1
                className="hero-text-reveal text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wide leading-tight bg-gradient-to-b from-[#FFF566] via-[#FFCC00] to-[#FFA000] bg-clip-text text-transparent drop-shadow-sm"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                GRAND VENUES FOR YOUR BIG DAYS
              </h1>

              {/* Subtitle / Description — Matching Hero Title Rush Gold */}
              <p className="hero-text-reveal text-sm sm:text-base md:text-lg font-bold max-w-xl mx-auto drop-shadow-md leading-relaxed bg-gradient-to-r from-[#FFF566] via-[#FFCC00] to-[#FFA000] bg-clip-text text-transparent">
                Explore verified venues & bespoke Kerala wedding packages
              </p>

              {/* CTA Button — Decreased Exposure with Refined Warm Gold Tone */}
              <div className="hero-text-reveal pt-3 sm:pt-5">
                <button
                  type="button"
                  onClick={() => {
                    if (!isAdmin) {
                      navigate('/packages')
                    } else {
                      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }
                  }}
                  className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#EBB522] via-[#DF9F10] to-[#CC8805] hover:from-[#F3BE2D] hover:to-[#D99209] text-brand-dark font-extrabold text-sm sm:text-base shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50 hover:scale-105 active:scale-95 transition-all"
                >
                  {!isAdmin ? 'Explore Packages' : 'Explore Venues'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EXPLORE CATEGORIES SECTION */}
        <div
          onClick={() => {
            if (!isAdmin) navigate('/packages')
          }}
          className={`categories-section max-w-5xl mx-auto px-3 sm:px-6 pt-8 sm:pt-10 ${
            !isAdmin ? 'cursor-pointer' : ''
          }`}
          style={{ perspective: '800px' }}
        >
          <h2
            className="category-title-animate text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#FFF566] via-[#FFCC00] to-[#FFA000] bg-clip-text text-transparent mb-4 sm:mb-5 tracking-wide text-left drop-shadow-sm inline-block"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Explore Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-stretch">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.query)}
                className="category-card-animate group relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg border-0 outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 select-none will-change-[transform,opacity] transform-gpu active:opacity-95"
                style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none" />

                {/* Top Pill Badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white/90 border border-white/10 pointer-events-none">
                  {cat.badge}
                </div>

                {/* Large Bottom Title in Bright Rush Yellow Gradient */}
                <div className="absolute bottom-3 left-2.5 right-2.5 text-center pointer-events-none">
                  <h3
                    className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-[#FFF566] via-[#FFD000] to-[#FFA000] bg-clip-text text-transparent drop-shadow-md tracking-wide leading-tight"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {cat.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* EDITORIAL CULTURAL DESCRIPTION — Monumental Brutalist Headline Typography on the Description */}
        <div className="editorial-quote-section editorial-quote-card max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
          {/* Top Technical Meta Bar */}
          <div className="flex items-center justify-between border-b border-white/15 pb-3 mb-6 sm:mb-8 text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-white/50">
            <span>MANA VENUES • EDITORIAL</span>
            <span className="hidden sm:inline">KERALA • 2026</span>
            <span>CURATED DESTINATIONS</span>
          </div>

          {/* Description in Massive Heading Typography with Highlighted Sentences */}
          <div className="text-left">
            <h2
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[82px] font-normal tracking-normal leading-[1.05] text-white"
              style={{ fontFamily: "'Italiana', serif" }}
            >
              {/* Highlighted core sentence in bright rush yellow gradient */}
              <span className="inline">
                {`Your celebration deserves the warmth and safety of home.`
                  .split(' ')
                  .map((word, i) => (
                    <span key={`h1-${i}`} className="editorial-word rush-word mr-[0.22em]">
                      {word}
                    </span>
                  ))}
              </span>{' '}
              {/* Crisp high-contrast white text */}
              <span className="text-white">
                {`Explore verified venues and bespoke destination wedding packages across God's Own Country,`
                  .split(' ')
                  .map((word, i) => (
                    <span key={`w1-${i}`} className="editorial-word inline-block mr-[0.22em]">
                      {word}
                    </span>
                  ))}
              </span>
              <span className="block my-3 sm:my-5" />
              {/* Highlighted cultural statement in bright rush yellow gradient */}
              <span className="inline">
                {`thoughtfully designed to honor Kerala's rich cultural tapestry`
                  .split(' ')
                  .map((word, i) => (
                    <span key={`h2-${i}`} className="editorial-word rush-word mr-[0.22em]">
                      {word}
                    </span>
                  ))}
              </span>{' '}
              {/* Crisp high-contrast white text */}
              <span className="text-white">
                {`while keeping you in expert, caring hands.`
                  .split(' ')
                  .map((word, i) => (
                    <span key={`w2-${i}`} className="editorial-word inline-block mr-[0.22em]">
                      {word}
                    </span>
                  ))}
              </span>
            </h2>
          </div>
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
                    : 'Find Your Venues in Kerala'}
              </h2>
              {!isLoading && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-green-900/40 text-emerald-300 border border-green-700/40">
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
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/70 shadow-md scale-105'
                    : 'bg-green-900/50 hover:bg-green-800/70 text-green-100 hover:text-white border border-green-700/60'
                }`}
              >
                <MapPin
                  className={`w-3.5 h-3.5 text-white ${isNearMeActive ? 'fill-current' : ''}`}
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
              className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-green-100 bg-green-900/40 border border-green-700/40 hover:bg-green-800/50 hover:text-white transition-all shadow-xs"
            >
              <span>{selectedCity && !isNearMeActive ? 'Change City' : 'Select City'}</span>
            </button>
          </div>
        </div>

        {/* FEED GRID / STATES */}
        <div ref={gridRef}>
          {/* Loading Skeleton */}
          {isLoading && !auditoriums && <AuditoriumCardSkeletonList count={6} />}

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
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && displayedAuditoriums.length === 0 && (
            <div className="text-center py-16 bg-brand-dark/90 backdrop-blur-md rounded-2xl border border-green-800/40 shadow-xl max-w-lg mx-auto p-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-green-900/40 text-white mx-auto flex items-center justify-center">
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
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors shadow-sm"
                  >
                    View All Cities
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-emerald-300 bg-green-950/80 hover:bg-green-900/60 transition-colors border border-green-700/50"
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
