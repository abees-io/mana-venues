import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Check, Building2, Sparkles, AlertCircle, X } from 'lucide-react'
import { useCityStore } from '../../store/cityStore'
import { useCities, KERALA_DISTRICTS_CITIES } from '../../hooks/useCities'
import type { City } from '../../lib/types'

const POPULAR_CITIES = ['kochi', 'thiruvananthapuram', 'thrissur', 'kozhikode', 'alappuzha', 'wayanad']
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
  const [searchTerm, setSearchTerm] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Listen for manual open trigger (e.g. from "Change City" buttons)
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

  // Filter cities by search term
  const filteredCities = useMemo(() => {
    if (!searchTerm.trim()) return allCities
    const term = searchTerm.toLowerCase().trim()
    return allCities.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term) ||
        (c.state && c.state.toLowerCase().includes(term))
    )
  }, [allCities, searchTerm])

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

    // If modal is open, don't schedule
    if (isOpen) return

    // Show initial popup or repeat every 5 seconds
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
      }, 500)
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
          className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="city-select-title"
          onClick={handleDismissAttempt}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-[#151119] border border-[#f98093]/40 rounded-3xl shadow-2xl p-5 sm:p-6 text-white overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f98093] to-transparent" />

            {/* Close button (will re-trigger in 5s if not confirmed) */}
            <button
              type="button"
              onClick={handleDismissAttempt}
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3.5 mb-3.5 pr-8">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#7E1F3E] to-[#C83B68] flex items-center justify-center shrink-0 shadow-lg border border-white/10">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#f98093] bg-[#f98093]/15 px-2 py-0.5 rounded-full border border-[#f98093]/20">
                    City Selection Required
                  </span>
                </div>
                <h2
                  id="city-select-title"
                  className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Select Your City
                </h2>
                <p className="text-xs sm:text-sm text-gray-300 mt-0.5 leading-snug">
                  Choose your city to explore exclusive wedding packages and verified venues tailored to your location.
                </p>
              </div>
            </div>

            {/* Warning requirement callout */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You must select a city to continue exploring local packages and venues.</span>
            </div>

            {/* Quick Popular City Chips */}
            <div className="mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#f98093]" />
                <span>Popular Cities</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((slug) => {
                  const city = allCities.find((c) => c.slug.toLowerCase() === slug)
                  if (!city) return null
                  const isSelected = selectedCity?.slug === city.slug
                  return (
                    <button
                      key={city.slug}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-[#C83B68] text-white border-[#C83B68] shadow-sm'
                          : 'bg-white/5 hover:bg-white/15 text-gray-200 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>{city.name.replace(/\s*\(.*?\)\s*/g, '')}</span>
                      {isSelected && <Check className="w-3 h-3" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search city or district (e.g. Kochi, Thrissur)..."
                className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm bg-white/5 border border-white/15 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f98093]/40 focus:border-[#f98093] transition-colors"
              />
            </div>

            {/* Scrollable City List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[260px] scrollbar-thin scrollbar-thumb-white/20">
              {filteredCities.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-xs">
                  No cities found matching &quot;{searchTerm}&quot;
                </div>
              ) : (
                filteredCities.map((city) => {
                  const isSelected =
                    selectedCity?.slug.toLowerCase() === city.slug.toLowerCase() ||
                    selectedCity?.name.toLowerCase() === city.name.toLowerCase()

                  return (
                    <button
                      key={city.id || city.slug}
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.99] group cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7E1F3E]/60 to-[#C83B68]/60 border-[#f98093] text-white shadow-md'
                          : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-[#C83B68] text-white'
                              : 'bg-white/10 text-gray-300 group-hover:text-white'
                          }`}
                        >
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold leading-tight">{city.name}</p>
                          <p className="text-[10px] text-gray-400">{city.state || 'Kerala'}</p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-[#f98093] flex items-center justify-center text-white">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-medium text-gray-400 group-hover:text-[#f98093] transition-colors">
                          Select &rarr;
                        </span>
                      )}
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span>You can change city anytime from the top bar</span>
              {hasConfirmed && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null
}
