import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Heart,
  Smartphone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import CoolCameraIcon from '../common/CoolCameraIcon'
import type { PhotographyCategory } from '../../store/photographyStore'

interface PhotographyTypeMeta {
  id: PhotographyCategory
  title: string
  subtitle: string
  icon: typeof Heart
  image: string
  badge: string
  badgeColor: string
  startingPrice: string
  description: string
  gearSpec: string
  keyPoints: string[]
  deliverableSummary: string
}

const PHOTOGRAPHY_TYPES: PhotographyTypeMeta[] = [
  {
    id: 'wedding',
    title: 'Wedding Photography',
    subtitle: '',
    icon: Heart,
    image: '/photo-wedding.jpg',
    badge: 'Ceremony & Grandeur',
    badgeColor: 'from-[#C83B68] via-[#E05A85] to-[#C83B68]',
    startingPrice: 'Price on Demand',
    description: '',
    gearSpec: 'Sony FX3 Cinema • 4K Drone • 10-bit S-Log3 • Prime Glass',
    keyPoints: [],
    deliverableSummary: '1,200+ Photos • 8 Reels • Full 4K Film',
  },
  {
    id: 'mobile',
    title: 'Mobile Photography',
    subtitle: 'Instant Viral Reels & Candid BTS Memories',
    icon: Smartphone,
    image: '/photo-mobile.jpg',
    badge: 'Trending Social-First',
    badgeColor: 'from-[#E05A85] via-[#F3A2BE] to-[#C83B68]',
    startingPrice: 'Price on Demand',
    description:
      'Fast-paced, creative vertical 4K video reels and unfiltered candid phone memories delivered straight to your WhatsApp and Instagram on the same night.',
    gearSpec: 'iPhone 16 Pro Max • DJI Osmo Gimbal • Wireless Lav Mics',
    keyPoints: [
      '15+ High-energy edited Instagram reels with trending audio',
      'Live Instagram story takeovers & candid guest interviews',
      'All raw 4K clips AirDropped within 6 hours of your event',
    ],
    deliverableSummary: '15+ Viral Reels • 250+ Candids • Same Night',
  },
  {
    id: 'normal',
    title: 'Normal Photography',
    subtitle: 'Traditional Stage Coverage & Family Keepsakes',
    icon: CoolCameraIcon as typeof Heart,
    image: '/photo-normal.jpg',
    badge: 'Classic & Reliable',
    badgeColor: 'from-[#0F766E] via-[#14B8A6] to-[#0D9488]',
    startingPrice: 'Price on Demand',
    description:
      'Clean, timeless stage and family portraiture capturing every greeting, ceremony blessing, and family generation with balanced lighting and hardcover albums.',
    gearSpec: 'Full-Frame Cameras • Balanced Studio Strobes • Portrait Optics',
    keyPoints: [
      'Complete stage greeting coverage for all relatives and guests',
      '300+ color-corrected, print-ready high-resolution photos',
      'Hardcover embossed wedding album + high-speed USB flash drive',
    ],
    deliverableSummary: '300+ Posed Photos • Hardcover Album • USB',
  },
]

interface PhotographyMotionHeroProps {
  onSelectCategory: (category: PhotographyCategory | 'all') => void
  onExplorePackages: () => void
}

