import { Check, MapPin } from 'lucide-react'
import { useCities, KERALA_DISTRICTS_CITIES } from '../../hooks/useCities'

interface MultiCitySelectorProps {
  selectedCities: string[]
  onChange: (cities: string[]) => void
  theme?: 'dark' | 'light'
  label?: string
  required?: boolean
}

/**
 * Multi-city selector allowing vendors/admins to assign one or more service cities to a package.
 */
export function MultiCitySelector({
  selectedCities,
  onChange,
  theme = 'light',
  label = 'Available Service Cities (Select one or more)',
  required = true,
}: MultiCitySelectorProps) {
  const { data: dbCities } = useCities()
  const allCities = (dbCities && dbCities.length > 0 ? dbCities : KERALA_DISTRICTS_CITIES).filter(
    (c) => c.slug.toLowerCase() !== 'all-kerala' && c.name.toLowerCase() !== 'all kerala'
  )

  const allSlugs = allCities.map((c) => c.slug)
  const isAllSelected = allSlugs.length > 0 && allSlugs.every((s) => selectedCities.includes(s))

  const toggleCity = (slug: string) => {
    if (selectedCities.includes(slug)) {
      onChange(selectedCities.filter((c) => c !== slug))
    } else {
      onChange([...selectedCities, slug])
    }
  }

  const handleToggleAll = () => {
    if (isAllSelected) {
      onChange([])
    } else {
      onChange(allSlugs)
    }
  }

  const isDark = theme === 'dark'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
        <label
          className={`flex items-center gap-1.5 text-xs font-semibold ${
            isDark ? 'text-emerald-200' : 'text-black/80 font-bold'
          }`}
        >
          <MapPin className={`w-3.5 h-3.5 ${isDark ? 'text-brand-secondary' : 'text-[#C83B68]'}`} />
          <span>
            {label} {required && '*'}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium ${isDark ? 'text-emerald-300/80' : 'text-gray-500'}`}>
            {selectedCities.length} {selectedCities.length === 1 ? 'city' : 'cities'} selected
          </span>
          <button
            type="button"
            onClick={handleToggleAll}
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
              isDark
                ? 'bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/50'
                : 'bg-[#FFF2F6] hover:bg-[#FCE4EC] text-[#C83B68] border border-[#F3A2BE]/40'
            }`}
          >
            {isAllSelected ? 'Clear All' : 'Select All'}
          </button>
        </div>
      </div>

      <div
        className={`flex flex-wrap gap-1.5 p-2.5 rounded-xl border ${
          isDark
            ? 'bg-emerald-950/50 border-emerald-700/50'
            : 'bg-gray-50/80 border-gray-200'
        }`}
      >
        {allCities.map((city) => {
          const isSelected = selectedCities.some(
            (s) => s.toLowerCase() === city.slug.toLowerCase() || s.toLowerCase() === city.name.toLowerCase()
          )
          const displayName = city.name.replace(/\s*\(.*?\)\s*/g, '').trim()

          return (
            <button
              key={city.id || city.slug}
              type="button"
              onClick={() => toggleCity(city.slug)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? isDark
                    ? 'bg-brand-secondary text-brand-dark border-brand-secondary font-bold shadow-xs'
                    : 'bg-[#C83B68] text-white border-[#C83B68] font-bold shadow-xs'
                  : isDark
                    ? 'bg-emerald-950/80 text-emerald-100/80 border-emerald-800/70 hover:border-brand-secondary/60'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#C83B68]/50 hover:text-[#C83B68]'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
              <span>{displayName}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
