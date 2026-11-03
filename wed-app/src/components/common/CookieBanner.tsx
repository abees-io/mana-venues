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
    const stored = getStoredConsent()
    if (!stored) {
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

  const handleSavePreferences = () => saveConsent(preferences)

  if (!isVisible) return null

  return (
    <>
      {/* Cookie Banner — bottom sheet */}
      <div
        role="region"
        aria-label="Cookie consent banner"
        className="fixed z-40 bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-white border border-neutral-200 shadow-lg p-5"
      >
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 border border-neutral-200 flex items-center justify-center shrink-0 text-brand-secondary">
            <Cookie className="w-4.5 h-4.5" />
          </div>

          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs font-semibold text-brand-dark tracking-wide uppercase">
                Cookie Preferences
              </h3>
              <button
                type="button"
                onClick={handleEssentialOnly}
                className="text-neutral-400 hover:text-neutral-600 p-0.5 transition-colors shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              We use cookies to save your city preference, enable secure checkout, and improve venue
              discovery. View our{' '}
              <a href="/cookie-policy" className="underline hover:text-brand-secondary transition-colors">
                Cookie Policy
              </a>{' '}
              and{' '}
              <a href="/privacy" className="underline hover:text-brand-secondary transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleAcceptAll}
            className="flex-1 bg-brand-dark hover:bg-brand-secondary hover:text-brand-dark text-white text-[11px] font-semibold py-2 px-3 tracking-wider uppercase transition-colors"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={handleEssentialOnly}
            className="flex-1 border border-neutral-200 hover:border-brand-secondary text-brand-dark hover:text-brand-secondary text-[11px] font-semibold py-2 px-3 tracking-wider uppercase transition-colors"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="w-full text-center text-[11px] font-medium text-neutral-400 hover:text-brand-secondary py-1 transition-colors flex items-center justify-center gap-1.5"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Customize
          </button>
        </div>
      </div>

      {/* Preferences Modal */}
      {showPreferences && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-brand-dark/70 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white max-w-md w-full p-6 shadow-xl border border-neutral-100 relative my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 border border-neutral-200 flex items-center justify-center text-brand-secondary">
                  <Cookie className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-brand-dark tracking-wide">Customize Cookies</h2>
                  <p className="text-[10px] text-neutral-400 mt-0.5">Choose which cookies you allow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories */}
            <div className="space-y-3 text-xs">
              {/* Essential */}
              <div className="p-4 bg-neutral-50 border border-neutral-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-brand-dark">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-secondary" />
                    Strictly Necessary
                  </div>
                  <p className="text-neutral-500 leading-relaxed">
                    Required for authentication, payment security, and city preference persistence. Always enabled.
                  </p>
                </div>
                <span className="shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-1 bg-neutral-100 text-neutral-500 border border-neutral-200">
                  Always On
                </span>
              </div>

              {/* Preferences */}
              <div className="p-4 bg-neutral-50 border border-neutral-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-brand-dark block">Preference Cookies</span>
                  <p className="text-neutral-500 leading-relaxed">
                    Remembers your venue search filters, budget range, and sort preferences across sessions.
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
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary" />
                </label>
              </div>

              {/* Analytics */}
              <div className="p-4 bg-neutral-50 border border-neutral-100 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="font-semibold text-brand-dark block">Analytics &amp; Performance</span>
                  <p className="text-neutral-500 leading-relaxed">
                    Helps us understand popular venues and improve the platform. No personal data is sold.
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
                  <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-secondary" />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="px-4 py-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-700 border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-semibold text-brand-dark bg-brand-secondary hover:bg-brand-gold-dark transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
