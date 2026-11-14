import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MapPin, ChevronRight } from 'lucide-react'

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

// Target transforms for the 3 slots in the stack
const SLOTS = [
  { y: 0, scale: 1, rotation: 0, opacity: 1, zIndex: 30 },
  { y: 14, scale: 0.95, rotation: 4, opacity: 0.9, zIndex: 20 },
  { y: 28, scale: 0.90, rotation: -4, opacity: 0.75, zIndex: 10 },
]

export default function StackedDestinationImages() {
  const [activeIndex, setActiveIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const isAnimatingRef = useRef(false)

  // Position cards on mount and whenever activeIndex changes
  const applySlotPositions = useCallback((active: number) => {
    DESTINATION_CARDS.forEach((_, idx) => {
      const card = cardRefs.current[idx]
      if (!card) return
      const slotIdx = (idx - active + DESTINATION_CARDS.length) % DESTINATION_CARDS.length
      const slot = SLOTS[slotIdx]
      gsap.set(card, {
        x: 0,
        y: slot.y,
        scale: slot.scale,
        rotation: slot.rotation,
        opacity: slot.opacity,
        zIndex: slot.zIndex,
      })
    })
  }, [])

  // Initial layout on mount
  useEffect(() => {
    applySlotPositions(0)
  }, [applySlotPositions])

  // Smooth deck shuffle transition using GSAP with zero flicker
  const handleNext = useCallback(() => {
    if (isAnimatingRef.current) return
    isAnimatingRef.current = true

    const total = DESTINATION_CARDS.length
    const topIdx = activeIndex
    const nextIdx = (activeIndex + 1) % total
    const backIdx = (activeIndex + 2) % total

    const topCard = cardRefs.current[topIdx]
    const nextCard = cardRefs.current[nextIdx]
    const backCard = cardRefs.current[backIdx]

    if (!topCard || !nextCard || !backCard) {
      setActiveIndex(nextIdx)
      isAnimatingRef.current = false
      return
    }

    const tl = gsap.timeline({
      onComplete: () => {
        // Update active index in React state and set final slot positions smoothly
        setActiveIndex(nextIdx)
        applySlotPositions(nextIdx)
        isAnimatingRef.current = false
      },
    })

    // 1. Current top card peels smoothly out to the right with gentle tilt
    tl.to(topCard, {
      x: 75,
      y: -10,
      rotation: 10,
      scale: 0.96,
      opacity: 0.85,
      duration: 0.22,
      ease: 'power2.out',
    })

    // 2. Next card steps forward to Slot 0 (hero)
    tl.to(
      nextCard,
      {
        x: 0,
        y: SLOTS[0].y,
        rotation: SLOTS[0].rotation,
        scale: SLOTS[0].scale,
        opacity: SLOTS[0].opacity,
        zIndex: SLOTS[0].zIndex,
        duration: 0.38,
        ease: 'power3.out',
      },
      0.08
    )

    // 3. Back card steps up to Slot 1 (middle)
    tl.to(
      backCard,
      {
        x: 0,
        y: SLOTS[1].y,
        rotation: SLOTS[1].rotation,
        scale: SLOTS[1].scale,
        opacity: SLOTS[1].opacity,
        zIndex: SLOTS[1].zIndex,
        duration: 0.38,
        ease: 'power3.out',
      },
      0.08
    )

    // 4. Peeling card ducks cleanly behind to Slot 2 (back)
    tl.set(topCard, { zIndex: SLOTS[2].zIndex }, 0.22)
    tl.to(
      topCard,
      {
        x: 0,
        y: SLOTS[2].y,
        rotation: SLOTS[2].rotation,
        scale: SLOTS[2].scale,
        opacity: SLOTS[2].opacity,
        duration: 0.22,
        ease: 'power2.inOut',
      },
      0.22
    )
  }, [activeIndex, applySlotPositions])

  // Parallax scroll on deck container
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || !containerRef.current || !deckRef.current) return

    const ctx = gsap.context(() => {
      gsap.to(deckRef.current, {
        y: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 75%',
          end: 'bottom 15%',
          scrub: 1.2,
        },
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
      {/* Subtle backdrop ambient glow */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-emerald-950/40 via-emerald-900/20 to-transparent rounded-3xl blur-2xl pointer-events-none" />

      {/* Stacked Cards Container - click anywhere to shuffle to next card */}
      <div
        ref={deckRef}
        onClick={handleNext}
        className="relative w-full aspect-[4/5] sm:aspect-[4/4.8] max-h-[460px] flex items-center justify-center cursor-pointer group outline-none"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        {DESTINATION_CARDS.map((card, index) => {
          const offset = (index - activeIndex + DESTINATION_CARDS.length) % DESTINATION_CARDS.length
          const isTop = offset === 0

          return (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleNext()
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`View ${card.title}. Tap to see next.`}
              style={{
                WebkitTapHighlightColor: 'transparent',
                outline: 'none',
              }}
              className={`absolute inset-0 rounded-2xl overflow-hidden shadow-2xl focus:outline-none focus:ring-0 active:outline-none border-0 ${
                isTop
                  ? 'shadow-[0_25px_50px_rgba(0,0,0,0.85)]'
                  : 'shadow-[0_15px_35px_rgba(0,0,0,0.6)]'
              } bg-brand-dark`}
            >
              {/* Card Photo */}
              <img
                src={card.image}
                alt={card.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center transition-transform duration-700 pointer-events-none select-none"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-transparent opacity-90 pointer-events-none" />

              {/* Card Top Badge - Clean text, no emoji, no border */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] sm:text-xs font-medium text-white/90 shadow-md">
                <span>{card.badge}</span>
              </div>

              {/* Card Bottom Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 space-y-1.5 text-left">
                <div className="flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-300/90">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{card.location}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide leading-tight drop-shadow-sm">
                  {card.title}
                </h3>

                <p className="text-xs text-gray-200/90 line-clamp-2 font-normal leading-relaxed">
                  {card.subhead}
                </p>

                {/* Constant height bottom link container - opacity fades in/out without layout jump */}
                <div
                  className={`pt-2 flex items-center justify-between transition-opacity duration-300 ${
                    isTop ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <Link
                    to="/packages"
                    onClick={(e) => e.stopPropagation()}
                    tabIndex={isTop ? 0 : -1}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white transition-colors group/link"
                  >
                    <span>Explore Packages</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Minimal Stack Indicators */}
      <div className="mt-4 sm:mt-5 flex items-center justify-center w-full max-w-sm px-2">
        <div className="flex items-center gap-2" role="tablist" aria-label="Card selection">
          {DESTINATION_CARDS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                if (isAnimatingRef.current || idx === activeIndex) return
                setActiveIndex(idx)
                applySlotPositions(idx)
              }}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
