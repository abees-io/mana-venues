import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  Camera,
  MapPin,
  Package as PackageIcon,
  Users,
  ChevronRight,
  Building2,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import LocationModal from '../components/modals/LocationModal'
import HomeImageModal, { type HomeImageTarget } from '../components/modals/HomeImageModal'
import HomeScrollMotionSection from '../components/home/HomeScrollMotionSection'
import { useAuth } from '../contexts/AuthContext'
import { useAuditoriums } from '../hooks/useAuditoriums'
import { useCityStore } from '../store/cityStore'
import { useFilterStore } from '../store/filterStore'
import { useHomeMediaStore } from '../store/homeMediaStore'
import { usePackagesStore } from '../store/packagesStore'

gsap.registerPlugin(ScrollTrigger)

const CATEGORIES: Array<{
  id: string
  title: string
  badge: string
  image: string
  query: string
}> = [
    {
      id: 'destination_wedding',
      title: 'Destination Wedding',
      badge: 'Venues & Resorts',
      image: '/category-destination.jpg',
      query: 'destination wedding',
    },
    {
      id: 'photography',
      title: 'Photography',
      badge: 'Wedding & Mobile',
      image: '/category-photography.jpg',
      query: 'photography',
    },
    {
      id: 'catering',
      title: 'Catering',
      badge: 'Feasts & Dining',
      image: '/category-catering.jpg',
      query: 'catering',
    },
    {
      id: 'makeup_artist',
      title: 'Bridal Makeup',
      badge: 'Bridal & Groom',
      image: '/category-makeup.jpg',
      query: 'bridal makeup',
    },
  ]

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
  const { selectedCity } = useCityStore()

  // User's preferred city: from authenticated profile or stored in localStorage
  const preferredCity = useMemo(() => {
    if (profile?.preferred_city) return profile.preferred_city
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mana_preferred_city')
      if (stored) return stored
    }
    return user ? 'kochi' : null
  }, [profile?.preferred_city, user])

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
  const [editingImageTarget, setEditingImageTarget] = useState<HomeImageTarget | null>(null)
  const heroImage = useHomeMediaStore((s) => s.heroImage)
  const categoryImages = useHomeMediaStore((s) => s.categoryImages)

  // Near Me Geolocation States
  const [userCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isNearMeActive] = useState(false)

  const heroRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  // Fetch auditoriums filtered by selected city and filter store
  const {
    data: auditoriums,
    isLoading,
  } = useAuditoriums(isNearMeActive ? null : selectedCity?.slug, filterParams)

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

        // 3. Explore Categories Title — scroll-triggered reveal
        gsap.fromTo(
          '.category-title-animate',
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power3.out',
            clearProps: 'transform,opacity',
            force3D: true,
            scrollTrigger: {
              trigger: '.categories-section',
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        )

        // 4. Category Cards — scroll-triggered stagger entrance
        gsap.fromTo(
          '.category-card-animate',
          { opacity: 0, y: 40, scale: 0.93 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.65,
            ease: 'power3.out',
            stagger: 0.1,
            clearProps: 'transform,opacity',
            force3D: true,
            scrollTrigger: {
              trigger: '.categories-section',
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        )
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

  const handleCategorySelect = (categoryId: string, query: string) => {
    if (categoryId === 'destination_wedding') {
      navigate('/packages#packages-section')
      return
    }
    if (categoryId === 'photography') {
      navigate('/photography')
      return
    }
    if (categoryId === 'catering') {
      navigate('/catering')
      return
    }
    if (categoryId === 'makeup_artist') {
      navigate('/bridal-makeup')
      return
    }
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
      <section ref={heroRef} className="w-full pt-0 pb-4">
        {/* HERO CARD CONTAINER */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="hero-card-animate relative rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[16/10] md:aspect-[2.1/1] min-h-[440px] sm:min-h-[460px] shadow-2xl border border-[#D8F0EC] group will-change-[transform,opacity] transform-gpu">
            {/* Background Mandap Image */}
            <img
              src={heroImage}
              alt="Curated Kerala Weddings"
              className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Admin: Change Hero Image Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setEditingImageTarget({
                    type: 'hero',
                    id: 'hero',
                    label: 'Hero Banner',
                  })
                }
                className="absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-dark/90 backdrop-blur-md text-brand-secondary hover:bg-black text-xs font-bold border border-brand-secondary/50 shadow-lg transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>
            )}
            {/* Vignette Overlay for Crisp Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25 pointer-events-none" />

            {/* Centered Hero Content */}
            <div className="relative h-full flex flex-col items-center justify-center text-center p-6 sm:p-10 z-10 space-y-3 sm:space-y-4">
              {/* Grand Venues Heading — Bubble Gum & Candy Floss Crisp Gradient */}
              <h1
                className="hero-text-reveal text-2xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wide leading-tight bg-gradient-to-r from-white via-[#F3A2BE] to-[#F0F9F8] bg-clip-text text-transparent drop-shadow-md"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                CURATED KERALA WEDDINGS, MADE EFFORTLESS
              </h1>

              {/* Subtitle / Description */}
              <p className="hero-text-reveal text-sm sm:text-base md:text-lg font-medium text-white/95 max-w-xl mx-auto drop-shadow-md leading-relaxed">
                From backwater resorts to top destination wedding planners all in one place
              </p>

              {/* CTA Button — Rose Accent */}
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
                  className="px-8 sm:px-10 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#E05A85] via-[#F3A2BE] to-[#E05A85] hover:brightness-105 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-black/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {!isAdmin ? 'Explore Packages' : 'Explore Venues'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* EDITORIAL DESCRIPTION & SCROLL MOTION GRAPHIC */}
        <HomeScrollMotionSection />

        {/* EXPLORE CATEGORIES SECTION */}
        <div
          onClick={() => {
            if (!isAdmin) navigate('/packages#packages-section')
          }}
          className={`categories-section max-w-5xl mx-auto px-3 sm:px-6 pt-8 sm:pt-12 ${!isAdmin ? 'cursor-pointer' : ''
            }`}
          style={{ perspective: '800px' }}
        >
          <h2
            className="category-title-animate text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#7E1F3E] mb-4 sm:mb-5 text-left drop-shadow-xs inline-block"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Explore Categories
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 md:gap-5 items-stretch">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={(e) => {
                  e.stopPropagation()
                  handleCategorySelect(cat.id, cat.query)
                }}
                className="category-card-animate group relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-lg border-0 outline-none focus:outline-none focus:ring-0 active:outline-none active:ring-0 select-none will-change-[transform,opacity] transform-gpu active:opacity-95"
                style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
              >
                <img
                  src={categoryImages[cat.id] || cat.image}
                  alt={cat.title}
                  className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10 pointer-events-none" />

                {/* Admin: Change Category Image Button */}
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingImageTarget({
                        type: 'category',
                        id: cat.id,
                        label: cat.title,
                      })
                    }}
                    aria-label={`Change ${cat.title} photo`}
                    className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-brand-dark/90 backdrop-blur-md text-brand-secondary hover:bg-black border border-brand-secondary/50 shadow-md transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Top Pill Badge */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white/90 border border-white/10 pointer-events-none">
                  {cat.badge}
                </div>

                {/* Bottom Title in Crisp Gradient */}
                <div className="absolute bottom-2.5 sm:bottom-3 left-2 right-2 text-center pointer-events-none flex flex-col items-center justify-end">
                  <h3
                    className="text-xs sm:text-base md:text-lg font-bold bg-gradient-to-r from-white via-[#FCE7ED] to-white bg-clip-text text-transparent drop-shadow-md tracking-wide leading-tight"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {cat.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: FIND YOUR VENUES (1 Single Compact Feature Card with Dummy AI Image) */}
      <div ref={gridRef} className="max-w-5xl mx-auto px-3 sm:px-6 pt-6 sm:pt-8 pb-6">
        {/* Section Heading & City Quick Filter */}
        <div className="flex items-center justify-between mb-3 sm:mb-4 gap-3">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#7E1F3E] text-left drop-shadow-xs inline-block"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Find your venues
            </h2>
            <p className="text-xs sm:text-sm font-medium text-[#7E1F3E]/80 mt-0.5">
              Free to use
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#7E1F3E] bg-white hover:bg-gray-100 shadow-2xs transition-colors shrink-0"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>{selectedCity && !isNearMeActive ? selectedCity.name : 'All Kerala'}</span>
          </button>
        </div>

        {/* 1 Single Compact Feature Card */}
        <div
          onClick={() => {
            const citySlug = selectedCity?.slug || 'kochi'
            navigate(`/city/${citySlug}`)
          }}
          className="group relative w-full aspect-[2.4/1] sm:aspect-[3.4/1] min-h-[140px] sm:min-h-[160px] rounded-2xl overflow-hidden cursor-pointer shadow-md select-none will-change-[transform,opacity] transform-gpu hover:shadow-xl transition-all active:scale-[0.99]"
          style={{ WebkitTapHighlightColor: 'transparent', outline: 'none' }}
        >
          {/* Dummy AI Venue Image */}
          <img
            src="/venue-ai-dummy.jpg"
            alt="Find Your Venues"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            loading="eager"
          />

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white/95 border border-white/10 pointer-events-none flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Curated Venues & Auditoriums</span>
          </div>

          {/* Content on the Card */}
          <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-5 pointer-events-none">
            <div className="max-w-md sm:max-w-lg">
              <h3
                className="text-sm sm:text-xl font-bold uppercase tracking-wide text-white drop-shadow-md leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Curated Auditoriums & Grand Halls
              </h3>
              <p className="text-[11px] sm:text-xs text-white/90 font-medium mt-1 leading-snug drop-shadow-xs line-clamp-1 sm:line-clamp-none">
                Air-conditioned banquet halls, mandapams & luxury wedding lawns across Kerala
              </p>
            </div>
          </div>

          {/* Right Action Button */}
          <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                const citySlug = selectedCity?.slug || 'kochi'
                navigate(`/city/${citySlug}`)
              }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#C83B68] hover:bg-[#A42A51] active:scale-95 transition-all shadow-md"
            >
              <span>Explore Venues</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: CITY PACKAGES & LISTINGS (Dedicated for user's selected city, separated from Find Venues) */}
      {preferredCity && (
        <CityPackagesSection preferredCitySlug={preferredCity} />
      )}

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />

      {/* Admin Front Page Image Modal */}
      <HomeImageModal
        target={editingImageTarget}
        onClose={() => setEditingImageTarget(null)}
      />
    </Layout>
  )
}

