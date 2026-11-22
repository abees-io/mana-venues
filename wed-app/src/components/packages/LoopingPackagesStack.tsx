import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Users } from 'lucide-react'
import type { WeddingPackage } from '../../store/packagesStore'

interface LoopingPackagesStackProps {
  packages: WeddingPackage[]
  activeIndex: number
  onActiveIndexChange: (index: number) => void
  onSelectPackage?: (pkgId: string) => void
}

export default function LoopingPackagesStack({
  packages,
  activeIndex,
  onActiveIndexChange,
  onSelectPackage,
}: LoopingPackagesStackProps) {
  const [isAutoPlaying] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const total = packages.length

  // Keep a ref to activeIndex so the autoplay interval never stales
  const activeIndexRef = useRef(activeIndex)
  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const handleNext = useCallback(() => {
    if (total <= 1) return
    onActiveIndexChange((activeIndexRef.current + 1) % total)
  }, [total, onActiveIndexChange])

  const handlePrev = useCallback(() => {
    if (total <= 1) return
    onActiveIndexChange((activeIndexRef.current - 1 + total) % total)
  }, [total, onActiveIndexChange])

  // Automatic looping: advances every 10 seconds with a stable interval (no restart on each step)
  useEffect(() => {
    if (!isAutoPlaying || isHovered || total <= 1) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
      return
    }

    autoPlayTimerRef.current = setInterval(() => {
      onActiveIndexChange((activeIndexRef.current + 1) % total)
    }, 10000)

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current)
    }
  }, [isAutoPlaying, isHovered, total, onActiveIndexChange])

  // Touch swipe support on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0]?.clientX ?? null
    setIsHovered(true)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsHovered(false)
    if (touchStartXRef.current === null) return
    const diff = e.changedTouches[0]?.clientX - touchStartXRef.current
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        handleNext()
      } else {
        handlePrev()
      }
    }
    touchStartXRef.current = null
  }

  return (
    <div
      className="relative w-full max-w-5xl mx-auto py-2 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Coverflow Stage Container */}
      <div
        className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] flex items-center justify-center overflow-hidden py-4"
        style={{ perspective: '1100px' }}
      >
        {packages.map((pkg, index) => {
          // Circular relative offset calculation
          let diff = (index - activeIndex) % total
          if (diff > total / 2) diff -= total
          if (diff < -total / 2) diff += total

          const isCenter = diff === 0
          const isLeft = diff === -1
          const isRight = diff === 1

          // Compute 3D Stage styles
          let transformStyle = ''
          let zIndex = 10
          let opacity = 0
          let pointerEvents: 'auto' | 'none' = 'none'

          if (isCenter) {
            transformStyle = 'translateX(0%) scale(1) translateZ(0) rotateY(0deg)'
            zIndex = 30
            opacity = 1
            pointerEvents = 'auto'
          } else if (isLeft) {
            transformStyle = 'translateX(-58%) scale(0.84) translateZ(-80px) rotateY(16deg)'
            zIndex = 20
            opacity = 0.65
            pointerEvents = 'auto'
          } else if (isRight) {
            transformStyle = 'translateX(58%) scale(0.84) translateZ(-80px) rotateY(-16deg)'
            zIndex = 20
            opacity = 0.65
            pointerEvents = 'auto'
          } else {
            transformStyle = `translateX(${diff > 0 ? '90%' : '-90%'}) scale(0.7) translateZ(-160px) rotateY(${diff > 0 ? '-25deg' : '25deg'
              })`
            zIndex = 10
            opacity = 0
            pointerEvents = 'none'
          }

          return (
            <div
              key={pkg.id}
              onClick={() => {
                if (isCenter) {
                  if (onSelectPackage) onSelectPackage(pkg.id)
                } else {
                  onActiveIndexChange(index)
                }
              }}
              className={`absolute top-0 w-[84%] sm:w-[68%] md:w-[54%] max-w-[460px] aspect-[16/10] sm:aspect-[16/10.5] rounded-3xl overflow-hidden cursor-pointer select-none transition-all duration-500 ease-out will-change-[transform,opacity] transform-gpu border border-[#D8F0EC] shadow-xl`}
              style={{
                transform: transformStyle,
                zIndex,
                opacity,
                pointerEvents,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {/* Cover Photo */}
              <img
                src={pkg.image}
                alt={pkg.title}
                loading={isCenter ? 'eager' : 'lazy'}
                className="w-full h-full object-cover object-center pointer-events-none select-none transition-transform duration-700 group-hover:scale-105"
              />

              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10 pointer-events-none" />

              {/* Top Left Experience Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white/95 border border-white/20 shadow-md pointer-events-none">
                <span>{pkg.backdrop} Experience</span>
              </div>

              {/* Bottom Details on Card */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 text-left pointer-events-none space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F0F9F8]">
                  <MapPin className="w-3.5 h-3.5 text-[#F3A2BE] shrink-0" />
                  <span className="truncate">{pkg.location}</span>
                </div>

                <h3
                  className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-white via-[#FCE7ED] to-white bg-clip-text text-transparent drop-shadow-md tracking-wide leading-tight line-clamp-2"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {pkg.title}
                </h3>

                <div className="pt-1 flex items-center justify-between text-[11px] text-white/80">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#F3A2BE]" />
                    <span>{pkg.guestCapacity}</span>
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
