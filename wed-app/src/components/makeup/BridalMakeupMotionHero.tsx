import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Crown,
  ChevronRight,
  CheckCircle2,
  Layers,
  Edit3,
  ArrowLeft,
} from 'lucide-react'
import type { MakeupCategory } from '../../store/makeupStore'
import { useMakeupStore } from '../../store/makeupStore'
import { useAuth } from '../../contexts/AuthContext'

export interface MakeupTypeMeta {
  id: MakeupCategory
  title: string
  subtitle: string
  icon: typeof Sparkles
  image: string
  badge: string
  badgeColor: string
  startingPrice: string
  description: string
  brandKit: string
  swatches: string[]
  keyPoints: string[]
  deliverableSummary: string
}

export const MAKEUP_STYLES: MakeupTypeMeta[] = [
  {
    id: 'hd_bridal',
    title: 'HD Bridal Makeup',
    subtitle: '',
    icon: Crown,
    image: '/makeup-bridal.jpg',
    badge: 'Muhurtham & Sacred Heritage',
    badgeColor: 'from-[#C83B68] via-[#E05A85] to-[#C83B68]',
    startingPrice: 'From ₹22,000',
    description: '',
    brandKit: 'Charlotte Tilbury • MAC Pro • Huda Beauty • Dior Backstage',
    swatches: ['#800020', '#C83B68', '#E6A15C', '#D4AF37'],
    keyPoints: [],
    deliverableSummary: '18h HD Base • Saree Drape • 3 Touchups',
  },
  {
    id: 'airbrush',
    title: 'Airbrush Glamour',
    subtitle: 'Ultra-Fine Silicone Mist & Hollywood Reception Waves',
    icon: Sparkles,
    image: '/makeup-airbrush.jpg',
    badge: 'Red Carpet & Reception',
    badgeColor: 'from-[#E05A85] via-[#F3A2BE] to-[#C83B68]',
    startingPrice: 'From ₹35,000',
    description:
      'Silicone-based micro-fine mist airbrushing for a 24-hour poreless, luminous finish. Paired with textured Hollywood glam waves, body glow shimmer, and imported Swarovski hair crystals.',
    brandKit: 'TEMPTU Pro 2.0 • Estée Lauder • Hourglass • Natasha Denona',
    swatches: ['#E05A85', '#F5C6CB', '#C5A059', '#3D0C1A'],
    keyPoints: [
      'TEMPTU 2.0 micro-silicone airbrush application that will not melt or crease under flash',
      'Luminous dewy décolletage & back body glow shimmer for evening gowns and lehengas',
      'Voluminous red-carpet Hollywood waves or textured architectural bridal updo',
    ],
    deliverableSummary: '24h Airbrush • Body Glow • Hollywood Hair',
  },
  {
    id: 'party',
    title: 'Pre-Wedding & Sangeet',
    subtitle: 'Vibrant Dewy Glass Skin & Floral Party Hairstyling',
    icon: Sparkles,
    image: '/makeup-party.jpg',
    badge: 'Trending Fresh & Sangeet',
    badgeColor: 'from-[#0F766E] via-[#14B8A6] to-[#0D9488]',
    startingPrice: 'From ₹18,000',
    description:
      'Fresh, lightweight glass-skin glow designed for dancing, Haldi rituals, and Sangeet stage celebrations with graphic eyeliner, soft shimmer eyelids, and boho floral fishtail braids.',
    brandKit: 'Fenty Beauty • Rare Beauty • Too Faced • NARS Orgasm',
    swatches: ['#F3A2BE', '#E6C229', '#14B8A6', '#8E2800'],
    keyPoints: [
      'Breathable glass-skin hydration serum base with long-wear transfer-proof pigments',
      'Bohemian textured messy braid with fresh baby’s breath floral weaving',
      'Dupatta, lehenga, and sharara movement-proof pinning for non-stop dance ease',
    ],
    deliverableSummary: 'Glass Skin • Floral Braid • Dance Proof',
  },
]

interface BridalMakeupMotionHeroProps {
  onSelectCategory: (category: MakeupCategory | 'all') => void
  onExplorePackages: () => void
  onOpenEditHeroModal?: () => void
}

