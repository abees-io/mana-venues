import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HomeScrollMotionSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const kineticLineRef = useRef<SVGPathElement>(null)
  const topTextRef = useRef<HTMLDivElement>(null)
  const bottomTextRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Entrance reveal for top text ("we connect", "we elevate") on right side
      if (topTextRef.current) {
        gsap.fromTo(
          topTextRef.current.children,
          { opacity: 0, x: 50, filter: 'blur(3px)' },
          {
            opacity: 1,
            x: 0,
            filter: 'blur(0px)',
            duration: 0.85,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 82%',
              toggleActions: 'play none none reverse',
            },
          }
        )
      }

      // 2. Single bold kinetic line motion animation on scroll (inspired by sample video)
      const motionTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 78%',
          end: 'bottom 35%',
          scrub: 1,
        },
      })

      // Scrub the single bold kinetic stroke
      if (kineticLineRef.current) {
        motionTimeline.to(
          kineticLineRef.current,
          {
            strokeDashoffset: 0,
            ease: 'none',
          },
          0
        )
      }

      // 3. Bold sharp reveal for bottom text ("Your celebration deserves the warmth and safety of home.")
      if (bottomTextRef.current) {
        const words = bottomTextRef.current.querySelectorAll('.bold-sharp-word')
        gsap.fromTo(
          words,
          { opacity: 0.15, y: 16 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.04,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: bottomTextRef.current,
              start: 'top 85%',
              end: 'bottom 55%',
              scrub: 0.7,
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="editorial-quote-section editorial-quote-card max-w-6xl mx-auto px-2 sm:px-6 pt-2 sm:pt-6 pb-2 sm:pb-4 relative overflow-hidden"
    >
      {/* TOP TEXT: "we connect" & "we elevate" — RIGHT SIDE (OPPOSITE SIDE) */}
      <div className="flex flex-col items-end text-right w-full mb-0">
        <div className="relative pr-2 sm:pr-3 border-r-3 sm:border-r-4 border-[#C83B68]">
          {/* Minimal technical category tag */}
          <div className="flex items-center justify-end gap-2 mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-mono uppercase tracking-[0.28em] text-[#C83B68] font-bold select-none">
            <span>MANA • EDITORIAL</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E599]" />
          </div>

          <div ref={topTextRef} className="space-y-0.5 sm:space-y-1">
            <h2
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#1F2937] leading-[1.02]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              we connect
            </h2>
            <h2
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#C83B68] leading-[1.02]"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              we elevate
            </h2>
          </div>
        </div>
      </div>

      {/* SINGLE BOLD KINETIC MOTION LINE (BETWEEN THEM) */}
      <div className="-mt-3 sm:-mt-6 md:-mt-10 lg:-mt-14 my-0 relative w-full overflow-visible select-none py-0">
        <svg
          viewBox="-150 -60 1300 440"
          className="w-full h-auto max-h-[220px] sm:max-h-[280px] md:max-h-[300px] lg:max-h-[340px] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tealPinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00A8A8" />
              <stop offset="45%" stopColor="#2BB3C0" />
              <stop offset="75%" stopColor="#A8558A" />
              <stop offset="100%" stopColor="#DE3B6B" />
            </linearGradient>
            <filter id="curveShadow" x="-10%" y="-10%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
          </defs>
          <path
            ref={kineticLineRef}
            d="M -199,-30 C 132,538 692,-9 528,288 S 891,240 1175,180"
            stroke="url(#tealPinkGrad)"
            strokeWidth="100"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2100"
            strokeDashoffset="2100"
            filter="url(#curveShadow)"
          />
        </svg>
      </div>

      {/* DOWN UNDER IT: "Your celebration deserves the warmth and safety of home."
          Bold sharp typography matching the sample video */}
      <div ref={bottomTextRef} className="pt-0 -mt-2 sm:-mt-6 md:-mt-12 lg:-mt-16 max-w-5xl text-left pb-0 mb-0">
        <h3
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[#1F2937] leading-[1.08]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          {"Your celebration deserves the warmth and safety of home."
            .split(" ")
            .map((word, i) => (
              <span
                key={i}
                className={`bold-sharp-word inline-block mr-[0.24em] ${word.toLowerCase().includes('warmth') || word.toLowerCase().includes('safety')
                  ? 'text-[#C83B68] font-bold'
                  : 'text-[#1F2937]'
                  }`}
              >
                {word}
              </span>
            ))}
        </h3>
      </div>
    </div>
  )
}
