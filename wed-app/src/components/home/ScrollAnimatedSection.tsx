import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const MARQUEE_ITEMS = [
  'GRAND VENUES FOR YOUR BIG DAYS',
  '100% VERIFIED WEDDING AUDITORIUMS',
  'HERITAGE CONVENTION CENTRES',
  'DIRECT TRANSPARENT RATES',
  "KERALA'S PREMIER CELEBRATION SPACES",
  'SEAMLESS ADVANCE BOOKING',
  'LUXURY BALLROOMS AND BANQUETS',
  'ZERO BROKERAGE AND DIRECT RESERVATION',
]

export default function ScrollAnimatedSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (titleRef.current) {
        gsap.from(titleRef.current, {
          y: 30,
          opacity: 0,
          duration: 0.85,
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
          y: 22,
          opacity: 0,
          duration: 0.75,
          delay: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: descRef.current,
            start: 'top 90%',
            toggleActions: 'play none none reverse',
          },
        })
      }

      if (statsRef.current) {
        gsap.from('.stat-item', {
          y: 18,
          opacity: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: statsRef.current,
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
      {/* Static ticker ribbon */}
      <div className="bg-brand-dark border-y border-brand-secondary/15 py-3 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-brand-dark to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-brand-dark to-transparent z-10 pointer-events-none" />

        <div className="flex whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, idx) => (
            <div key={idx} className="inline-flex items-center gap-5 px-5">
              <span
                className="text-[10px] font-medium tracking-[0.22em] text-neutral-500 uppercase"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {text}
              </span>
              <span className="block w-1 h-1 bg-brand-secondary/50 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Editorial section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-brand-secondary font-medium">
            Curated Wedding Excellence
          </p>

          <div className="flex items-center justify-center gap-4">
            <span className="block h-px w-8 bg-brand-secondary/30" />
            <span className="block w-1 h-1 bg-brand-secondary/50" />
            <span className="block h-px w-8 bg-brand-secondary/30" />
          </div>

          <h2
            ref={titleRef}
            className="text-2xl sm:text-3xl md:text-[2.25rem] font-semibold text-brand-dark tracking-[0.04em] leading-snug"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Where Every Beginning<br />
            <span className="text-brand-secondary">Becomes a Royal Celebration</span>
          </h2>

          <p
            ref={descRef}
            className="text-sm text-neutral-500 max-w-2xl mx-auto font-light leading-loose"
          >
            From heritage palaces in Trivandrum and waterfront halls in Kochi to grand
            convention centres in Kozhikode, MANA Venues handpicks and verifies
            Kerala's most distinguished spaces for your most important milestones.
          </p>

          {/* Stats row — verified numbers, no fake testimonials */}
          <div ref={statsRef} className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 mt-2 border-t border-neutral-100">
            {[
              { value: '150+', label: 'Verified Venues' },
              { value: '12', label: 'Cities Covered' },
              { value: '0', label: 'Brokerage Fees' },
            ].map((stat) => (
              <div key={stat.label} className="stat-item text-center space-y-1">
                <p
                  className="text-xl sm:text-2xl font-semibold text-brand-dark"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
