import { X } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import CapacityFilter from './CapacityFilter'
import PriceRangeSlider from './PriceRangeSlider'
import AmenityFilter from './AmenityFilter'

export interface FilterPanelProps {
  isOpen?: boolean
  onClose?: () => void
  mode?: 'sidebar' | 'drawer'
}

export default function FilterPanel({
  isOpen = false,
  onClose,
  mode = 'sidebar',
}: FilterPanelProps) {
  const resetFilters = useFilterStore((state) => state.resetFilters)

  const filterContent = (
    <div className="space-y-5 text-white">
      <div>
        <h3 className="text-xs font-semibold text-green-300/80 uppercase tracking-wider mb-2.5">
          Guest Capacity
        </h3>
        <CapacityFilter />
      </div>

      <hr className="border-green-800/40" />

      <div>
        <h3 className="text-xs font-semibold text-green-300/80 uppercase tracking-wider mb-2.5">
          Daily Budget
        </h3>
        <PriceRangeSlider />
      </div>

      <hr className="border-green-800/40" />

      <div>
        <h3 className="text-xs font-semibold text-green-300/80 uppercase tracking-wider mb-2.5">
          Amenities
        </h3>
        <AmenityFilter />
      </div>

      <hr className="border-green-800/40" />

      <button
        type="button"
        onClick={resetFilters}
        className="w-full py-2 px-3 text-xs font-bold text-brand-secondary border border-green-700/40 rounded-lg hover:bg-green-900/40 transition-colors cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  )

  if (mode === 'drawer') {
    if (!isOpen) return null

    return (
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer slide-in panel from left */}
        <div className="fixed inset-y-0 left-0 max-w-[85vw] w-80 bg-brand-dark shadow-2xl flex flex-col z-10 border-r border-green-800/50 text-white">
          <div className="flex items-center justify-between px-5 py-4 border-b border-green-800/40">
            <h2 className="text-base font-bold text-white">Filters</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="p-1 rounded-md text-green-400 hover:text-white hover:bg-green-900/40 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {filterContent}
          </div>

          {onClose && (
            <div className="p-4 border-t border-green-800/40 bg-brand-dark/95">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-bold text-brand-dark bg-brand-secondary rounded-lg hover:bg-brand-secondary/90 transition-colors cursor-pointer shadow-xs"
              >
                Apply Filters
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Sidebar mode (desktop)
  return (
    <aside className="sticky top-24 w-72 shrink-0 bg-brand-dark/85 backdrop-blur-md rounded-xl p-5 border border-green-800/40 shadow-xl self-start text-white">
      <div className="flex items-center justify-between pb-3 border-b border-green-800/40 mb-4">
        <h2 className="text-base font-bold text-white">Filters</h2>
      </div>
      {filterContent}
    </aside>
  )
}
