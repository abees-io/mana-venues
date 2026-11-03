import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MARQUEE_ITEMS = [
  'GRAND VENUES FOR YOUR BIG DAYS',
  '100% VERIFIED WEDDING AUDITORIUMS',
  'HERITAGE CONVENTION CENTRES',
  'DIRECT TRANSPARENT RATES',
  'KERALA\'S PREMIER CELEBRATION SPACES',
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
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 35,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (descRef.current) {
        gsap.from(descRef.current, {
          y: 25,
          opacity: 0,
          duration: 0.8,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: descRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="w-full">
      {/* ── STATIC TICKER RIBBON ─────────────────────────── */}
      <div className="bg-brand-dark border-y border-brand-secondary/20 py-3 overflow-hidden relative">
        {/* Edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />

        <div className="flex whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, idx) => (
            <div key={idx} className="inline-flex items-center gap-5 px-4">
              <span
                className="text-[10px] sm:text-xs font-medium tracking-[0.22em] text-neutral-400 uppercase"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {text}
              </span>
              <span className="text-brand-secondary text-[10px]">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── EDITORIAL SECTION ────────────────────────────── */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Eyebrow */}
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-secondary font-medium">
            Curated Wedding Excellence
          </p>

          {/* Divider */}
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-brand-secondary/30 block" />
            <span className="text-brand-secondary text-xs">✦</span>
            <span className="h-px w-8 bg-brand-secondary/30 block" />
          </div>

          {/* Headline */}
          <h2
            ref={titleRef}
            className="text-2xl sm:text-3xl md:text-4xl font-semibold text-brand-dark tracking-[0.04em] leading-snug"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Where Every Beginning<br />
            <span className="text-brand-secondary">Becomes a Royal Celebration</span>
          </h2>

          {/* Description */}
          <p
            ref={descRef}
            className="text-sm text-neutral-500 max-w-2xl mx-auto font-light leading-loose"
          >
            From heritage palaces in Trivandrum and waterfront halls in Kochi to grand
            convention centres in Kozhikode — MANA Venues handpicks and verifies
            Kerala's most majestic spaces for your unforgettable milestones.
          </p>
        </div>
      </section>
    </div>
  )
}
