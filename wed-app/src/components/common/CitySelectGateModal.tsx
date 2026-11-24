import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Search, Check, Building2, Sparkles, AlertCircle } from 'lucide-react'
import { useCityStore } from '../../store/cityStore'
import { useCities, KERALA_DISTRICTS_CITIES } from '../../hooks/useCities'
import type { City } from '../../lib/types'

const POPULAR_CITIES = ['kochi', 'thiruvananthapuram', 'thrissur', 'kozhikode', 'alappuzha', 'wayanad']

export function CitySelectGateModal() {
  const { selectedCity, setCity } = useCityStore()
  const { data: dbCities } = useCities()

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  // 5-second recurring popup logic:
  // If user has not chosen a city (selectedCity is null), popup appears.
  // If closed or dismissed, pops up again in 5 seconds.
  // As soon as selectedCity is chosen, the timer is cancelled and modal closes permanently.
  useEffect(() => {
    if (selectedCity) {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
      setIsOpen(false)
      return
    }

    // If modal is already open, do not schedule another timer
    if (isOpen) return

    // Popup every 5 seconds until user selects a city
    timerRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 5000)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [selectedCity, isOpen])

  // Initial prompt on page load if no city selected
  useEffect(() => {
    if (!selectedCity) {
      // Short delay for smooth entrance
      const initialTimer = setTimeout(() => {
        setIsOpen(true)
      }, 600)
      return () => clearTimeout(initialTimer)
    }
  }, [selectedCity])

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
    } catch {
      // ignore
    }
    setIsOpen(false)
  }

  const handleDismissAttempt = () => {
    // If they try to close without selecting, close temporarily and re-trigger in 5 seconds
    setIsOpen(false)
  }

  if (!isOpen && selectedCity) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md"
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
            className="relative w-full max-w-lg bg-[#151119] border border-[#f98093]/30 rounded-3xl shadow-2xl p-5 sm:p-6 text-white overflow-hidden max-h-[92vh] flex flex-col"
          >
            {/* Top decorative gradient glow */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f98093] to-transparent" />

            {/* Header */}
            <div className="flex items-start gap-3.5 mb-4">
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
                <p className="text-xs sm:text-sm text-gray-300 mt-1 leading-snug">
                  Choose your city to explore exclusive wedding packages and verified venues tailored to your location.
                </p>
              </div>
            </div>

            {/* Warning requirement callout */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs mb-3">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>You must select a city to browse local packages and venues.</span>
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
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 border active:scale-95 ${
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
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 max-h-[300px] scrollbar-thin scrollbar-thumb-white/20">
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
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all active:scale-[0.99] group ${
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
              <span>You can switch cities anytime from the top bar</span>
              {selectedCity && (
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-300 hover:text-white font-semibold transition-colors"
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
}
