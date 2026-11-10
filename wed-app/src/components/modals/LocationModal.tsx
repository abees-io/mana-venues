import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, X, Check, RefreshCw, Search } from 'lucide-react'
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
  const [searchTerm, setSearchTerm] = useState('')

  // Close on Escape key press and prevent body scroll
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  const filteredCities = useMemo(() => {
    if (!cities) return []
    // Filter out any accidental "All Kerala" entry
    const validCities = cities.filter(
      (c) => c.slug.toLowerCase() !== 'all-kerala' && c.name.toLowerCase() !== 'all kerala'
    )
    if (!searchTerm.trim()) return validCities
    const term = searchTerm.toLowerCase().trim()
    return validCities.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        c.state?.toLowerCase().includes(term)
    )
  }, [cities, searchTerm])

  if (!isOpen) return null

  const handleSelectCity = (city: City) => {
    setCity({
      id: city.id,
      name: city.name,
      slug: city.slug,
    })
    onClose()
  }

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-brand-dark/80 backdrop-blur-md z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-brand-dark/95 rounded-2xl p-5 sm:p-6 max-w-sm w-full mx-auto shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150 border border-green-800/60 text-white"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-green-800/40 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-green-900/50 flex items-center justify-center text-brand-secondary shrink-0 border border-green-700/40">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="location-modal-title"
                className="text-base sm:text-lg font-bold text-white tracking-wide"
              >
                Choose Your City
              </h2>
              <p className="text-xs text-green-300/70">Find wedding venues in Kerala</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-green-400 hover:text-white hover:bg-green-900/40 transition-colors shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Search — no autoFocus so mobile users see the city list first */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-brand-secondary/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Palakkad, Kochi, Thrissur..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-green-950/60 border border-green-800/50 rounded-xl text-green-50 placeholder-green-300/40 focus:outline-none focus:border-brand-secondary/80 focus:ring-1 focus:ring-brand-secondary/50 transition"
            tabIndex={-1}
          />
        </div>

        {/* Modal Content - Cities List in Emerald Theme */}
        <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
          {isLoading && (
            <div className="space-y-2 py-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-950/40 border border-green-900/30 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-full bg-green-900/40 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-24 h-4 bg-green-900/40 rounded" />
                    <div className="w-16 h-3 bg-green-900/40 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="text-center py-6 space-y-3">
              <p className="text-sm text-red-400 font-medium">Failed to load cities</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-dark bg-brand-secondary hover:bg-brand-secondary/90 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && filteredCities.length === 0 && (
            <p className="text-sm text-center text-green-300/70 py-6">
              No matching cities found for &quot;{searchTerm}&quot;.
            </p>
          )}

          {!isLoading &&
            !isError &&
            filteredCities.map((city) => {
              const isSelected =
                selectedCity?.id === city.id || selectedCity?.slug === city.slug

              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => handleSelectCity(city)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${isSelected
                      ? 'bg-green-900/50 border border-brand-secondary/60 text-brand-secondary font-semibold shadow-sm'
                      : 'hover:bg-green-900/30 text-green-100 border border-transparent'
                    }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected
                          ? 'bg-brand-secondary text-brand-dark font-bold'
                          : 'bg-green-950/70 text-green-300/70 border border-green-800/40'
                        }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate text-white">{city.name}</p>
                      <p className="text-xs text-green-300/60 truncate">{city.state || 'Kerala'}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-brand-secondary shrink-0 ml-2" />
                  )}
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
