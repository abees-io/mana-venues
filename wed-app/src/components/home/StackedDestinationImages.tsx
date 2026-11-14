import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, MapPin, ChevronRight, Layers } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

interface DestinationCard {
  id: string
  title: string
  subhead: string
  location: string
  image: string
  alt: string
  badge: string
}

const DESTINATION_CARDS: DestinationCard[] = [
  {
    id: 'kerala-mandap',
    title: 'Heritage Mandap & Garden Sanctum',
    subhead: 'Traditional brass nilavilakku, temple blooms & royal decor',
    location: 'Kumarakom & Thrissur',
    image: '/dest-wedding-1.jpg',
    alt: 'Traditional Kerala wedding garden mandap with floral artistry',
    badge: 'Heritage & Tradition',
  },
  {
    id: 'coastal-canopy',
    title: 'Sunset Beach & Shoreline Canopies',
    subhead: 'Arabian sea breezes, white sands & romantic seaside vows',
    location: 'Kovalam & Marari Coast',
    image: '/dest-wedding-2.jpg',
    alt: 'Coastal beach destination wedding setup with elegant canopy on Kerala shore',
    badge: 'Coastal Romance',
  },
  {
    id: 'hill-celebration',
    title: 'Highland Estates & Mist Sanctuaries',
    subhead: 'Lush tea terraces, vibrant floral stage & cool mountain air',
    location: 'Munnar & Wayanad Hills',
    image: '/dest-wedding-3.jpg',
    alt: 'Celebratory destination wedding festivity with colorful smoke and floral grand arch',
    badge: 'Bespoke Splendor',
  },
]

export default function StackedDestinationImages() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Cycle to next card
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % DESTINATION_CARDS.length)
  }

  // Handle direct click on a stacked card
  const handleCardClick = (index: number) => {
    setActiveIndex(index)
  }

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !containerRef.current) return

    const ctx = gsap.context(() => {
      // Scroll-driven stacked card animation:
      // As the user scrolls through the hero section, dynamically fan and rotate the cards
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
          end: 'bottom 10%',
          scrub: 1.2,
        },
      })

      // Animate card stack spread on scroll
      cardRefs.current.forEach((card, idx) => {
        if (!card) return
        const spreadY = (idx - 1) * 22
        const rotateZ = idx === 0 ? -7 : idx === 1 ? 5 : -3
        const spreadX = (idx - 1) * 16

        tl.to(
          card,
          {
            y: spreadY,
            x: spreadX,
            rotation: rotateZ,
            scale: 1 - idx * 0.04,
            ease: 'none',
          },
          0
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md mx-auto lg:max-w-none flex flex-col items-center lg:items-end select-none"
      aria-label="Destination wedding showcase image stack"
    >
      {/* Decorative luxury backdrop glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-brand-secondary/20 via-emerald-600/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      {/* Stacked Cards Container */}
      <div className="relative w-full aspect-[4/5] sm:aspect-[4/4.8] max-h-[460px] flex items-center justify-center">
        {DESTINATION_CARDS.map((card, index) => {
          // Calculate stack positioning relative to activeIndex
          const offset = (index - activeIndex + DESTINATION_CARDS.length) % DESTINATION_CARDS.length
          const isTop = offset === 0

          // Static offsets for layered physical stack look
          const zIndex = 30 - offset * 10
          const scale = 1 - offset * 0.05
          const translateY = offset * 14
          const rotation = offset === 0 ? 0 : offset === 1 ? 4 : -4
          const opacity = offset === 0 ? 1 : offset === 1 ? 0.9 : 0.75

          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              onClick={() => handleCardClick(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleCardClick(index)
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${card.title}`}
              style={{
                zIndex,
                transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotation}deg)`,
                opacity,
              }}
              className={`absolute inset-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out border shadow-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/80 ${
                isTop
                  ? 'border-brand-secondary/60 shadow-[0_20px_45px_rgba(0,0,0,0.7)]'
                  : 'border-emerald-800/40 shadow-[0_12px_30px_rgba(0,0,0,0.5)] hover:scale-[1.02]'
              } bg-brand-dark/95 backdrop-blur-sm`}
            >
              {/* Card Photo */}
              <img
                src={card.image}
                alt={card.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent opacity-90 pointer-events-none" />

              {/* Card Top Badge */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark/80 backdrop-blur-md border border-brand-secondary/50 text-[11px] sm:text-xs font-semibold text-brand-secondary shadow-md">
                <Sparkles className="w-3 h-3 text-brand-secondary animate-pulse" />
                <span>{card.badge}</span>
              </div>

              {/* Card Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-1.5 text-left">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-300/90">
                  <MapPin className="w-3 h-3 text-brand-secondary shrink-0" />
                  <span>{card.location}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight drop-shadow-sm">
                  {card.title}
                </h3>

                <p className="text-xs text-gray-200/90 line-clamp-2 font-normal leading-relaxed">
                  {card.subhead}
                </p>

                {isTop && (
                  <div className="pt-2 flex items-center justify-between">
                    <Link
                      to="/packages"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs font-bold text-brand-secondary hover:text-white transition-colors group/link"
                    >
                      <span>Explore Packages</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                    </Link>
                    <span className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-mono">
                      {index + 1} / {DESTINATION_CARDS.length}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Minimal Stack Controls */}
      <div className="mt-4 sm:mt-5 flex items-center justify-between w-full max-w-sm px-2">
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Card selection">
          {DESTINATION_CARDS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-6 bg-brand-secondary'
                  : 'w-2 bg-emerald-700/50 hover:bg-emerald-600'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-700/40 transition-colors active:scale-95"
          aria-label="Next destination card"
        >
          <Layers className="w-3.5 h-3.5 text-brand-secondary" />
          <span>Next Experience</span>
        </button>
      </div>
    </div>
  )
}
