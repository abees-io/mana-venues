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
    <div className="space-y-5">
      <div>
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
          Guest Capacity
        </h3>
        <CapacityFilter />
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
          Daily Budget
        </h3>
        <PriceRangeSlider />
      </div>

      <hr className="border-gray-200" />

      <div>
        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2.5">
          Amenities
        </h3>
        <AmenityFilter />
      </div>

      <hr className="border-gray-200" />

      <button
        type="button"
        onClick={resetFilters}
        className="w-full py-2 px-3 text-xs font-semibold text-brand-primary border border-brand-primary/30 rounded-lg hover:bg-brand-accent/50 transition-colors cursor-pointer"
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
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Drawer slide-in panel from left */}
        <div className="fixed inset-y-0 left-0 max-w-[85vw] w-80 bg-white shadow-2xl flex flex-col z-10">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-brand-dark">Filters</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            {filterContent}
          </div>

          {onClose && (
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors cursor-pointer shadow-xs"
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
    <aside className="sticky top-24 w-72 shrink-0 bg-white rounded-xl p-5 border border-gray-100 shadow-sm self-start">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
        <h2 className="text-base font-bold text-brand-dark">Filters</h2>
      </div>
      {filterContent}
    </aside>
  )
}
