import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default function HomeScrollMotionSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mobileLineRef = useRef<SVGPathElement>(null)
  const desktopLineRef = useRef<SVGPathElement>(null)
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

      // 2. Bold kinetic line motion animation on scroll (Mobile & Desktop)
      const lines = [
        { el: mobileLineRef.current, len: 2100 },
        { el: desktopLineRef.current, len: 2800 },
      ]

      lines.forEach(({ el, len }) => {
        if (!el) return
        const actualLen = typeof el.getTotalLength === 'function' ? el.getTotalLength() : len
        gsap.set(el, {
          opacity: 0,
          strokeDashoffset: actualLen,
          strokeDasharray: actualLen,
        })
      })

      const motionTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          // Start drawing only after user scrolls down and hero moves up
          start: 'top 45%',
          end: 'bottom 20%',
          scrub: 1,
          onUpdate: (self) => {
            const isVisible = window.scrollY >= 20 && self.progress > 0.005
            lines.forEach(({ el }) => {
              if (el) el.style.opacity = isVisible ? '1' : '0'
            })
          },
          onLeaveBack: () => {
            lines.forEach(({ el, len }) => {
              if (el) {
                const actualLen = typeof el.getTotalLength === 'function' ? el.getTotalLength() : len
                el.style.opacity = '0'
                gsap.set(el, { strokeDashoffset: actualLen })
              }
            })
          },
        },
      })

      lines.forEach(({ el }) => {
        if (!el) return
        motionTimeline.to(
          el,
          {
            strokeDashoffset: 0,
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
      className="editorial-quote-section editorial-quote-card w-full max-w-[1400px] xl:max-w-[1520px] 2xl:max-w-[1680px] mx-auto px-2 sm:px-4 md:px-6 lg:px-8 pt-2 sm:pt-4 pb-0 relative overflow-visible"
    >
      {/* TOP TEXT: "we connect" & "we elevate" — Aligned right touching the border, no symbols */}
      <div className="flex flex-col items-end text-right w-full pr-1 sm:pr-2 md:pr-3 lg:pr-4 mb-0">
        <div ref={topTextRef} className="space-y-0.5 sm:space-y-1">
          <h2
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-[#1F2937] leading-[1.02]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            we connect
          </h2>
          <h2
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight text-[#f98093] leading-[1.02]"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            we elevate
          </h2>
        </div>
      </div>

      {/* MOBILE VECTOR ANIMATION (Preserved with breathing room on mobile to prevent overlapping categories) */}
      <div className="md:hidden -mt-4 sm:-mt-6 mb-6 sm:mb-8 relative w-full overflow-visible select-none py-0">
        <svg
          viewBox="-150 -60 1300 440"
          className="w-full h-auto max-h-[180px] sm:max-h-[220px] overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tealPinkGradMobile" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f98093" />
              <stop offset="45%" stopColor="#f98093" />
              <stop offset="75%" stopColor="#699407" />
              <stop offset="100%" stopColor="#699407" />
            </linearGradient>
            <filter id="curveShadowMobile" x="-10%" y="-10%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.14" />
            </filter>
          </defs>
          <path
            ref={mobileLineRef}
            d="M -199,-30 C 132,538 692,-9 528,288 S 891,240 1175,180"
            stroke="url(#tealPinkGradMobile)"
            strokeWidth="100"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2100"
            strokeDashoffset="2100"
            filter="url(#curveShadowMobile)"
            style={{ opacity: 0, transition: 'opacity 0.25s ease' }}
          />
        </svg>
      </div>

      {/* DESKTOP FULL-BLEED VECTOR ANIMATION (Tight under the text, reduced vertical room) */}
      <div className="hidden md:block w-full overflow-hidden select-none -mt-10 lg:-mt-16 py-0 pointer-events-none">
        <svg
          viewBox="0 0 1920 320"
          className="w-full h-auto min-h-[140px] max-h-[220px] lg:max-h-[260px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="tealPinkGradDesktop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f98093" />
              <stop offset="45%" stopColor="#f98093" />
              <stop offset="75%" stopColor="#699407" />
              <stop offset="100%" stopColor="#699407" />
            </linearGradient>
            <filter id="curveShadowDesktop" x="-10%" y="-10%" width="120%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#0f172a" floodOpacity="0.16" />
            </filter>
          </defs>
          <path
            ref={desktopLineRef}
            d="M -40 70 C 360 360 680 -20 1020 200 C 1340 380 1660 110 1960 170"
            stroke="url(#tealPinkGradDesktop)"
            strokeWidth="85"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="2800"
            strokeDashoffset="2800"
            filter="url(#curveShadowDesktop)"
            style={{ opacity: 0, transition: 'opacity 0.25s ease' }}
          />
        </svg>
      </div>
    </div>
  )
}
