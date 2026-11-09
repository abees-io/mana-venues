import { useState, useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export const FALLBACK_PHOTOS = [
  'https://lh3.googleusercontent.com/grass-cs/AABkmLcj_nOY8Dm-Un6PXO717C4ArfxK8ssVjVWx200pqughg6ccY8gMYKo9TKiUW4-sCIykVhdHC19Hq7_S3qZF0wkTI2ubQmsACduJtlS0hwR2Ug7cr2zYOrP8VUoiw82VJ5JLyqdNiVMG6lWS=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLe-LeeGMMs6pDovu8ow6Zt2Wcm6ewnZKUBSafsgO3FDL9qrTkNPi3Q_cKepZoMauto24WmgS3b3IY0C8FLuDNy5BscXlUgmd75l3fOQGRUmKGVk-q50_m2Jr_B1nKpTeNvwJ36Kxw=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLc5sRCEi0JjWf6DbzSGzNBsXO-o67NsJ7s7Wmm7-M9QFledZnbYi5KNWdNPmLVVAIs3A8Vub7XdgpKx0DQH0Bh01oPLAAdOtYAm95xTo3-isXvG2houJKiMECZWSLvqdfEYSe6CaA=w1200-h800-k-no',
  'https://lh3.googleusercontent.com/grass-cs/AABkmLceGqLski0fWMcgEbOHkoJ6JFOBx5TN1i4-J66QSS5t8Jv-JFOPEhfPPX_O-_nBtGgyYYSzGGg2Ry2A6coeUTlt23vApu0QSaPTpNjW5GRdvnyc6gFU-IQo4Lby3Pb0u6vdRyRQ=w1200-h800-k-no',
]

interface PhotoGalleryProps {
  photos: string[]
  title: string
}

export default function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const realPhotos = (photos || []).filter(
    (p) => typeof p === 'string' && p.startsWith('http') && !p.includes('unsplash.com') && !p.includes('placeholder')
  )
  const displayPhotos = realPhotos.length > 0 ? realPhotos : FALLBACK_PHOTOS
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

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-xl bg-gray-100 group">
        <img
          ref={mainImageRef}
          src={displayPhotos[activeIndex] || FALLBACK_PHOTOS[0]}
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
              className={`relative aspect-video rounded-lg overflow-hidden transition-all focus:outline-none ${
                isActive ? 'ring-2 ring-brand-primary opacity-100' : 'opacity-70 hover:opacity-100'
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
