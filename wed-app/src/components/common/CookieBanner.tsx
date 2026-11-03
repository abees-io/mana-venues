import { useState, useEffect } from 'react'
import { Cookie, X, ShieldCheck, Settings2, Check } from 'lucide-react'

interface CookiePreferences {
  essential: boolean
  preferences: boolean
  analytics: boolean
}

const COOKIE_CONSENT_KEY = 'manavenues_cookie_consent'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true,
    preferences: true,
    analytics: true,
  })

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      essential: true,
      preferences: true,
      analytics: true,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(allAccepted))
    setIsVisible(false)
  }

  const handleEssentialOnly = () => {
    const essentialOnly: CookiePreferences = {
      essential: true,
      preferences: false,
      analytics: false,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(essentialOnly))
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(preferences))
    setShowPreferences(false)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* Floating Bottom Toast Banner */}
      <div
        role="region"
        aria-label="Cookie consent banner"
        className="fixed z-40 bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-brand-dark/95 backdrop-blur-md rounded-2xl shadow-2xl border border-green-800/60 p-5 animate-in fade-in slide-in-from-bottom-5 duration-300 text-white"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-900/50 text-brand-secondary flex items-center justify-center shrink-0 border border-green-700/40 shadow-xs">
            <Cookie className="w-5 h-5 text-brand-secondary" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white tracking-tight">
                Cookie Preferences
              </h3>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="text-green-400 hover:text-white p-1 -mr-1 rounded-lg"
                aria-label="Dismiss cookie banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-green-200/70 leading-relaxed">
              We use cookies to optimize your venue discovery, save your city preferences, and provide secure booking checkout.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-green-800/40">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark text-xs font-bold py-2 px-3.5 rounded-xl transition-all shadow-xs active:scale-98"
          >
            Accept All
          </button>

          <button
            type="button"
            onClick={handleEssentialOnly}
            className="flex-1 bg-green-950/70 hover:bg-green-900/60 text-green-100 border border-green-700/40 text-xs font-semibold py-2 px-3.5 rounded-xl transition-colors active:scale-98"
          >
            Essential Only
          </button>

          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="w-full text-center text-xs font-medium text-brand-secondary hover:text-brand-secondary/80 py-1 transition-colors flex items-center justify-center gap-1"
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
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-brand-dark/95 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-green-800/60 relative my-auto animate-in zoom-in-95 duration-150 text-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-green-800/40 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-green-900/50 text-brand-secondary flex items-center justify-center shrink-0 border border-green-700/40">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Customize Cookies</h2>
                  <p className="text-xs text-green-300/70">Choose which cookies you allow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 rounded-full text-green-400 hover:text-white hover:bg-green-900/40 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-3.5 text-xs">
              {/* Essential */}
              <div className="p-3.5 rounded-xl bg-green-950/50 border border-green-800/40 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>Strictly Necessary</span>
                  </div>
                  <p className="text-green-200/70 leading-relaxed">
                    Required for Supabase authentication, Razorpay security, and selected city persistence. Always enabled.
                  </p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-green-900/50 text-brand-secondary rounded-full border border-green-700/40">
                  Always On
                </span>
              </div>

              {/* Preferences */}
              <div className="p-3.5 rounded-xl bg-green-950/50 border border-green-800/40 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-white block">Preference Cookies</span>
                  <p className="text-green-200/70 leading-relaxed">
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
                  <div className="w-9 h-5 bg-green-900/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary"></div>
                </label>
              </div>

              {/* Analytics */}
              <div className="p-3.5 rounded-xl bg-green-950/50 border border-green-800/40 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-bold text-white block">Analytics & Performance</span>
                  <p className="text-green-200/70 leading-relaxed">
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
                  <div className="w-9 h-5 bg-green-900/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary"></div>
                </label>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex items-center justify-end gap-2.5 pt-3 border-t border-green-800/40">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-xs font-semibold text-green-300 hover:bg-green-900/40 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-brand-dark bg-brand-secondary hover:bg-brand-secondary/90 rounded-xl transition-colors shadow-xs"
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
