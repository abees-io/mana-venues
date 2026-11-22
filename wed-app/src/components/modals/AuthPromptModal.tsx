import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function AuthPromptModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { user, loading, signIn } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isAuthPage =
    location.pathname.startsWith('/auth') ||
    location.pathname.startsWith('/vendor/auth')

  // Trigger modal every 6 seconds if the user is not logged in
  useEffect(() => {
    if (user || loading || isAuthPage) {
      setIsOpen(false)
      return
    }

    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 6000)

      return () => clearTimeout(timer)
    }
  }, [user, loading, isAuthPage, isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleClose = () => {
    setErrorMsg(null)
    setIsOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Please enter both your email and password.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      await signIn(email.trim(), password)
      setIsOpen(false)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Invalid credentials. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoToRegister = () => {
    setIsOpen(false)
    navigate('/auth/login?mode=register')
  }

  const handleGoToFullLogin = () => {
    setIsOpen(false)
    navigate('/auth/login?mode=login')
  }

  return (
    <AnimatePresence>
      {isOpen && !user && !isAuthPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-prompt-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#D8F0EC] z-10 my-auto"
          >
            {/* Top Decorative Gradient Ribbon */}
            <div className="h-2 w-full bg-gradient-to-r from-[#f98093] via-[#ff9eb0] to-[#f98093]" />

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Close sign in popup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-7">
              {/* Icon & Heading */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-2xl bg-[#f98093]/15 flex items-center justify-center text-[#f98093] shrink-0 border border-[#f98093]/25">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#f98093] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3" />
                    <span>Member Access</span>
                  </div>
                  <h3
                    id="auth-prompt-title"
                    className="text-xl sm:text-2xl font-bold text-[#5A172D] leading-tight"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Sign In to MANA
                  </h3>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-gray-600 mb-4 leading-relaxed">
                Unlock direct hall pricing, package discounts, and instant booking enquiries across Kerala.
              </p>

              {/* Benefits Pills */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#F0F9F8] border border-[#D8F0EC] text-[11px] font-semibold text-[#5A172D]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f98093] shrink-0" />
                  <span>Verified Venues</span>
                </div>
                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#F0F9F8] border border-[#D8F0EC] text-[11px] font-semibold text-[#5A172D]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#f98093] shrink-0" />
                  <span>Direct Rates</span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Quick Sign In Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#5A172D] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f98093]/40 focus:border-[#f98093] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#5A172D]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleGoToFullLogin}
                      className="text-[11px] text-[#f98093] hover:underline font-semibold"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f98093]/40 focus:border-[#f98093] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#f98093] hover:bg-[#e86e81] active:scale-[0.98] transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Actions */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleGoToRegister}
                  className="font-semibold text-[#f98093] hover:underline cursor-pointer"
                >
                  Don't have an account? Sign Up
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
