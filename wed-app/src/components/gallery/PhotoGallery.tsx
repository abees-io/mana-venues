import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ChevronLeft, ChevronRight, X, ImageOff } from 'lucide-react'

interface PhotoGalleryProps {
  photos: string[]
  title: string
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  // Only keep genuinely valid Google Maps / CDN photo URLs for THIS venue
  const seen = new Set<string>()
  const displayPhotos = (photos || []).filter((p) => {
    if (
      typeof p !== 'string' ||
      !p.startsWith('http') ||
      p.includes('unsplash.com') ||
      p.includes('placeholder')
    ) return false
    const key = p.trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const hasPhotos = displayPhotos.length > 0
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const mainImageRef = useRef<HTMLImageElement>(null)

  // GSAP tween cleanup on unmount
  useEffect(() => {
    const imgEl = mainImageRef.current
    return () => {
      if (imgEl) {
        gsap.killTweensOf(imgEl)
      }
    }
  }, [])

  // Lightbox keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false)
      } else if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length)
      } else if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev + 1) % displayPhotos.length)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxOpen, displayPhotos.length])

  const handleThumbnailClick = (index: number, isMoreOverlay: boolean) => {
    if (isMoreOverlay) {
      setActiveIndex(index)
      setLightboxOpen(true)
      return
    }

    if (index === activeIndex) return

    if (mainImageRef.current) {
      gsap.to(mainImageRef.current, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          setActiveIndex(index)
          if (mainImageRef.current) {
            gsap.to(mainImageRef.current, { opacity: 1, duration: 0.3 })
          }
        },
      })
    } else {
      setActiveIndex(index)
    }
  }

  const prevPhoto = () => {
    setActiveIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length)
  }

  const nextPhoto = () => {
    setActiveIndex((prev) => (prev + 1) % displayPhotos.length)
  }

  const hasMore = displayPhotos.length > 4
  const thumbnails = displayPhotos.slice(0, 4)

  // ── No-photo state ────────────────────────────────────────────────────────────
  if (!hasPhotos) {
    return (
      <div className="space-y-3">
        <div className="relative overflow-hidden rounded-xl bg-green-950/40 group aspect-video flex flex-col items-center justify-center gap-3">
          <ImageOff className="w-16 h-16 text-green-700/40" />
          <p className="text-sm text-green-600/60 font-medium">No photos available for this venue</p>
          <p className="text-xs text-green-700/40">Photos will appear here once the venue owner uploads them</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100 group">
        <img
          ref={mainImageRef}
          src={displayPhotos[activeIndex]}
          alt={title}
          referrerPolicy="no-referrer"
          onClick={() => setLightboxOpen(true)}
          className="w-full aspect-video object-cover rounded-xl max-h-[500px] cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <div
          onClick={() => setLightboxOpen(true)}
          className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs px-3 py-1.5 rounded-lg cursor-pointer backdrop-blur-sm transition-colors"
        >
          Click to view fullscreen
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {thumbnails.map((photo, i) => {
          const isFourth = i === 3
          const showMoreOverlay = isFourth && hasMore
          const isActive = activeIndex === i

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleThumbnailClick(i, showMoreOverlay)}
              className={`relative aspect-video rounded-lg overflow-hidden transition-all focus:outline-none ${isActive ? 'ring-2 ring-brand-primary opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
            >
              <img
                src={photo}
                alt={`${title} thumbnail ${i + 1}`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {showMoreOverlay && (
                <div className="absolute inset-0 bg-black/60 hover:bg-black/70 flex items-center justify-center text-white font-semibold text-sm sm:text-base transition-colors">
                  +{displayPhotos.length - 3} more
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxOpen(false)
            }}
            aria-label="Close lightbox"
            className="absolute top-4 right-4 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Left arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prevPhoto()
            }}
            aria-label="Previous photo"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          {/* Large centered image */}
          <div
            className="relative flex items-center justify-center max-w-[90vw] max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayPhotos[activeIndex]}
              alt={`${title} ${activeIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
          </div>

          {/* Right arrow */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              nextPhoto()
            }}
            aria-label="Next photo"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white/80 hover:text-white p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Photo Counter */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
            {activeIndex + 1} / {displayPhotos.length}
          </div>
        </div>
      )}
    </div>
  )
}
