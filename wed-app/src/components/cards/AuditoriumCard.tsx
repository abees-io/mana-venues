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
      className="auditorium-card group block bg-white border border-neutral-100 hover:border-brand-secondary/50 transition-colors duration-200"
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
        <img
          src={imageSrc}
          alt={auditorium.title}
          loading="lazy"
          onError={() => setImageSrc(FALLBACK_IMAGE)}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
        />
        {/* Capacity — flat dark chip */}
        <div className="absolute top-3 right-3 bg-brand-dark/85 text-white text-[10px] px-2.5 py-1 flex items-center gap-1.5 font-medium tracking-wide">
          <Users className="w-3 h-3" />
          {auditorium.seating_capacity.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 space-y-3">
        <h3
          className="font-semibold text-sm sm:text-[15px] text-brand-dark truncate group-hover:text-brand-secondary transition-colors"
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.03em' }}
        >
          {auditorium.title}
        </h3>

        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <MapPin className="w-3 h-3 shrink-0 text-brand-secondary/70" />
          <span className="truncate">{cityDisplay}</span>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {visibleAmenities.map((amenity, i) => (
              <span
                key={i}
                className="px-2 py-0.5 text-[10px] font-medium border border-neutral-100 text-neutral-500 tracking-wide"
              >
                {amenity}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="text-[10px] text-neutral-400">+{remainingCount} more</span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="pt-3 border-t border-neutral-100 flex items-baseline justify-between">
          <div>
            <span className="text-[10px] text-neutral-400 font-light uppercase tracking-wider">From </span>
            <span
              className="text-sm sm:text-base font-semibold text-brand-dark"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {formatCurrency(auditorium.base_price_per_day)}
            </span>
            <span className="text-[10px] text-neutral-400 font-light"> / day</span>
          </div>
          <span className="text-[10px] uppercase tracking-widest text-brand-secondary font-medium">
            View
          </span>
        </div>
      </div>
    </Link>
  )
}
