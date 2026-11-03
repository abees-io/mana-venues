import { useEffect } from 'react'
import { createPortal } from 'react-dom'
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

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSelectCity = (city: City) => {
    setCity({ id: city.id, name: city.name, slug: city.slug })
    onClose()
  }

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-brand-dark/65 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white p-5 sm:p-6 max-w-sm w-full mx-auto shadow-xl relative my-auto border border-neutral-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 border border-neutral-200 flex items-center justify-center text-brand-secondary">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2
                id="location-modal-title"
                className="text-sm font-semibold text-brand-dark tracking-wide"
              >
                Choose Your City
              </h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">Find wedding venues in Kerala</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
          {/* Skeleton */}
          {isLoading && (
            <div className="space-y-1.5 py-1 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-3 p-3 bg-neutral-50">
                  <div className="w-7 h-7 bg-neutral-100 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-24 h-3.5 bg-neutral-100" />
                    <div className="w-16 h-2.5 bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-center py-8 space-y-3">
              <p className="text-xs text-red-500 font-medium">Failed to load cities</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-brand-dark border border-neutral-200 hover:border-brand-secondary transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && cities && cities.length === 0 && (
            <p className="text-xs text-center text-neutral-500 py-8">No active cities found.</p>
          )}

          {/* City list */}
          {!isLoading &&
            !isError &&
            cities?.map((city) => {
              const isSelected = selectedCity?.id === city.id || selectedCity?.slug === city.slug
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`w-full flex items-center justify-between p-3 text-left transition-colors ${
                    isSelected
                      ? 'bg-brand-dark text-white'
                      : 'hover:bg-neutral-50 text-brand-dark border border-transparent hover:border-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 flex items-center justify-center shrink-0 ${
                        isSelected ? 'text-brand-secondary' : 'text-neutral-400'
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{city.name}</p>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-neutral-400' : 'text-neutral-400'
                        }`}
                      >
                        {city.state}
                      </p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-secondary shrink-0 ml-2" />}
                </button>
              )
            })}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body)
  }
  return modalContent
}
