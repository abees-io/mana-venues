import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  Sparkles,
  Palmtree,
  UtensilsCrossed,
  Camera,
  HeartHandshake,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Building2,
  ShieldCheck,
  Calendar,
  Image as ImageIcon,
  DollarSign,
  MessageSquare,
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
  badge: string
  defaultFeatures: string[]
}

const VENDOR_CATEGORIES: VendorCategoryOption[] = [
  {
    id: 'wedding_planner',
    title: 'Wedding Event Planner',
    subtitle: 'Full coordination, themes, stage & decor setups, timeline planning',
    icon: HeartHandshake,
    badge: 'Planning & Decor',
    defaultFeatures: ['leads', 'packages', 'portfolio', 'calendar'],
  },
  {
    id: 'destination_wedding',
    title: 'Destination Weddings',
    subtitle: 'Resort venues, guest accommodation packages, travel logistics',
    icon: Palmtree,
    badge: 'Venues & Resorts',
    defaultFeatures: ['venues', 'packages', 'calendar', 'payouts'],
  },
  {
    id: 'catering',
    title: 'Catering Services',
    subtitle: 'Traditional Sadya, royal buffet menus, live counters & dining',
    icon: UtensilsCrossed,
    badge: 'Feasts & Dining',
    defaultFeatures: ['packages', 'leads', 'payouts', 'calendar'],
  },
  {
    id: 'photographer',
    title: 'Photographers & Cinema',
    subtitle: 'Wedding cinematography, drone shoots, pre-wedding albums & mobile',
    icon: Camera,
    badge: 'Photo & Video',
    defaultFeatures: ['portfolio', 'packages', 'calendar', 'leads'],
  },
  {
    id: 'bridal_makeup',
    title: 'Bridal and Make Up',
    subtitle: 'HD bridal makeup, airbrush glam, party makeovers, grooming trials',
    icon: Sparkles,
    badge: 'Styling & Beauty',
    defaultFeatures: ['portfolio', 'packages', 'calendar', 'leads'],
  },
]

interface AccessOption {
  id: string
  label: string
  description: string
  icon: typeof MessageSquare
}

const ACCESS_OPTIONS: AccessOption[] = [
  {
    id: 'leads',
    label: 'Direct Client Inquiries & Leads',
    description: 'Receive real-time booking requests, chat with couples & send quotes',
    icon: MessageSquare,
  },
  {
    id: 'packages',
    label: 'Packages & Rate Card Editor',
    description: 'Publish customized pricing tiers, feast menus, or shoot packages',
    icon: DollarSign,
  },
  {
    id: 'portfolio',
    label: 'Portfolio & Visual Showcase',
    description: 'Showcase high-resolution photo galleries and video showreels to couples',
    icon: ImageIcon,
  },
  {
    id: 'calendar',
    label: 'Live Calendar & Booking Slots',
    description: 'Lock dates, manage availability slots, and avoid double bookings',
    icon: Calendar,
  },
  {
    id: 'venues',
    label: 'Venue & Hall Management',
    description: 'Manage auditorium capacity, amenities, floor plans & location coordinates',
    icon: Building2,
  },
  {
    id: 'payouts',
    label: 'Advance Payments & Payout Receipts',
    description: 'Track client advance payments, invoices, and bank settlement records',
    icon: ShieldCheck,
  },
]

