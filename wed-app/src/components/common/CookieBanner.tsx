import { useState, useEffect } from 'react'
import { Cookie, X, Check, ShieldCheck, Settings2 } from 'lucide-react'

export interface CookiePreferences {
  essential: boolean
  preferences: boolean
  analytics: boolean
}

const COOKIE_STORAGE_KEY = 'mana_cookie_consent'

function setCookie(name: string, value: string, days = 365) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`
}

function getStoredConsent(): CookiePreferences | null {
  try {
    const raw = localStorage.getItem(COOKIE_STORAGE_KEY)
    if (raw) return JSON.parse(raw) as CookiePreferences
  } catch {
    // ignore
  }
  return null
}

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    preferences: true,
    analytics: true,
  })

  useEffect(() => {
    // Only show if user has not made a choice yet
    const stored = getStoredConsent()
    if (!stored) {
      // Small delay so it smoothly slides in after initial paint
      const timer = setTimeout(() => setIsVisible(true), 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    try {
      localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(prefs))
      setCookie(COOKIE_STORAGE_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
    setIsVisible(false)
    setShowPreferences(false)
  }

  const handleAcceptAll = () => {
    const all = { essential: true, preferences: true, analytics: true }
    setPreferences(all)
    saveConsent(all)
  }

  const handleEssentialOnly = () => {
    const essentialOnly = { essential: true, preferences: false, analytics: false }
    setPreferences(essentialOnly)
    saveConsent(essentialOnly)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Floating Cookie Banner */}
      <div
        role="region"
        aria-label="Cookie consent banner"
        className="fixed z-40 bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-pink-200/80 p-5 animate-in fade-in slide-in-from-bottom-5 duration-300"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center shrink-0 border border-brand-primary/15 shadow-xs">
            <Cookie className="w-5 h-5 text-brand-primary" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-dark tracking-tight">
                Cookie Preferences
              </h3>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 rounded-lg"
                aria-label="Dismiss cookie banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              We use cookies to optimize your venue discovery, save your city preferences, and provide secure booking checkout.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-all shadow-xs active:scale-98"
          >
            Accept All
          </button>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className="flex-1 bg-white hover:bg-gray-50 text-brand-dark border border-gray-200 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors active:scale-98"
          >
            Essential Only
          </button>

          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="w-full text-center text-xs font-medium text-brand-primary hover:text-brand-primary/80 py-1 transition-colors flex items-center justify-center gap-1"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Customize Settings</span>
          </button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative my-auto animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-brand-dark">Customize Cookies</h2>
                  <p className="text-xs text-gray-500">Choose which cookies you allow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-3.5 text-xs">
              {/* Essential */}
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-brand-dark">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Strictly Necessary</span>
                  </div>
                  <p className="text-gray-500 leading-relaxed">
                    Required for Supabase authentication, Razorpay security, and selected city persistence. Always enabled.
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  Always On
                </span>
              </div>

              {/* Preferences */}
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-brand-dark block">Preference Cookies</span>
                  <p className="text-gray-500 leading-relaxed">
                    Remembers your venue search filters, budget sliders, and sort selections across browsing sessions.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={preferences.preferences}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, preferences: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl bg-gray-50/80 border border-gray-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-brand-dark block">Analytics & Performance</span>
                  <p className="text-gray-500 leading-relaxed">
                    Helps us understand popular wedding destinations and venue demand to improve the MANA Venues platform.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences((prev) => ({ ...prev, analytics: e.target.checked }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 rounded-xl transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

