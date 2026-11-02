import type { ComponentType } from 'react'
import { Wind, Car, UtensilsCrossed, Sparkles, Zap, CheckCircle2 } from 'lucide-react'

interface AmenitiesListProps {
  amenities: string[]
}

const AMENITY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  'AC': Wind,
  'Air Conditioning': Wind,
  'Parking': Car,
  'Catering': UtensilsCrossed,
  'Stage Decor': Sparkles,
  'Generator': Zap,
  'Power Backup': Zap,
}

export default function AmenitiesList({ amenities }: AmenitiesListProps) {
  if (!amenities || amenities.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Amenities</h3>
        <p className="text-sm text-gray-500 italic">No amenities listed</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Amenities</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {amenities.map((amenity, idx) => {
          const IconComponent = AMENITY_ICONS[amenity] || CheckCircle2
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-800"
            >
              <IconComponent className="w-5 h-5 text-brand-primary shrink-0" />
              <span className="text-sm font-medium">{amenity}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
