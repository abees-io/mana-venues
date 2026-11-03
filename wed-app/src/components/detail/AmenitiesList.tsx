import type { ComponentType } from 'react'
import { Wind, Car, UtensilsCrossed, Palette, Zap, CheckCircle2 } from 'lucide-react'

interface AmenitiesListProps {
  amenities: string[]
}

const AMENITY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'AC': Wind,
  'Air Conditioning': Wind,
  'Parking': Car,
  'Catering': UtensilsCrossed,
  'Stage Decor': Palette,
  'Generator': Zap,
  'Power Backup': Zap,
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  if (!amenities || amenities.length === 0) {
    return (
      <div className="bg-brand-dark/85 backdrop-blur-md rounded-xl p-5 border border-green-800/40 text-white">
        <h3 className="text-lg font-bold text-white mb-3">Amenities</h3>
        <p className="text-sm text-green-300/70 italic">No amenities listed</p>
      </div>
    )
  }

  return (
    <div className="bg-brand-dark/85 backdrop-blur-md rounded-xl p-5 border border-green-800/40 text-white shadow-xl">
      <h3 className="text-lg font-bold text-white mb-4">Amenities</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenities.map((amenity, idx) => {
          const IconComponent = AMENITY_ICONS[amenity] || CheckCircle2
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-green-950/60 border border-green-850/40 text-green-100"
            >
              <IconComponent className="w-5 h-5 text-brand-secondary shrink-0" />
              <span className="text-sm font-medium">{amenity}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
