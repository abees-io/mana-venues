import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Users,
  Phone,
  Navigation,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import type { Auditorium } from '../../lib/types'

export type AuditoriumWithCity = Auditorium & {
  phone_number?: string | null
  starting_price?: number
  capacity?: number
  district?: string
  city?: string | null
  is_verified?: boolean
  distanceKm?: number | null
  cities?: {
    id: string
    name: string
    slug: string
    state: string
  } | null
}

interface AuditoriumCardProps {
  auditorium: AuditoriumWithCity
}

// Authentic verified Kerala venue photo from Google Maps (Lulu International Convention Centre grand facade)
const REAL_KERALA_VENUE_FALLBACK =
  'https://lh3.googleusercontent.com/grass-cs/AABkmLcj_nOY8Dm-Un6PXO717C4ArfxK8ssVjVWx200pqughg6ccY8gMYKo9TKiUW4-sCIykVhdHC19Hq7_S3qZF0wkTI2ubQmsACduJtlS0hwR2Ug7cr2zYOrP8VUoiw82VJ5JLyqdNiVMG6lWS=w1200-h800-k-no'

export default function AuditoriumCard({ auditorium }: AuditoriumCardProps) {
  // Use strictly REAL venue photos from Google Maps (zero AI or Unsplash stock photos)
  const photosList = useMemo(() => {
    if (auditorium.photos && auditorium.photos.length > 0) {
      const valid = auditorium.photos.filter(
        (p): p is string =>
          typeof p === 'string' &&
          p.trim().length > 0 &&
          !p.includes('unsplash.com') &&
          !p.includes('placeholder')
      )
      if (valid.length > 0) return valid
    }
    return [REAL_KERALA_VENUE_FALLBACK]
  }, [auditorium.photos])

  const [photoIndex, setPhotoIndex] = useState(0)
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    setPhotoIndex(0)
    setFailedIndices(new Set())
  }, [auditorium.id, auditorium.slug])

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPhotoIndex((prev) => (prev === 0 ? photosList.length - 1 : prev - 1))
  }

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setPhotoIndex((prev) => (prev === photosList.length - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (e: React.MouseEvent, idx: number) => {
    e.preventDefault()
    e.stopPropagation()
    setPhotoIndex(idx)
  }

  const handleImageError = () => {
    setFailedIndices((prev) => new Set(prev).add(photoIndex))
  }

  const activePhoto = failedIndices.has(photoIndex)
    ? REAL_KERALA_VENUE_FALLBACK
    : photosList[photoIndex] || REAL_KERALA_VENUE_FALLBACK

  const cityDisplay =
    auditorium.address ||
    (auditorium.cities
      ? `${auditorium.cities.name}, ${auditorium.cities.state}`
      : auditorium.district
      ? `${auditorium.city || auditorium.district}, Kerala`
      : 'Kerala')

  const amenities = auditorium.amenities ?? []
  const visibleAmenities = amenities.slice(0, 3)
  const remainingCount = amenities.length - 3
  const capacityValue = auditorium.seating_capacity || auditorium.capacity || 500

  return (
    <Link
      to={`/auditorium/${auditorium.slug}`}
      className="auditorium-card group block bg-brand-dark/85 backdrop-blur-md rounded-xl overflow-hidden border border-green-800/40 shadow-xl hover:shadow-2xl hover:border-brand-secondary/50 hover:-translate-y-1 transition-all duration-200"
    >
      {/* 16:9 Thumbnail Header with In-Place Photo Gallery */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-dark/90 group/img">
        <img
          src={activePhoto}
          alt={`${auditorium.title || auditorium.name} - Photo ${photoIndex + 1}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Next / Prev Photo Controls for venues with multiple authentic photos */}
        {photosList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              title="Previous photo"
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-brand-dark/85 hover:bg-brand-secondary text-green-100 hover:text-brand-dark flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-150 shadow-lg backdrop-blur-xs z-20 border border-green-700/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              title="Next photo"
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-brand-dark/85 hover:bg-brand-secondary text-green-100 hover:text-brand-dark flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-150 shadow-lg backdrop-blur-xs z-20 border border-green-700/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Photo Counter Pill */}
            <div className="absolute bottom-2.5 right-3 flex items-center z-10 bg-brand-dark/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-green-700/60 shadow-md">
              <span className="text-[10px] font-bold text-green-100">
                {photoIndex + 1}/{photosList.length}
              </span>
            </div>

            {/* Interactive Dot Indicators */}
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
              {photosList.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => handleDotClick(e, idx)}
                  aria-label={`Jump to photo ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === photoIndex
                      ? 'w-4 bg-brand-secondary'
                      : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* District badge */}
        {auditorium.district && (
          <div className="absolute top-3 left-3 bg-brand-dark/90 backdrop-blur-xs text-green-100 border border-green-700/50 text-xs px-2.5 py-1 rounded-full font-medium shadow-sm z-10">
            <span>{auditorium.district}</span>
          </div>
        )}

        {/* Capacity badge */}
        <div className="absolute top-3 right-3 bg-brand-dark/90 backdrop-blur-xs text-brand-secondary border border-green-700/50 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm z-10">
          <Users className="w-3.5 h-3.5" />
          <span>{capacityValue.toLocaleString('en-IN')} guests</span>
        </div>

        {/* Distance Proximity badge (Near Me active) */}
        {auditorium.distanceKm !== undefined && auditorium.distanceKm !== null && (
          <div className="absolute bottom-2.5 left-3 bg-brand-dark/95 backdrop-blur-xs text-brand-secondary border border-green-700/60 text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-md z-10">
            <Navigation className="w-3 h-3 fill-current" />
            <span>
              {auditorium.distanceKm < 1
                ? `${Math.round(auditorium.distanceKm * 1000)} m away`
                : `${auditorium.distanceKm.toFixed(1)} km away`}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-green-50 truncate group-hover:text-brand-secondary transition-colors">
          {auditorium.title || auditorium.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-green-200/70">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-secondary/80" />
          <span className="truncate">{cityDisplay}</span>
        </div>

        {/* Amenities Chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {visibleAmenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-green-900/40 text-brand-secondary border border-green-700/40 truncate max-w-[120px]"
              >
                {amenity}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-green-950/60 text-green-300/70 border border-green-800/40">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer: View Details & Contact CTA */}
        <div className="pt-2.5 border-t border-green-900/40 flex items-center justify-between">
          <span className="text-xs text-brand-secondary font-semibold group-hover:text-yellow-400 transition-colors flex items-center gap-1">
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>

          {auditorium.phone_number && (
            <a
              href={`tel:${auditorium.phone_number}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Venue</span>
            </a>
          )}
        </div>
      </div>
    </Link>
  )
}
