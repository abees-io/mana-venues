import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MARQUEE_ITEMS = [
  'GRAND VENUES FOR YOUR BIG DAYS',
  '100% VERIFIED WEDDING AUDITORIUMS',
  'HERITAGE CONVENTION CENTRES',
  'DIRECT TRANSPARENT RATES',
  'KERALA’S PREMIER CELEBRATION SPACES',
  'SEAMLESS ADVANCE BOOKING',
  'LUXURY BALLROOMS & BANQUETS',
  'ZERO BROKERAGE & DIRECT RESERVATION',
]

export default function ScrollAnimatedSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Editorial Title reveal on scroll
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 45,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      // Description reveal on scroll
      if (descRef.current) {
        gsap.from(descRef.current, {
          y: 35,
          opacity: 0,
          duration: 0.9,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: descRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="w-full overflow-hidden">
      {/* 1. CONTINUOUS RUNNING TEXT TICKER (MARQUEE RIBBON) */}
      <div className="bg-brand-dark/90 border-y border-brand-secondary/30 py-2.5 sm:py-4 overflow-hidden shadow-lg relative">
        {/* Subtle gold gradient edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-24 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />

        <div className="animate-marquee whitespace-nowrap will-change-transform">
          {/* Double array ensures seamless continuous 50% loop */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, idx) => (
            <div key={idx} className="inline-flex items-center gap-3 sm:gap-6 px-3 sm:px-6">
              <span
                className="text-[11px] sm:text-sm md:text-base font-semibold tracking-[0.14em] sm:tracking-[0.2em] text-green-50/90 uppercase hover:text-brand-secondary transition-colors"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {text}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary inline-block shrink-0 opacity-80" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. EDITORIAL SCROLL REVEAL SECTION */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-brand-dark/40 to-transparent">
        <div className="max-w-4xl mx-auto text-center space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-green-900/40 border border-green-700/40 text-xs font-semibold text-brand-secondary uppercase tracking-wider">
            <span>Curated Wedding Excellence</span>
          </div>

          {/* Animated Headline */}
          <h2
            ref={titleRef}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Where Every Beginning <br className="hidden sm:inline" />
            <span className="text-brand-secondary">Becomes a Royal Celebration</span>
          </h2>

          {/* Animated Description */}
          <p
            ref={descRef}
            className="text-sm sm:text-base text-green-100/80 max-w-2xl mx-auto font-light leading-relaxed"
          >
            From heritage palaces in Trivandrum and waterfront halls in Kochi to grand convention centres in Kozhikode — MANA Venues handpicks and verifies Kerala’s most majestic spaces for your unforgettable milestones.
          </p>
        </div>
      </section>
    </div>
  )
}