const KERALA_CITY_NAMES: Record<string, string> = {
  kochi: 'Kochi',
  thiruvananthapuram: 'Thiruvananthapuram',
  thrissur: 'Thrissur',
  kozhikode: 'Kozhikode',
  kannur: 'Kannur',
  kollam: 'Kollam',
  palakkad: 'Palakkad',
  alappuzha: 'Alappuzha',
  malappuram: 'Malappuram',
  kottayam: 'Kottayam',
  wayanad: 'Wayanad',
  idukki: 'Idukki',
  pathanamthitta: 'Pathanamthitta',
  kasaragod: 'Kasaragod',
}

function CityPackagesSection({ preferredCitySlug }: { preferredCitySlug: string }) {
  const navigate = useNavigate()
  const packages = usePackagesStore((s) => s.packages)
  const cityName =
    KERALA_CITY_NAMES[preferredCitySlug.toLowerCase()] ||
    preferredCitySlug.charAt(0).toUpperCase() + preferredCitySlug.slice(1)

  // Fetch auditoriums specifically for this preferred city (isolated hook call)
  const { data: cityAuditoriums, isLoading: venuesLoading } = useAuditoriums(
    preferredCitySlug.toLowerCase(),
    {}
  )

  // Find packages matching the preferred city
  const cityPackages = useMemo(() => {
    const slug = preferredCitySlug.toLowerCase()
    const matches = packages.filter((pkg) => {
      const loc = pkg.location.toLowerCase()
      const title = pkg.title.toLowerCase()
      return loc.includes(slug) || title.includes(slug)
    })
    // If no direct matches for this specific city, display all packages with "Available for {cityName}"
    return matches.length > 0 ? matches : packages
  }, [packages, preferredCitySlug])

  const [activeTab, setActiveTab] = useState<'packages' | 'venues'>('packages')

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 pb-10">
      {/* Header with City Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-[#D8F0EC] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7E1F3E]/10 text-[#7E1F3E] text-xs font-bold mb-1.5 border border-[#7E1F3E]/20">
            <MapPin className="w-3.5 h-3.5 text-[#C83B68]" />
            <span>Selected City: {cityName}</span>
          </div>
          <h2
            className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-[#7E1F3E] text-left drop-shadow-xs"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Packages & Venues in {cityName}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#7E1F3E]/80 mt-0.5">
            Wedding packages and verified auditoriums listed in {cityName}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F0F9F8] p-1 rounded-xl border border-[#D8F0EC]">
          <button
            type="button"
            onClick={() => setActiveTab('packages')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'packages'
                ? 'bg-[#7E1F3E] text-white shadow-sm'
                : 'text-[#5A172D]/70 hover:text-[#5A172D]'
            }`}
          >
            <PackageIcon className="w-3.5 h-3.5" />
            <span>Packages ({cityPackages.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('venues')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'venues'
                ? 'bg-[#7E1F3E] text-white shadow-sm'
                : 'text-[#5A172D]/70 hover:text-[#5A172D]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Venues ({cityAuditoriums?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === 'packages' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {cityPackages.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => navigate('/packages#packages-section')}
              className="group relative bg-white rounded-2xl overflow-hidden border border-[#D8F0EC] shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            >
              {/* Image banner */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold">
                    {pkg.backdrop}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#7E1F3E]/90 text-white text-[11px] font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F3A2BE]" />
                    {cityName}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-xs font-semibold text-rose-200">
                    Starts at {pkg.startingPrice}
                  </div>
                  <h3
                    className="text-base sm:text-lg font-bold leading-tight drop-shadow-md"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {pkg.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {pkg.tagline}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[#7E1F3E] font-medium">
                    <Users className="w-3.5 h-3.5" />
                    <span>{pkg.guestCapacity}</span>
                  </div>
                  <span className="text-[#C83B68] font-bold inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    <span>View Package</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {venuesLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-[#D8F0EC] animate-pulse" />
              ))}
            </div>
          ) : !cityAuditoriums || cityAuditoriums.length === 0 ? (
            <div className="text-center py-8 bg-[#F0F9F8] rounded-2xl border border-[#D8F0EC]">
              <p className="text-sm font-semibold text-[#7E1F3E]">
                No auditoriums currently listed for {cityName}.
              </p>
              <button
                type="button"
                onClick={() => navigate(`/city/${preferredCitySlug}`)}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#7E1F3E] hover:bg-[#A82B54]"
              >
                Browse All Kerala Venues
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {cityAuditoriums.slice(0, 6).map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => navigate(`/auditorium/${venue.slug || venue.id}`)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer shadow-md border border-[#D8F0EC]/60 hover:shadow-lg active:scale-[0.98] transition-all will-change-transform bg-white"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <img
                    src={venue.photos?.[0] || '/venue-ai-dummy.jpg'}
                    alt={venue.title || venue.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none text-white">
                    <p
                      className="text-xs sm:text-sm font-bold drop-shadow-md leading-tight line-clamp-1 tracking-wide"
                      style={{ fontFamily: "'Cinzel', serif" }}
                    >
                      {venue.title || venue.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] sm:text-xs text-white/80 mt-1">
                      <span>{venue.seating_capacity || venue.capacity || 200} guests</span>
                      <span className="text-rose-200 font-semibold">
                        ₹{(venue.base_price_per_day || venue.starting_price || 50000).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
