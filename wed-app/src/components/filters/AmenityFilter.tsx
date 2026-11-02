import type { ElementType } from 'react'
import { Wind, ParkingSquare, UtensilsCrossed, Sparkles, Zap } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { cn } from '../../lib/utils'

export const AMENITIES = ['AC', 'Parking', 'Catering', 'Stage Decor', 'Generator'] as const

interface AmenityConfig {
  name: (typeof AMENITIES)[number]
  icon: ElementType
}

const AMENITY_CONFIGS: AmenityConfig[] = [
  { name: 'AC', icon: Wind },
  { name: 'Parking', icon: ParkingSquare },
  { name: 'Catering', icon: UtensilsCrossed },
  { name: 'Stage Decor', icon: Sparkles },
  { name: 'Generator', icon: Zap },
]

export default function AmenityFilter() {
  const selectedAmenities = useFilterStore((state) => state.amenities)
  const toggleAmenity = useFilterStore((state) => state.toggleAmenity)

  return (
    <div className="space-y-1.5">
      {AMENITY_CONFIGS.map(({ name, icon: Icon }) => {
        const isChecked = selectedAmenities.includes(name)

        return (
          <label
            key={name}
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors',
              isChecked
                ? 'bg-brand-accent/60 text-brand-primary'
                : 'text-gray-700 hover:bg-gray-50'
            )}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleAmenity(name)}
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary h-4 w-4"
            />
            <Icon
              className={cn(
                'w-4 h-4 shrink-0 transition-colors',
                isChecked ? 'text-brand-primary' : 'text-gray-500'
              )}
            />
            <span className="flex-1 select-none">{name}</span>
          </label>
        )
      })}
    </div>
  )
}