export default function VendorAuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile, signIn, signUp } = useAuth()

  // View state: 'login' or 'register'
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)

  // Registration Multi-Step State: 1 = Category, 2 = Details, 3 = Access & Permissions
  const [step, setStep] = useState<1 | 2 | 3>(1)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<VendorType>('wedding_planner')
  const [selectedAccess, setSelectedAccess] = useState<string[]>([
    'leads',
    'packages',
    'portfolio',
    'calendar',
  ])

  // Registration fields
  const [businessName, setBusinessName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [city, setCity] = useState('Kochi')

  // Login fields
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

  // Handle Category selection
  const handleSelectCategory = (catId: VendorType) => {
    setSelectedCategory(catId)
    const cat = VENDOR_CATEGORIES.find((c) => c.id === catId)
    if (cat) {
      setSelectedAccess(cat.defaultFeatures)
    }
  }

  // Toggle Access Feature Checkbox
  const toggleAccess = (accessId: string) => {
    setSelectedAccess((prev) =>
      prev.includes(accessId) ? prev.filter((id) => id !== accessId) : [...prev, accessId]
    )
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
      setErrorMsg(err instanceof Error ? err.message : 'Vendor login failed. Please check your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Multi-step Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!businessName.trim()) {
      setErrorMsg('Please enter your business or studio name.')
      setIsSubmitting(false)
      return
    }
    if (!fullName.trim()) {
      setErrorMsg('Please enter the contact person name.')
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
        access_permissions: selectedAccess,
        operating_city: city,
      })

      setSuccessMsg('Vendor account created successfully! Redirecting to your dashboard...')
      setTimeout(() => {
        navigate('/vendor')
      }, 1500)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[85vh] py-8 sm:py-12 px-3 sm:px-6 max-w-4xl mx-auto">
        {/* Top Header Badge */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7E1F3E]/10 border border-[#7E1F3E]/20 text-[#7E1F3E] text-xs font-bold tracking-wide uppercase mb-3">
            <Store className="w-4 h-4" />
            <span>MANA Partner & Vendor Portal</span>
          </div>
          <h1
            className="text-2xl sm:text-4xl font-extrabold uppercase tracking-wide text-[#7E1F3E]"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {mode === 'register' ? 'Join as a Verified Vendor' : 'Vendor Partner Login'}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto mt-2">
            {mode === 'register'
              ? 'Connect directly with couples across Kerala. Select your category and choose what tools you need to manage your wedding business.'
              : 'Sign in to access your bookings, leads, rate cards, and availability calendar.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="mt-5 inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200">
            <button
              type="button"
              onClick={() => {
                setMode('register')
                setErrorMsg(null)
              }}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white text-[#7E1F3E] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Register as Vendor
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setErrorMsg(null)
              }}
              className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#7E1F3E] shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Vendor Sign In
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ================= REGISTER VIEW (MULTI-STEP) ================= */}
        {mode === 'register' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xl p-5 sm:p-8">
            {/* Step Indicators */}
            <div className="mb-8">
              <div className="flex items-center justify-between max-w-md mx-auto">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      step >= 1
                        ? 'bg-[#7E1F3E] text-white ring-4 ring-[#7E1F3E]/20'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    1
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-1.5">Category</span>
                </div>
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step >= 2 ? 'bg-[#7E1F3E]' : 'bg-gray-200'
                  }`}
                />
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      step >= 2
                        ? 'bg-[#7E1F3E] text-white ring-4 ring-[#7E1F3E]/20'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    2
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-1.5">Business</span>
                </div>
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step >= 3 ? 'bg-[#7E1F3E]' : 'bg-gray-200'
                  }`}
                />
                <div className="flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                      step >= 3
                        ? 'bg-[#7E1F3E] text-white ring-4 ring-[#7E1F3E]/20'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    3
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-1.5">Access</span>
                </div>
              </div>
            </div>

            {/* STEP 1: SELECT VENDOR CATEGORY */}
            {step === 1 && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#5A172D]">
                    Step 1: Which type of wedding vendor are you?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Select your vendor category to tailor your tools, rate card formats, and lead routing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  {VENDOR_CATEGORIES.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = selectedCategory === cat.id
                    return (
                      <div
                        key={cat.id}
                        onClick={() => handleSelectCategory(cat.id)}
                        className={`relative p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#7E1F3E] bg-[#FFF2F6] shadow-md scale-[1.01]'
                            : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/70'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`p-3 rounded-xl shrink-0 ${
                              isSelected
                                ? 'bg-[#7E1F3E] text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight">
                                {cat.title}
                              </h3>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#7E1F3E]/10 text-[#7E1F3E] shrink-0">
                                {cat.badge}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 leading-snug">
                              {cat.subtitle}
                            </p>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-4 h-4 text-[#7E1F3E]" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7E1F3E] hover:bg-[#5A172D] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <span>Next: Business Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: BUSINESS & CREDENTIALS */}
            {step === 2 && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#5A172D]">
                    Step 2: Tell us about your business
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Category: <strong className="text-[#7E1F3E]">{VENDOR_CATEGORIES.find(c => c.id === selectedCategory)?.title}</strong>
                  </p>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Business or Brand Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Royal Blooms Weddings / Malabar Feasts"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                      Contact Person Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rahul Menon"
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
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
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                        Primary Operating City
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
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
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!businessName || !fullName || !email || !password) {
                        setErrorMsg('Please fill in all required fields.')
                        return
                      }
                      setErrorMsg(null)
                      setStep(3)
                    }}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7E1F3E] hover:bg-[#5A172D] text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    <span>Next: Webpage Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ACCESS & PERMISSIONS NEEDED */}
            {step === 3 && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-[#5A172D]">
                    Step 3: What types of access do you need on MANA?
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Select the management modules and webpage features you want enabled for your vendor profile.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-2xl mx-auto">
                  {ACCESS_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const isChecked = selectedAccess.includes(opt.id)
                    return (
                      <div
                        key={opt.id}
                        onClick={() => toggleAccess(opt.id)}
                        className={`p-3.5 sm:p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked
                            ? 'border-[#7E1F3E] bg-[#FFF2F6]'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // Handled by parent container click
                          className="mt-1 h-4 w-4 rounded text-[#7E1F3E] focus:ring-[#7E1F3E]"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-gray-900">
                            <Icon className="w-4 h-4 text-[#7E1F3E] shrink-0" />
                            <span>{opt.label}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                            {opt.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs sm:text-sm hover:bg-gray-100 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleRegister}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-[#7E1F3E] to-[#C83B68] hover:brightness-110 text-white font-bold text-sm sm:text-base shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isSubmitting ? 'Setting up account...' : 'Complete Vendor Registration'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= LOGIN VIEW ================= */}
        {mode === 'login' && (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xl p-6 sm:p-10 max-w-md mx-auto">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                  Vendor Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="vendor@company.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
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
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7E1F3E]/40 focus:border-[#7E1F3E]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7E1F3E] to-[#C83B68] hover:brightness-110 text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In to Vendor Dashboard'}
                </button>
              </div>

              <div className="pt-3 text-center text-xs text-gray-500">
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
