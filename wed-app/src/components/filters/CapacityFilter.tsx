import { useFilterStore } from '../../store/filterStore'
import { cn } from '../../lib/utils'

interface CapacityPreset {
  label: string
  min: number
  max: number
}

const CAPACITY_PRESETS: CapacityPreset[] = [
  { label: 'Any', min: 0, max: 5000 },
  { label: 'Up to 500', min: 0, max: 500 },
  { label: '500–1,000', min: 500, max: 1000 },
  { label: '1,000–2,000', min: 1000, max: 2000 },
  { label: '2,000+', min: 2000, max: 5000 },
]

export default function CapacityFilter() {
  const capacityMin = useFilterStore((state) => state.capacityMin)
  const capacityMax = useFilterStore((state) => state.capacityMax)
  const setCapacityRange = useFilterStore((state) => state.setCapacityRange)

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {CAPACITY_PRESETS.map((preset) => {
          const isActive = capacityMin === preset.min && capacityMax === preset.max

          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => setCapacityRange(preset.min, preset.max)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer',
                isActive
                  ? 'bg-brand-primary text-white shadow-xs'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
