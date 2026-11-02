import { useEffect } from 'react'
import { MapPin, X, Check, RefreshCw } from 'lucide-react'
import { useCities } from '../../hooks/useCities'
import { useCityStore } from '../../store/cityStore'
import type { City } from '../../lib/types'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { data: cities, isLoading, isError, refetch } = useCities()
  const { selectedCity, setCity } = useCityStore()

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelectCity = (city: City) => {
    setCity({
      id: city.id,
      name: city.name,
      slug: city.slug,
    })
    onClose()
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative transform transition-all duration-200 ease-out translate-y-0 opacity-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="location-modal-title"
                className="text-lg font-bold text-brand-dark"
              >
                Choose Your City
              </h2>
              <p className="text-xs text-gray-500">Find wedding venues in Kerala</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {isLoading && (
            <div className="space-y-3 py-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-24 h-4 bg-gray-200 rounded" />
                    <div className="w-16 h-3 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-red-500 font-medium">Failed to load cities</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-primary bg-brand-accent hover:bg-pink-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && cities && cities.length === 0 && (
            <p className="text-sm text-center text-gray-500 py-6">
              No active cities found.
            </p>
          )}

          {!isLoading &&
            !isError &&
            cities &&
            cities.map((city) => {
              const isSelected = selectedCity?.id === city.id || selectedCity?.slug === city.slug
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-brand-accent border border-brand-primary/30 text-brand-primary'
                      : 'hover:bg-gray-50 text-gray-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-brand-primary text-white'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{city.name}</p>
                      <p className="text-xs text-gray-400">{city.state}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-primary shrink-0" />
                  )}
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )
}
