import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import type { Auditorium } from '../../lib/types'
import { formatCurrency } from '../../lib/utils'

export type AuditoriumWithCity = Auditorium & {
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

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&auto=format&fit=crop&q=60'

export default function AuditoriumCard({ auditorium }: AuditoriumCardProps) {
  const [imageSrc, setImageSrc] = useState(
    auditorium.photos && auditorium.photos.length > 0 && auditorium.photos[0]
      ? auditorium.photos[0]
      : FALLBACK_IMAGE
  )

  const cityDisplay = auditorium.cities
    ? `${auditorium.cities.name}, ${auditorium.cities.state}`
    : auditorium.address || 'Kerala'

  const amenities = auditorium.amenities ?? []
  const visibleAmenities = amenities.slice(0, 3)
  const remainingCount = amenities.length - 3

  return (
    <Link
      to={`/auditorium/${auditorium.slug}`}
      className="auditorium-card group block bg-brand-dark/85 backdrop-blur-md rounded-xl overflow-hidden border border-green-800/40 shadow-xl hover:shadow-2xl hover:border-brand-secondary/50 hover:-translate-y-1 transition-all duration-200"
    >
      {/* 16:9 Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-brand-dark/90">
        <img
          src={imageSrc}
          alt={auditorium.title}
          loading="lazy"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Capacity badge */}
        <div className="absolute top-3 right-3 bg-brand-dark/90 backdrop-blur-xs text-brand-secondary border border-green-700/50 text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
          <Users className="w-3.5 h-3.5" />
          <span>{auditorium.seating_capacity.toLocaleString('en-IN')} guests</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-green-50 truncate group-hover:text-brand-secondary transition-colors">
          {auditorium.title}
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

        {/* Price & Action */}
        <div className="pt-2 border-t border-green-900/40 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] text-green-300/60 font-normal">Starting from </span>
            <span className="text-base sm:text-lg font-bold text-brand-secondary">
              {formatCurrency(auditorium.base_price_per_day)}
            </span>
            <span className="text-xs text-green-300/60 font-normal"> / day</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
