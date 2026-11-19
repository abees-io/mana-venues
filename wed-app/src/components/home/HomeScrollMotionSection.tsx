import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HomeScrollMotionSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const kineticLineRef = useRef<SVGPathElement>(null)
  const topTextRef = useRef<HTMLDivElement>(null)

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

      // 2. Bold kinetic line motion animation on scroll
      // Ensure initial state is strictly hidden at app start
      if (kineticLineRef.current) {
        gsap.set(kineticLineRef.current, {
          opacity: 0,
          strokeDashoffset: 2100,
          strokeDasharray: 2100,
        })
      }

      const motionTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          // Start drawing only after user scrolls down and hero moves up
          start: 'top 45%',
          end: 'bottom 20%',
          scrub: 1,
          onUpdate: (self) => {
            if (!kineticLineRef.current) return
            // Strictly hide if at top of page or before scroll trigger threshold
            if (window.scrollY < 20 || self.progress <= 0.005) {
              kineticLineRef.current.style.opacity = '0'
            } else {
              kineticLineRef.current.style.opacity = '1'
            }
          },
          onLeaveBack: () => {
            if (kineticLineRef.current) {
              kineticLineRef.current.style.opacity = '0'
              gsap.set(kineticLineRef.current, { strokeDashoffset: 2100 })
            }
          },
        },
      })

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
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div
      ref={containerRef}
      className="editorial-quote-section editorial-quote-card max-w-6xl mx-auto px-2 sm:px-6 pt-2 sm:pt-6 pb-2 sm:pb-4 relative overflow-visible"
    >
      {/* TOP TEXT: "we connect" & "we elevate" — RIGHT SIDE */}
      <div className="flex flex-col items-end text-right w-full mb-0">
        <div className="relative pr-2 sm:pr-3 border-r-3 sm:border-r-4 border-[#C83B68]">
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

      {/* SINGLE BOLD KINETIC MOTION LINE */}
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
            style={{ opacity: 0, transition: 'opacity 0.25s ease' }}
          />
        </svg>
      </div>
    </div>
  )
}