export default function PhotographyMotionHero({
  onSelectCategory,
  onExplorePackages,
}: PhotographyMotionHeroProps) {
  const navigate = useNavigate()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleSelectType = (idx: number) => {
    setActiveIndex(idx)
    onSelectCategory(PHOTOGRAPHY_TYPES[idx].id)
  }

  // Smooth auto-loop every 5.5s
  useEffect(() => {
    if (isHovered) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      return
    }

    autoPlayTimerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PHOTOGRAPHY_TYPES.length)
    }, 10000)

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
  }, [isHovered])

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#F0F9F8] via-[#FAF5F7] to-[#F0F9F8] py-10 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#D8F0EC]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Photography Showcase Hero"
    >
      {/* Background Ambient Glow Circles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-[#F3A2BE]/20 blur-3xl animate-bokeh-1" />
        <div className="absolute top-1/2 -right-24 w-[450px] h-[450px] rounded-full bg-[#D8F0EC]/70 blur-3xl animate-bokeh-2" />
        <div className="absolute -bottom-16 left-1/3 w-80 h-80 rounded-full bg-[#E05A85]/15 blur-3xl animate-bokeh-3" />
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
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#5A172D] tracking-wide max-w-3xl"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Photography
          </h1>

          <p className="text-xs sm:text-sm text-black/75 max-w-xl font-medium">
            Choose from our three signature styles — Grand Wedding ceremonies, fast viral Mobile Reels, or timeless Normal Stage coverage.
          </p>

          {/* 3 Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
            {PHOTOGRAPHY_TYPES.map((type, idx) => {
              const isCurrent = idx === activeIndex
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectType(idx)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-xs cursor-pointer active:scale-95 ${isCurrent
                    ? 'bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] text-white shadow-md shadow-[#C83B68]/30 scale-105'
                    : 'bg-white hover:bg-[#F0F9F8] text-[#5A172D] border border-[#D8F0EC]'
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-[#C83B68]'}`} />
                  <span>{type.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* 3D FLOATING EDITORIAL SHOWCASE STAGE (Centered, clean without long description) */}
        <div className="flex flex-col items-center justify-center max-w-4xl mx-auto">
          <div
            className="relative w-full h-[300px] sm:h-[380px] md:h-[420px] flex items-center justify-center select-none overflow-hidden touch-pan-y"
            style={{ perspective: '1200px' }}
          >
            {PHOTOGRAPHY_TYPES.map((type, idx) => {
              // Calculate relative position around activeIndex
              const total = PHOTOGRAPHY_TYPES.length
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
                  className={`absolute top-0 w-[84%] sm:w-[76%] md:w-[64%] max-w-[440px] aspect-[16/11] rounded-3xl overflow-hidden cursor-pointer select-none transition-[transform,opacity] duration-500 ease-out will-change-[transform,opacity] transform-gpu border border-[#D8F0EC] shadow-2xl hover:opacity-100 ${isCenter ? 'ring-2 ring-[#C83B68]/30 shadow-[0_24px_50px_rgba(200,59,104,0.18)]' : ''
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
                  {/* Cover Photograph */}
                  <img
                    src={type.image}
                    alt={type.title}
                    className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

                  {/* Top Left Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white border border-white/20 shadow-sm pointer-events-none">
                    <span>{type.badge}</span>
                  </div>

                  {/* Top Right Starting Price */}
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gradient-to-r from-[#E05A85] to-[#C83B68] text-white text-xs font-extrabold shadow-sm pointer-events-none">
                    <span>{type.startingPrice}</span>
                  </div>

                  {/* Bottom Content on Card */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left pointer-events-none space-y-1 text-white">
                    <div className="flex items-center gap-1.5 text-xs text-[#F0F9F8] font-medium">
                      <type.icon className="w-3.5 h-3.5 text-[#F3A2BE]" />
                      <span>{type.title}</span>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-white/85">
                      <span>{type.deliverableSummary}</span>
                      {isCenter && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation()
                            onExplorePackages?.()
                          }}
                          className="text-[#F3A2BE] font-bold inline-flex items-center gap-1 cursor-pointer pointer-events-auto"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Hint & Direct Step Dots */}
          <div className="flex items-center gap-2 mt-4">
            {PHOTOGRAPHY_TYPES.map((type, idx) => (
              <button
                key={type.id}
                type="button"
                onClick={() => handleSelectType(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${idx === activeIndex
                  ? 'w-8 bg-gradient-to-r from-[#C83B68] to-[#E05A85]'
                  : 'w-2 bg-[#D8F0EC] hover:bg-[#C83B68]/50'
                  }`}
                aria-label={`Switch to ${type.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