export default function BridalMakeupMotionHero({
  onSelectCategory,
  onExplorePackages,
  onOpenEditHeroModal,
}: BridalMakeupMotionHeroProps) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const heroTexts = useMakeupStore((s) => s.heroTexts)
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'

  const active = MAKEUP_STYLES[activeIndex]

  const handleSelectType = (idx: number) => {
    setActiveIndex(idx)
    onSelectCategory(MAKEUP_STYLES[idx].id)
  }

  // 10s Smooth Auto-Loop for hero animation (does NOT change bottom packages list)
  useEffect(() => {
    if (isHovered) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      return
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % MAKEUP_STYLES.length)
    }, 10000)

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
  }, [isHovered])

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#FFF5F8] via-[#FAF0F4] to-[#F0F9F8] py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D8F0EC]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Bridal & Makeup Artistry Showcase"
    >
      {/* Background Soft Vanity Radiance & Sparkles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#F3A2BE]/25 blur-3xl animate-bokeh-1" />
        <div className="absolute top-1/2 -right-20 w-[460px] h-[460px] rounded-full bg-[#E05A85]/15 blur-3xl animate-bokeh-2" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-[#D8F0EC]/70 blur-3xl animate-bokeh-3" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Navigation Arrow on the top left corner just above the main title */}
        <div className="flex items-center justify-start mb-2 sm:mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-[#5A172D] border border-[#D8F0EC] shadow-xs hover:shadow-sm text-xs font-semibold transition-all hover:border-[#C83B68]/40 active:scale-95 cursor-pointer"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4 text-[#C83B68] group-hover:-translate-x-0.5 transition-transform" />
            <span>Back</span>
          </button>
        </div>

        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10 space-y-2">
          <div className="flex items-center gap-2">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#5A172D] tracking-wide max-w-3xl"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {heroTexts.title}
            </h1>
            {isAdmin && onOpenEditHeroModal && (
              <button
                type="button"
                onClick={onOpenEditHeroModal}
                title="Edit Hero Title & Descriptions"
                className="p-1.5 rounded-full bg-white border border-[#D8F0EC] hover:bg-[#FFF2F6] text-[#C83B68] shadow-xs transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-black/75 max-w-xl font-medium">
            {heroTexts.description}
          </p>

          {/* 3 Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            {MAKEUP_STYLES.map((type, idx) => {
              const isCurrent = idx === activeIndex
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectType(idx)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-xs cursor-pointer active:scale-95 ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] text-white shadow-md shadow-[#C83B68]/30 scale-105'
                      : 'bg-white hover:bg-[#FFF2F6] text-[#5A172D] border border-[#D8F0EC]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-[#C83B68]'}`} />
                  <span>{type.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D VANITY MIRROR COMPACT DECK ANIMATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: 3D Vanity Mirror Deck */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div
              className="relative w-full h-[320px] sm:h-[390px] md:h-[430px] flex items-center justify-center select-none overflow-hidden touch-pan-y"
              style={{ perspective: '1200px' }}
            >
              {MAKEUP_STYLES.map((type, idx) => {
                const total = MAKEUP_STYLES.length
                let diff = (idx - activeIndex) % total
                if (diff > total / 2) diff -= total
                if (diff < -total / 2) diff += total

                const isCenter = diff === 0
                const isLeft = diff === -1
                const isRight = diff === 1

                let transformStyle = ''
                let zIndex = 10
                let opacity = 0.5
                let pointerEvents: 'auto' | 'none' = 'auto'

                if (isCenter) {
                  transformStyle = 'translateX(0%) scale(1) translateZ(0) rotateY(0deg)'
                  zIndex = 30
                  opacity = 1
                } else if (isLeft) {
                  transformStyle = 'translateX(-34%) scale(0.86) translateZ(-70px) rotateY(10deg)'
                  zIndex = 20
                  opacity = 0.55
                } else if (isRight) {
                  transformStyle = 'translateX(34%) scale(0.86) translateZ(-70px) rotateY(-10deg)'
                  zIndex = 20
                  opacity = 0.55
                } else {
                  transformStyle = 'translateX(0%) scale(0.7) translateZ(-160px)'
                  zIndex = 10
                  opacity = 0
                  pointerEvents = 'none'
                }

                return (
                  <div
                    key={type.id}
                    onClick={() => handleSelectType(idx)}
                    className={`absolute top-0 w-[84%] sm:w-[76%] md:w-[68%] max-w-[440px] aspect-[16/11] rounded-3xl overflow-hidden cursor-pointer select-none transition-[transform,opacity] duration-500 ease-out will-change-[transform,opacity] transform-gpu border-2 border-[#F3A2BE]/40 shadow-2xl ${
                      isCenter
                        ? 'ring-2 ring-[#C83B68]/40 shadow-[0_24px_50px_rgba(200,59,104,0.22)]'
                        : ''
                    }`}
                    style={{
                      transform: transformStyle,
                      zIndex,
                      opacity,
                      pointerEvents,
                      WebkitTapHighlightColor: 'transparent',
                      WebkitBackfaceVisibility: 'hidden',
                      backfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Cover Photo */}
                    <img
                      src={type.image}
                      alt={type.title}
                      className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Vanity Mirror Shimmer & Gradient Scrim */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

                    {/* Top Left Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white border border-white/20 shadow-sm pointer-events-none">
                      <span>{type.badge}</span>
                    </div>

                    {/* Top Right Starting Price */}
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#E05A85] to-[#C83B68] text-white text-xs font-extrabold shadow-sm pointer-events-none">
                      <span>{type.startingPrice}</span>
                    </div>

                    {/* Palette Shade Swatches Bar */}
                    <div className="absolute top-12 right-3 flex items-center gap-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                      {type.swatches.map((color, sIdx) => (
                        <span
                          key={sIdx}
                          className="w-2.5 h-2.5 rounded-full border border-white/40 shadow-xs"
                          style={{ backgroundColor: color }}
                          title={`Shade swatch ${sIdx + 1}`}
                        />
                      ))}
                    </div>

                    {/* Bottom Content on Card */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left pointer-events-none space-y-1 text-white">
                      <div className="flex items-center gap-1.5 text-xs text-[#FFF5F8] font-medium">
                        <type.icon className="w-3.5 h-3.5 text-[#F3A2BE]" />
                        <span>{type.title}</span>
                      </div>

                      {type.subtitle && (
                        <h3
                          className="text-base sm:text-xl font-bold tracking-wide leading-tight line-clamp-1 drop-shadow-sm"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {type.subtitle}
                        </h3>
                      )}

                      <div className="pt-1 flex items-center justify-between text-[11px] text-white/85">
                        <span>{type.deliverableSummary}</span>
                        {isCenter && (
                          <span className="text-[#F3A2BE] font-bold inline-flex items-center gap-1">
                            <span>Explore Kits</span>
                            <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2 mt-4">
              {MAKEUP_STYLES.map((type, idx) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectType(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeIndex
                      ? 'w-8 bg-gradient-to-r from-[#C83B68] to-[#E05A85]'
                      : 'w-2 bg-[#D8F0EC] hover:bg-[#C83B68]/50'
                  }`}
                  aria-label={`Switch to ${type.title}`}
                />
              ))}
            </div>
          </div>

          {/* Right: Active Category Overview */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5">
            <div className="space-y-3.5">
              {active.subtitle && (
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-[#5A172D] tracking-wide leading-tight"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {active.subtitle}
                </h2>
              )}

              {active.description && (
                <p className="text-xs sm:text-sm text-black/80 font-medium leading-relaxed">
                  {active.description}
                </p>
              )}

              {/* Signature Inclusions */}
              {active.keyPoints && active.keyPoints.length > 0 && (
                <div className="space-y-2 pt-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A172D]">
                    Signature Beauty Inclusions
                  </p>
                  <ul className="space-y-1.5">
                    {active.keyPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-black/85 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#C83B68] shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory(active.id)
                  onExplorePackages()
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-[#C83B68]/30 active:scale-95 transition-all cursor-pointer"
              >
                <span>View {active.title.split(' ')[0]} Packages</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white hover:bg-[#FFF2F6] text-[#7E1F3E] font-bold text-xs sm:text-sm border border-[#D8F0EC] shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                <Layers className="w-3.5 h-3.5 text-[#C83B68]" />
                <span>Show All Packages</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
