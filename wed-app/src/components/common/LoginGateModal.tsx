import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Store,
} from 'lucide-react'
import { useLoginGate } from '../../contexts/LoginGateContext'
import { useAuth } from '../../contexts/AuthContext'

const KERALA_CITIES = [
  { label: 'Kochi', value: 'kochi' },
  { label: 'Thiruvananthapuram', value: 'thiruvananthapuram' },
  { label: 'Thrissur', value: 'thrissur' },
  { label: 'Kozhikode', value: 'kozhikode' },
  { label: 'Kannur', value: 'kannur' },
  { label: 'Kollam', value: 'kollam' },
  { label: 'Palakkad', value: 'palakkad' },
  { label: 'Alappuzha', value: 'alappuzha' },
  { label: 'Malappuram', value: 'malappuram' },
  { label: 'Kottayam', value: 'kottayam' },
  { label: 'Wayanad', value: 'wayanad' },
  { label: 'Idukki', value: 'idukki' },
  { label: 'Pathanamthitta', value: 'pathanamthitta' },
  { label: 'Kasaragod', value: 'kasaragod' },
]

export function LoginGateModal() {
  const { isOpen, closeLoginGate, onSuccessCallback } = useLoginGate()
  const { signIn, signUp, updateProfile } = useAuth()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mana_preferred_city') || 'kochi'
    }
    return 'kochi'
  })

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setFullName('')
    setPhone('')
    setSelectedCity(localStorage.getItem('mana_preferred_city') || 'kochi')
    setErrorMessage(null)
    setSuccessMessage(null)
    setSubmitting(false)
  }

  const handleClose = () => {
    resetForm()
    closeLoginGate()
  }

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode)
    setErrorMessage(null)
    setSuccessMessage(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)
    setSubmitting(true)

    try {
      if (!selectedCity) {
        throw new Error('Please select your city to continue.')
      }

      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.')
        }
        await signIn(email.trim(), password)
        localStorage.setItem('mana_preferred_city', selectedCity)
        try {
          await updateProfile({ preferred_city: selectedCity })
        } catch {
          // ignore if user profile update is still syncing
        }
        setSuccessMessage('Welcome back! Access granted.')
        setTimeout(() => {
          if (onSuccessCallback) {
            onSuccessCallback()
          }
          handleClose()
        }, 500)
      } else {
        if (!fullName.trim()) throw new Error('Please enter your full name.')
        if (!email.trim()) throw new Error('Please enter your email address.')
        if (!phone.trim()) throw new Error('Please enter your contact phone number.')
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters.')
        }
        localStorage.setItem('mana_preferred_city', selectedCity)
        const { session } = await signUp(email.trim(), password, fullName.trim(), phone.trim(), {
          preferred_city: selectedCity,
        })
        if (session) {
          setSuccessMessage('Account created successfully! Welcome to MANA.')
          setTimeout(() => {
            if (onSuccessCallback) {
              onSuccessCallback()
            }
            handleClose()
          }, 600)
        } else {
          setSuccessMessage('Verification email sent! Please check your inbox to activate your account.')
        }
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 14 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#D8F0EC] overflow-hidden z-10 my-auto text-[#5A172D]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Brand Banner */}
          <div className="relative bg-gradient-to-r from-[#7E1F3E] via-[#A82B54] to-[#C83B68] px-6 pt-6 pb-5 text-white text-center">
            {/* Close button */}
            <button
              type="button"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
              aria-label="Close login dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-2">
              <img
                src="/logo.svg"
                alt="MANA Logo"
                className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)]"
              />
            </div>

            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
              Sign In
            </h3>
          </div>

          {/* Body Section */}
          <div className="p-6">
            {/* Mode Tabs */}
            <div className="flex bg-[#F0F9F8] p-1 rounded-xl mb-5 border border-[#D8F0EC]">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'login'
                    ? 'bg-[#7E1F3E] text-white shadow-sm'
                    : 'text-[#5A172D]/70 hover:text-[#5A172D]'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  mode === 'register'
                    ? 'bg-[#7E1F3E] text-white shadow-sm'
                    : 'text-[#5A172D]/70 hover:text-[#5A172D]'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-[#5A172D] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8F0EC] focus:border-[#C83B68] focus:ring-2 focus:ring-[#C83B68]/20 text-xs sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#5A172D] mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8F0EC] focus:border-[#C83B68] focus:ring-2 focus:ring-[#C83B68]/20 text-xs sm:text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-[#5A172D] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8F0EC] focus:border-[#C83B68] focus:ring-2 focus:ring-[#C83B68]/20 text-xs sm:text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#5A172D]">
                    Password
                  </label>
                  {mode === 'login' && (
                    <Link
                      to="/auth?mode=forgot"
                      onClick={handleClose}
                      className="text-[11px] text-[#C83B68] hover:underline"
                    >
                      Forgot?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#D8F0EC] focus:border-[#C83B68] focus:ring-2 focus:ring-[#C83B68]/20 text-xs sm:text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* City Picker — Required for both Login & Sign In */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#5A172D] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#C83B68]" />
                    <span>Select City</span>
                    <span className="text-rose-600 text-xs">*</span>
                  </label>
                  <span className="text-[10px] text-gray-500 font-medium">
                    (Required to view packages)
                  </span>
                </div>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#C83B68] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-[#D8F0EC] focus:border-[#C83B68] focus:ring-2 focus:ring-[#C83B68]/20 text-xs sm:text-sm outline-none transition-all bg-white appearance-none cursor-pointer text-[#5A172D] font-medium"
                  >
                    <option value="" disabled>-- Select Your City --</option>
                    {KERALA_CITIES.map((city) => (
                      <option key={city.value} value={city.value}>
                        {city.label}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* City pill chips for fast 1-click selection */}
                <div className="mt-2 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                  {KERALA_CITIES.slice(0, 7).map((city) => (
                    <button
                      key={city.value}
                      type="button"
                      onClick={() => setSelectedCity(city.value)}
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                        selectedCity === city.value
                          ? 'bg-[#7E1F3E] text-white border-[#7E1F3E] shadow-xs'
                          : 'bg-white text-[#7E1F3E] border-[#D8F0EC] hover:border-[#C83B68]'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-[#7E1F3E] via-[#A82B54] to-[#C83B68] hover:brightness-105 active:scale-[0.99] transition-all shadow-md disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Login' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Vendor Register Button */}
            <div className="mt-5 pt-4 border-t border-[#D8F0EC] text-center">
              <p className="text-xs text-gray-500 mb-2">Are you a venue owner or wedding vendor?</p>
              <Link
                to="/vendor/register"
                onClick={handleClose}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-[#7E1F3E]/30 bg-[#7E1F3E]/05 hover:bg-[#7E1F3E] hover:text-white text-[#7E1F3E] font-bold text-xs sm:text-sm transition-all"
              >
                <Store className="w-4 h-4" />
                Vendor Register / Portal
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
