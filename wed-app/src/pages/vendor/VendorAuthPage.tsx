import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Sparkles,
  UtensilsCrossed,
  Camera,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Store,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import { useAuth } from '../../contexts/AuthContext'
import type { VendorType } from '../../lib/types'

interface VendorCategoryOption {
  id: VendorType
  title: string
  subtitle: string
  icon: typeof Sparkles
}

const VENDOR_CATEGORIES: VendorCategoryOption[] = [
  {
    id: 'wedding_planner',
    title: 'Wedding Event Planner',
    subtitle: 'Includes destination weddings, intimate weddings',
    icon: HeartHandshake,
  },
  {
    id: 'catering',
    title: 'Catering',
    subtitle: 'Traditional Sadya, royal buffet & live counters',
    icon: UtensilsCrossed,
  },
  {
    id: 'photographer',
    title: 'Photographers',
    subtitle: 'Wedding cinema, pre-wedding & mobile shoots',
    icon: Camera,
  },
  {
    id: 'bridal_makeup',
    title: 'Bridal and Make Up',
    subtitle: 'HD bridal makeup, airbrush glam & makeover trials',
    icon: Sparkles,
  },
]

export default function VendorAuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile, signIn, signUp } = useAuth()

  // Tab mode: 'register' or 'login'
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // 2 Simple Registration Steps: 1 = Service Type, 2 = Details
  const [step, setStep] = useState<1 | 2>(1)

  // Form Fields
  const [selectedCategory, setSelectedCategory] = useState<VendorType>('wedding_planner')
  const [businessName, setBusinessName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('Kochi')

  // Login Fields
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Redirect if already logged in as vendor
  if (user && profile?.role === 'vendor') {
    navigate('/vendor')
  }

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      await signIn(loginEmail, loginPassword)
      navigate('/vendor')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle 2-Step Registration Submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!businessName.trim() || !fullName.trim()) {
      setErrorMsg('Please enter your business name and contact name.')
      setIsSubmitting(false)
      return
    }
    if (!email.trim() || !password || password.length < 6) {
      setErrorMsg('Please provide a valid email and a password of at least 6 characters.')
      setIsSubmitting(false)
      return
    }

    try {
      await signUp(email, password, fullName, phone, {
        role: 'vendor',
        vendor_type: selectedCategory,
        business_name: businessName,
        operating_city: city,
        access_permissions: ['full_access'],
      })

      setSuccessMsg('Account created successfully! Redirecting to your dashboard...')
      setTimeout(() => {
        navigate('/vendor')
      }, 1200)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[80vh] py-8 sm:py-12 px-4 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7E1F3E]/10 text-[#7E1F3E] text-xs font-bold tracking-wide uppercase mb-2.5">
            <Store className="w-3.5 h-3.5" />
            <span>Vendor Portal</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-[#7E1F3E]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {mode === 'register' ? 'Register as Vendor' : 'Vendor Sign In'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {mode === 'register'
              ? 'List your services and get bookings from couples across Kerala'
              : 'Sign in to access your leads, bookings, and dashboard'}
          </p>

          {/* Mode Switcher */}
          <div className="mt-4 inline-flex p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMsg(null)
              }}
              className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#7E1F3E] shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg(null)
              }}
              className={`px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#7E1F3E] shadow-xs'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= REGISTER VIEW (SIMPLE 2 STEPS) ================= */}
        {mode === 'register' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-5 sm:p-7">
            {/* 2 Simple Steps Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  step === 1 ? 'text-[#7E1F3E]' : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step === 1
                      ? 'bg-[#7E1F3E] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  1
                </span>
                <span>Select Service</span>
              </div>

              <div className="w-8 h-0.5 bg-gray-200" />

              <div
                className={`flex items-center gap-1.5 text-xs font-bold ${
                  step === 2 ? 'text-[#7E1F3E]' : 'text-gray-400'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    step === 2
                      ? 'bg-[#7E1F3E] text-white'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  2
                </span>
                <span>Account Details</span>
              </div>
            </div>

            {/* STEP 1: SELECT VENDOR CATEGORY */}
            {step === 1 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                  What type of wedding vendor are you?
                </p>

                <div className="space-y-2">
                  {VENDOR_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = selectedCategory === cat.id
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-[#7E1F3E] bg-[#FFF2F6]/60 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className={`p-2.5 rounded-lg shrink-0 ${
                            isSelected ? 'bg-[#7E1F3E] text-white' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight">
                            {cat.title}
                          </h3>
                          <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                            {cat.subtitle}
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#7E1F3E] shrink-0" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#7E1F3E] hover:bg-[#5A172D] text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
                  >
                    <span>Next: Account Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BUSINESS & CONTACT DETAILS */}
            {step === 2 && (
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Category summary chip */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                  <span className="text-gray-500 font-medium">Category:</span>
                  <span className="font-bold text-[#7E1F3E]">
                    {VENDOR_CATEGORIES.find((c) => c.id === selectedCategory)?.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] text-[#7E1F3E] underline font-semibold"
                  >
                    Change
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Business / Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Royal Blooms Wedding Decor"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Menon"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vendor@example.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Primary City
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                    >
                      <option value="Kochi">Kochi (Ernakulam)</option>
                      <option value="Trivandrum">Thiruvananthapuram</option>
                      <option value="Calicut">Kozhikode (Calicut)</option>
                      <option value="Thrissur">Thrissur</option>
                      <option value="Kollam">Kollam</option>
                      <option value="Alappuzha">Alappuzha</option>
                      <option value="Kannur">Kannur</option>
                      <option value="Palakkad">Palakkad</option>
                      <option value="Kottayam">Kottayam</option>
                      <option value="Malappuram">Malappuram</option>
                      <option value="All Kerala">All Kerala / Multi-City</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-300 text-gray-600 font-semibold text-xs hover:bg-gray-50 transition-all"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#7E1F3E] hover:bg-[#5A172D] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Registering...' : 'Register as Vendor'}</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= LOGIN VIEW (SIMPLE & CLEAN) ================= */}
        {mode === 'login' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-md p-5 sm:p-7 max-w-sm mx-auto">
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Vendor Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="vendor@company.com"
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/30 focus:border-[#7E1F3E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-[#7E1F3E] hover:bg-[#5A172D] text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In to Vendor Portal'}
                </button>
              </div>

              <div className="pt-2 text-center text-xs text-gray-500">
                Are you a customer?{' '}
                <Link to="/auth/login" className="text-[#7E1F3E] font-semibold hover:underline">
                  Customer Sign In
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  )
}
