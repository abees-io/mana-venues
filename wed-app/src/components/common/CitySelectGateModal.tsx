import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Check, X } from 'lucide-react'
import { useCityStore } from '../../store/cityStore'
import { useCities, KERALA_DISTRICTS_CITIES } from '../../hooks/useCities'
import type { City } from '../../lib/types'

const CONFIRM_KEY = 'mana_city_confirmed_v1'

export function CitySelectGateModal() {
  const { selectedCity, setCity } = useCityStore()
  const { data: dbCities } = useCities()

  const [hasConfirmed, setHasConfirmed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CONFIRM_KEY) === 'true'
    }
    return false
  })

  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for manual open trigger (e.g. from "Change City" button in header)
  useEffect(() => {
    const handleManualOpen = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setIsOpen(true)
    }
    window.addEventListener('mana_open_city_gate', handleManualOpen)
    return () => window.removeEventListener('mana_open_city_gate', handleManualOpen)
  }, [])

  // Combine database cities with default 14 Kerala districts
  const allCities: City[] = useMemo(() => {
    const list = dbCities && dbCities.length > 0 ? dbCities : KERALA_DISTRICTS_CITIES
    return list.filter(
      (c) => c.slug.toLowerCase() !== 'all-kerala' && c.name.toLowerCase() !== 'all kerala'
    )
  }, [dbCities])

  // Popup logic:
  // If user has not confirmed city, show immediately.
  // If dismissed without choosing, pop up again in 5 seconds.
  // Once confirmed, stop recurring timer completely.
  useEffect(() => {
    if (hasConfirmed) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      return
    }

    if (isOpen) return

    timerRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 5000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [hasConfirmed, isOpen])

  // Initial trigger immediately on mount if not confirmed
  useEffect(() => {
    if (!hasConfirmed) {
      const initialTimer = setTimeout(() => {
        setIsOpen(true)
      }, 400)
      return () => clearTimeout(initialTimer)
    }
  }, [hasConfirmed])

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = original
      }
    }
  }, [isOpen])

  const handleSelectCity = (city: City) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setCity({
      id: city.id,
      name: city.name,
      slug: city.slug,
    })
    try {
      localStorage.setItem('mana_preferred_city', city.slug)
      localStorage.setItem(CONFIRM_KEY, 'true')
    } catch {
      // ignore
    }
    setHasConfirmed(true)
    setIsOpen(false)
  }

  const handleDismissAttempt = () => {
    // If dismissed without confirming, will pop back up in 5 seconds
    setIsOpen(false)
  }

  if (!isOpen) return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="city-select-title"
          onClick={handleDismissAttempt}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white border border-gray-100 rounded-3xl shadow-2xl p-6 sm:p-7 text-gray-900 overflow-hidden max-h-[90vh] flex flex-col text-center"
          >
            {/* Close button in top-right */}
            <button
              type="button"
              onClick={handleDismissAttempt}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header: Center Aligned, Simple, No Extra Text */}
            <div className="flex flex-col items-center justify-center mb-5 pt-1">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF5F7] text-[#C83B68] flex items-center justify-center mb-2.5 border border-[#C83B68]/20 shadow-xs">
                <MapPin className="w-5 h-5" />
              </div>
              <h2
                id="city-select-title"
                className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Select Your City
              </h2>
            </div>

            {/* All Cities in Center-Aligned Pill Style */}
            <div className="flex flex-wrap items-center justify-center gap-2 overflow-y-auto max-h-[55vh] py-1 px-0.5 scrollbar-thin scrollbar-thumb-gray-200">
              {allCities.map((city) => {
                const isSelected =
                  selectedCity?.slug.toLowerCase() === city.slug.toLowerCase() ||
                  selectedCity?.name.toLowerCase() === city.name.toLowerCase()

                return (
                  <button
                    key={city.id || city.slug}
                    type="button"
                    onClick={() => handleSelectCity(city)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                      isSelected
                        ? 'bg-[#C83B68] text-white border-[#C83B68] shadow-sm font-bold'
                        : 'bg-gray-50 hover:bg-[#FFF5F7] text-gray-700 hover:text-[#C83B68] border-gray-200 hover:border-[#C83B68]/40'
                    }`}
                  >
                    <span>{city.name.replace(/\s*\(.*?\)\s*/g, '')}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
