import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Sparkles, ShieldCheck, CalendarCheck, Crown } from 'lucide-react'

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
  const tickerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Ticker scroll velocity interaction
      if (tickerRef.current) {
        gsap.to(tickerRef.current, {
          xPercent: -15,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }

      // 2. Editorial Title reveal on scroll
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

      // 3. Description reveal on scroll
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

      // 4. Feature cards staggered reveal on scroll
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.scroll-feature-card')
        gsap.from(cards, {
          y: 50,
          opacity: 0,
          stagger: 0.18,
          duration: 0.85,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardsRef.current,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="w-full overflow-hidden">
      {/* 1. INFINITE RUNNING TEXT TICKER (MARQUEE RIBBON) */}
      <div className="bg-[#15050C] border-y border-brand-secondary/30 py-3.5 sm:py-4.5 overflow-hidden shadow-lg relative">
        {/* Subtle gold gradient edge masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#15050C] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#15050C] to-transparent z-10 pointer-events-none" />

        <div ref={tickerRef} className="flex whitespace-nowrap will-change-transform">
          {/* Loop items twice for seamless infinite effect */}
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((text, idx) => (
            <div key={idx} className="inline-flex items-center gap-6 px-4">
              <span
                className="text-xs sm:text-sm md:text-base font-semibold tracking-[0.2em] text-pink-100/90 uppercase hover:text-brand-secondary transition-colors"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {text}
              </span>
              <span className="text-brand-secondary text-xs sm:text-sm">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. EDITORIAL SCROLL REVEAL SECTION */}
      <section className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FDF0F5]/80 via-white to-brand-accent/40">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-semibold text-brand-primary uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Curated Wedding Excellence</span>
          </div>

          {/* Animated Headline */}
          <h2
            ref={titleRef}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-brand-dark tracking-tight leading-tight uppercase"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Where Every Beginning <br className="hidden sm:inline" />
            <span className="text-brand-primary">Becomes a Royal Celebration</span>
          </h2>

          {/* Animated Description */}
          <p
            ref={descRef}
            className="text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto font-light leading-relaxed"
          >
            From heritage palaces in Trivandrum and waterfront halls in Kochi to grand convention centres in Kozhikode — MANA Venues handpicks and verifies Kerala’s most majestic spaces for your unforgettable milestones.
          </p>

          {/* 3 Animated Feature Highlight Cards */}
          <div
            ref={cardsRef}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left"
          >
            <div className="scroll-feature-card bg-white p-6 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center border border-brand-primary/15">
                <Crown className="w-6 h-6 text-brand-primary" />
              </div>
              <h3
                className="text-base font-bold text-brand-dark uppercase tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Royal Proportions
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Auditoriums curated for every guest list, from intimate 300-guest gatherings to magnificent 5,000+ attendee grand ceremonies.
              </p>
            </div>

            <div className="scroll-feature-card bg-white p-6 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-brand-secondary flex items-center justify-center border border-brand-secondary/25">
                <ShieldCheck className="w-6 h-6 text-brand-secondary" />
              </div>
              <h3
                className="text-base font-bold text-brand-dark uppercase tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                100% Verified Venues
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Zero guesswork. Every auditorium is physically verified with authentic photography, transparent daily rates, and verified amenities.
              </p>
            </div>

            <div className="scroll-feature-card bg-white p-6 rounded-2xl border border-pink-100 shadow-sm hover:shadow-md transition-shadow space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <CalendarCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3
                className="text-base font-bold text-brand-dark uppercase tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Instant Date Lock
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                Real-time calendar availability. Secure your auspicious date directly with an advance payment and instant confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
