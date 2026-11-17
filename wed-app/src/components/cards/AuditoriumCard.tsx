import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Users,
  Phone,
  Navigation,
  ChevronRight,
  ChevronLeft,
  ImageOff,
} from 'lucide-react'
import type { Auditorium } from '../../lib/types'
import { filterRealPhotos, getVenueCityDisplay } from '../../lib/photoUtils'

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

export default function AuditoriumCard({ auditorium }: AuditoriumCardProps) {
  // Deduplicated real photos only — no fallback stock image, no AI images
  const photosList = useMemo(
    () => filterRealPhotos(auditorium.photos ?? []),
    [auditorium.photos],
  )

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

  // If the current photo failed AND there are other photos to try, advance automatically
  const effectiveIndex = useMemo(() => {
    if (photosList.length === 0) return -1
    for (let i = 0; i < photosList.length; i++) {
      const idx = (photoIndex + i) % photosList.length
      if (!failedIndices.has(idx)) return idx
    }
    return -1 // all failed
  }, [photoIndex, failedIndices, photosList])

  const hasPhoto = photosList.length > 0 && effectiveIndex !== -1
  const activePhoto = hasPhoto ? photosList[effectiveIndex] : null

  // City/location display — specific town preferred over generic district name
  const cityDisplay = useMemo(
    () => getVenueCityDisplay(auditorium.city, auditorium.address, auditorium.district),
    [auditorium.city, auditorium.address, auditorium.district],
  )

  const amenities = auditorium.amenities ?? []
  const visibleAmenities = amenities.slice(0, 3)
  const remainingCount = amenities.length - 3
  const capacityValue = auditorium.seating_capacity || auditorium.capacity || 500

  return (
    <Link
      to={`/auditorium/${auditorium.slug}`}
      className="auditorium-card group block bg-[#FFF2F6] hover:bg-[#FFEBF1] backdrop-blur-md rounded-2xl overflow-hidden border border-[#D8F0EC] shadow-md hover:shadow-xl hover:border-[#BBE8E0] hover:-translate-y-1 focus:outline-none focus:ring-0 active:outline-none transition-all duration-200"
    >
      {/* 16:9 Thumbnail Header with In-Place Photo Gallery */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#FDF0F4] group/img">
        {hasPhoto && activePhoto ? (
          <img
            src={activePhoto}
            alt={`${auditorium.title || auditorium.name} - Photo ${effectiveIndex + 1}`}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={handleImageError}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* No-photo placeholder — shown when venue has no real photo available */
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#F0F9F8]">
            <ImageOff className="w-10 h-10 text-[#7E1F3E]/40" />
            <span className="text-[11px] text-[#7E1F3E]/70 font-medium">No photo available</span>
          </div>
        )}

        {/* Next / Prev Photo Controls for venues with multiple authentic photos */}
        {hasPhoto && photosList.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevPhoto}
              title="Previous photo"
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#7E1F3E] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-150 shadow-md backdrop-blur-xs z-20 border border-[#D8F0EC]"
            >
              <ChevronLeft className="w-4 h-4 text-[#7E1F3E]" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              title="Next photo"
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 hover:bg-white text-[#7E1F3E] flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-150 shadow-md backdrop-blur-xs z-20 border border-[#D8F0EC]"
            >
              <ChevronRight className="w-4 h-4 text-[#7E1F3E]" />
            </button>

            {/* Photo Counter Pill */}
            <div className="absolute bottom-2.5 right-3 flex items-center z-10 bg-[#5A172D]/85 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 shadow-md">
              <span className="text-[10px] font-bold text-white">
                {effectiveIndex + 1}/{photosList.length}
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
                      ? 'w-4 bg-white'
                      : 'w-1.5 bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Capacity badge */}
        <div className="absolute top-3 right-3 bg-[#F0F9F8]/95 backdrop-blur-xs text-black border border-[#D8F0EC] text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow-sm z-10">
          <Users className="w-3.5 h-3.5 text-black" />
          <span>{capacityValue.toLocaleString('en-IN')} guests</span>
        </div>

        {/* Distance Proximity badge (Near Me active) */}
        {auditorium.distanceKm !== undefined && auditorium.distanceKm !== null && (
          <div className="absolute bottom-2.5 left-3 bg-[#F0F9F8]/95 backdrop-blur-xs text-black border border-[#D8F0EC] text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shadow-md z-10">
            <Navigation className="w-3 h-3 text-black fill-current" />
            <span>
              {auditorium.distanceKm < 1
                ? `${Math.round(auditorium.distanceKm * 1000)} m away`
                : `${auditorium.distanceKm.toFixed(1)} km away`}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2.5 bg-[#FFF2F6]">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-black truncate transition-colors">
          {auditorium.title || auditorium.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-black">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-black" />
          <span className="truncate">{cityDisplay}</span>
        </div>

        {/* Amenities Chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {visibleAmenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-[#F0F9F8] text-black border border-[#D8F0EC] truncate max-w-[120px] shadow-2xs"
              >
                {amenity}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-[#F0F9F8] text-black border border-[#D8F0EC]">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        {/* Card Footer: View Details & Contact CTA */}
        <div className="pt-2.5 border-t border-[#D8F0EC] flex items-center justify-between">
          <span className="text-xs text-black font-bold transition-colors flex items-center gap-1">
            <span>View Details</span>
            <ChevronRight className="w-3.5 h-3.5 text-black" />
          </span>

          {auditorium.phone_number && (
            <a
              href={`tel:${auditorium.phone_number}`}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-r from-[#E05A85] via-[#F3A2BE] to-[#E05A85] hover:brightness-105 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all shrink-0 active:scale-95"
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
