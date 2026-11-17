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
  const visibleAmenities = (amenities || []).filter(
    (a) => !a.startsWith('phone:') && !a.startsWith('whatsapp:')
  )

  if (visibleAmenities.length === 0) {
    return (
      <div className="bg-[#F0F9F8] backdrop-blur-md rounded-xl p-5 border border-[#D8F0EC] text-black shadow-md">
        <h3 className="text-lg font-bold text-black mb-3">Amenities</h3>
        <p className="text-sm text-black/70 italic">No amenities listed</p>
      </div>
    )
  }

  return (
    <div className="bg-[#F0F9F8] backdrop-blur-md rounded-xl p-5 border border-[#D8F0EC] text-black shadow-md">
      <h3 className="text-lg font-bold text-black mb-4">Amenities</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {visibleAmenities.map((amenity, idx) => {
          const IconComponent = AMENITY_ICONS[amenity] || CheckCircle2
          return (
            <div
              key={idx}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white border border-[#D8F0EC] text-black"
            >
              <IconComponent className="w-5 h-5 text-[#C83B68] shrink-0" />
              <span className="text-sm font-medium">{amenity}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
