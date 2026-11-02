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
      className="auditorium-card group block bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
    >
      {/* 16:9 Thumbnail Header */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        <img
          src={imageSrc}
          alt={auditorium.title}
          loading="lazy"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Capacity badge */}
        <div className="absolute top-3 right-3 bg-brand-primary/90 backdrop-blur-xs text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 shadow-sm">
          <Users className="w-3.5 h-3.5" />
          <span>{auditorium.seating_capacity.toLocaleString('en-IN')} guests</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-2.5">
        {/* Title */}
        <h3 className="font-bold text-base sm:text-lg text-brand-dark truncate group-hover:text-brand-primary transition-colors">
          {auditorium.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 shrink-0 text-brand-primary/80" />
          <span className="truncate">{cityDisplay}</span>
        </div>

        {/* Amenities Chips */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {visibleAmenities.map((amenity, index) => (
              <span
                key={index}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-brand-accent text-brand-primary border border-pink-100 truncate max-w-[120px]"
              >
                {amenity}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-gray-100 text-gray-600">
                +{remainingCount} more
              </span>
            )}
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between">
          <div>
            <span className="text-[11px] text-gray-500 font-normal">Starting from </span>
            <span className="text-base sm:text-lg font-bold text-brand-primary">
              {formatCurrency(auditorium.base_price_per_day)}
            </span>
            <span className="text-xs text-gray-500 font-normal"> / day</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
