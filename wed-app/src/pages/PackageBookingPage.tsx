import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { usePackagesStore, type WeddingPackage } from '../store/packagesStore'
import { useLoginGate } from '../contexts/LoginGateContext'
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowRight,
  Clock,
  Package,
  Phone,
  Mail,
  User,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import {
  checkRateLimit,
  recordRateLimitAttempt,
  formatRateLimitMessage,
} from '../lib/rateLimit'

// ─── 23-Day Minimum Lead Time ─────────────────────────────────────────────────
const MIN_LEAD_DAYS = 23

function getIST(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function formatDisplay(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Mini Calendar ─────────────────────────────────────────────────────────
function MiniCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: string
  onSelect: (d: string) => void
}) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const minAllowed = addDays(today, MIN_LEAD_DAYS)
  const defaultDate = getIST(minAllowed)

  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const d = new Date(minAllowed)
    d.setDate(1)
    return d
  })

  const monthStart = useMemo(() => {
    const d = new Date(currentMonth)
    d.setDate(1)
    d.setHours(0,0,0,0)
    return d
  }, [currentMonth])

  const daysInMonth = useMemo(() => {
    const days: Date[] = []
    const end = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
    for (let d = new Date(monthStart); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d))
    }
    return days
  }, [monthStart])

  const leadingBlanks = monthStart.getDay()
  const monthLabel = monthStart.toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
  const minMonthStr = getIST(minAllowed).slice(0, 7)
  const curMonthStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`
  const maxMonthStr = getIST(addDays(today, 365)).slice(0, 7)
  const canPrev = curMonthStr > minMonthStr
  const canNext = curMonthStr < maxMonthStr

  function prev() { if (!canPrev) return; setCurrentMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() - 1); return d }) }
  function next() { if (!canNext) return; setCurrentMonth(p => { const d = new Date(p); d.setMonth(d.getMonth() + 1); return d }) }

  return (
    <div className="select-none">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prev} disabled={!canPrev}
          className={`p-2 rounded-full border transition-colors ${canPrev ? 'border-[#D8F0EC] text-[#C83B68] hover:bg-[#FFF0F5]' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-[#5A172D]">{monthLabel}</span>
        <button type="button" onClick={next} disabled={!canNext}
          className={`p-2 rounded-full border transition-colors ${canNext ? 'border-[#D8F0EC] text-[#C83B68] hover:bg-[#FFF0F5]' : 'border-gray-100 text-gray-300 cursor-not-allowed'}`}>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-center text-[11px] font-bold text-[#C83B68]/50 py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: leadingBlanks }).map((_, i) => <div key={`b${i}`} />)}
        {daysInMonth.map(day => {
          const str = getIST(day)
          const disabled = day < minAllowed
          const isSelected = str === selectedDate
          const isDefault = str === defaultDate && !selectedDate

          return (
            <button
              key={str}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(str)}
              className={`
                relative flex items-center justify-center rounded-xl text-sm font-medium h-9 w-full transition-all
                ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-[#FFF0F5] hover:text-[#C83B68]'}
                ${isSelected ? 'bg-[#C83B68] text-white shadow-md ring-2 ring-[#C83B68]/30 font-bold scale-105' : ''}
                ${isDefault && !isSelected ? 'ring-2 ring-[#C83B68]/30 text-[#C83B68] bg-[#FFF5F8] font-semibold' : ''}
                ${!disabled && !isSelected ? 'text-[#5A172D]' : ''}
              `}
            >
              {day.getDate()}
              {isDefault && !isSelected && (
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#C83B68]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Package Card (compact) ─────────────────────────────────────────────────
function PackageCard({
  pkg,
  isSelected,
  onSelect,
}: {
  pkg: WeddingPackage
  isSelected: boolean
  onSelect: () => void
}) {
  const photo = pkg.images?.[0] || pkg.image

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-2xl overflow-hidden border-2 transition-all duration-200 group ${
        isSelected
          ? 'border-[#C83B68] shadow-lg shadow-[#C83B68]/20 scale-[1.01]'
          : 'border-[#D8F0EC] hover:border-[#C83B68]/50 hover:shadow-md'
      }`}
    >
      <div className="relative h-32 overflow-hidden bg-[#FDF0F4]">
        <img
          src={photo}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#C83B68] flex items-center justify-center shadow-md">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Backdrop badge */}
        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-[10px] font-bold text-[#7E1F3E]">
          {pkg.backdrop}
        </span>

        {/* Price */}
        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-white/95 text-[11px] font-extrabold text-[#C83B68]">
          {pkg.startingPrice}
        </span>
      </div>

      <div className="p-3 bg-white">
        <p className="text-sm font-bold text-[#5A172D] leading-tight truncate">{pkg.title}</p>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-gray-500">
          <MapPin className="w-3 h-3 text-[#C83B68] shrink-0" />
          <span className="truncate">{pkg.location}</span>
        </div>
        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-500">
          <Users className="w-3 h-3 text-[#C83B68] shrink-0" />
          <span>{pkg.guestCapacity}</span>
        </div>
      </div>
    </button>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PackageBookingPage() {
  const navigate = useNavigate()
  const packages = usePackagesStore(s => s.packages)
  const { requireAuth } = useLoginGate()

  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])
  const minAllowed = addDays(today, MIN_LEAD_DAYS)
  const defaultDate = getIST(minAllowed)

  // State
  const [selectedPkg, setSelectedPkg] = useState<WeddingPackage | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate)
  const [backdropFilter, setBackdropFilter] = useState<string>('All')
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1=pick package, 2=pick date, 3=confirm form
  const [formData, setFormData] = useState({ fullName: '', phone: '', email: '', guestCount: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const backdropTabs = ['All', 'Backwaters', 'Coast', 'Hills', 'Heritage']
  const filteredPackages = useMemo(() =>
    packages.filter(p => backdropFilter === 'All' || p.backdrop === backdropFilter),
    [packages, backdropFilter]
  )

  function handleSelectPackage(pkg: WeddingPackage) {
    setSelectedPkg(pkg)
    setStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleConfirmDate() {
    requireAuth('to confirm your package booking', () => {
      setStep(3)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const rateCheck = checkRateLimit('package_booking_inquiry', 2, 60)
    if (!rateCheck.allowed) {
      setFormError(formatRateLimitMessage(rateCheck.retryAfterSeconds, 'booking'))
      return
    }

    const name = formData.fullName.trim().slice(0, 80)
    const phone = formData.phone.trim().slice(0, 20)
    const email = formData.email.trim().slice(0, 100)
    if (!name || !phone || !email) return

    setSubmitting(true)
    recordRateLimitAttempt('package_booking_inquiry', 60)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 900)
  }

  // ── Step indicators
  const steps = [
    { id: 1, label: 'Choose Package' },
    { id: 2, label: 'Pick a Date' },
    { id: 3, label: 'Confirm Booking' },
  ]

  return (
    <Layout>
      <div className="min-h-screen bg-[#F0F9F8]">

        {/* ── Page Header ─────────────────────────────────── */}
        <div className="bg-white border-b border-[#D8F0EC] px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-[#C83B68]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#C83B68]">Destination Wedding</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#5A172D]" style={{ fontFamily: "'Cinzel', serif" }}>
              Book a Package
            </h1>
            <p className="text-sm text-[#7E1F3E]/70 mt-1">
              Select your package, choose your wedding date, and submit your booking inquiry.
            </p>

            {/* Step Progress Bar */}
            <div className="flex items-center gap-2 mt-5">
              {steps.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 flex-1 last:flex-none">
                  <button
                    type="button"
                    onClick={() => {
                      if (s.id < step) setStep(s.id as 1 | 2 | 3)
                    }}
                    disabled={s.id > step}
                    className={`flex items-center gap-2 group transition-all ${s.id < step ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                      step === s.id
                        ? 'bg-[#C83B68] border-[#C83B68] text-white scale-110'
                        : step > s.id
                          ? 'bg-[#D8F0EC] border-[#C83B68] text-[#C83B68]'
                          : 'bg-white border-gray-200 text-gray-400'
                    }`}>
                      {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${step === s.id ? 'text-[#C83B68]' : step > s.id ? 'text-[#7E1F3E]' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </button>
                  {idx < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 rounded-full transition-all ${step > s.id ? 'bg-[#C83B68]' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ══ STEP 1: Choose Package ══════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* 23-day note */}
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-800">23-Day Advance Booking Policy</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    All destination wedding packages must be booked at least <strong>23 days before</strong> your event date. The earliest available date is{' '}
                    <strong>{minAllowed.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>.
                  </p>
                </div>
              </div>

              {/* Backdrop filter */}
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#7E1F3E] mb-3">Filter by Backdrop</p>
                <div className="flex flex-wrap gap-2">
                  {backdropTabs.map(tab => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setBackdropFilter(tab)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        backdropFilter === tab
                          ? 'bg-[#C83B68] text-white border-[#C83B68] shadow-md'
                          : 'bg-white text-[#7E1F3E] border-[#D8F0EC] hover:border-[#C83B68]/50'
                      }`}
                    >
                      {tab === 'All' ? 'All Backdrops' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Grid */}
              {filteredPackages.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <Package className="w-10 h-10 text-[#C83B68] mx-auto opacity-40" />
                  <p className="text-sm text-[#7E1F3E]/60">No packages match this filter.</p>
                  <button type="button" onClick={() => setBackdropFilter('All')} className="text-xs text-[#C83B68] underline">
                    Show all
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPackages.map(pkg => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      isSelected={selectedPkg?.id === pkg.id}
                      onSelect={() => handleSelectPackage(pkg)}
                    />
                  ))}
                </div>
              )}

              {/* Browse packages link */}
              <div className="text-center pt-2">
                <button type="button" onClick={() => navigate('/packages')}
                  className="inline-flex items-center gap-1.5 text-xs text-[#C83B68] font-semibold hover:underline">
                  <span>Browse full package details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ══ STEP 2: Pick a Date ══════════════════════════════════ */}
          {step === 2 && selectedPkg && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Selected Package Summary */}
              <div className="space-y-5">
                <div>
                  <button type="button" onClick={() => setStep(1)}
                    className="inline-flex items-center gap-1 text-xs text-[#C83B68] font-semibold mb-3 hover:underline">
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to packages
                  </button>
                  <div className="rounded-2xl overflow-hidden border border-[#D8F0EC] shadow-sm bg-white">
                    <div className="relative h-48">
                      <img
                        src={selectedPkg.images?.[0] || selectedPkg.image}
                        alt={selectedPkg.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <p className="text-white font-bold text-lg leading-tight">{selectedPkg.title}</p>
                        <p className="text-white/80 text-xs mt-0.5">{selectedPkg.location}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#5A172D]">
                        <Users className="w-4 h-4 text-[#C83B68]" />
                        <span>{selectedPkg.guestCapacity}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[#5A172D]">
                        <Calendar className="w-4 h-4 text-[#C83B68]" />
                        <span>Backdrop: <strong>{selectedPkg.backdrop}</strong></span>
                      </div>
                      <p className="text-xs text-[#7E1F3E]/70 leading-relaxed line-clamp-3 pt-1 border-t border-[#D8F0EC]">
                        {selectedPkg.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Inclusions */}
                <div className="rounded-2xl bg-white border border-[#D8F0EC] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C83B68] mb-3">What's Included</p>
                  <ul className="space-y-1.5">
                    {selectedPkg.inclusions.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#5A172D]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C83B68] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Calendar */}
              <div className="space-y-5">
                {/* 23-day info pill */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800">
                  <Info className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Bookings open from <strong>{minAllowed.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong> onwards</span>
                </div>

                <div className="rounded-2xl bg-white border border-[#D8F0EC] p-5 shadow-sm">
                  <p className="text-sm font-bold text-[#5A172D] mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#C83B68]" />
                    Select Your Wedding Date
                  </p>
                  <MiniCalendar selectedDate={selectedDate} onSelect={setSelectedDate} />
                </div>

                {/* Selected date confirmation */}
                {selectedDate && (
                  <div className="rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-[#F0F9F8] border border-[#C83B68]/20 p-4 space-y-3">
                    <p className="text-xs font-bold text-[#5A172D] uppercase tracking-wide">Your Selected Date</p>
                    <p className="text-base font-extrabold text-[#C83B68]">{formatDisplay(selectedDate)}</p>
                    <button
                      type="button"
                      onClick={handleConfirmDate}
                      className="w-full py-3 rounded-full bg-gradient-to-r from-[#E05A85] via-[#C83B68] to-[#E05A85] text-white font-bold text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Continue to Confirm Booking</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-center text-[#7E1F3E]/60">
                      You'll need to be signed in to proceed
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══ STEP 3: Confirm Form ═══════════════════════════════ */}
          {step === 3 && selectedPkg && (
            <div className="max-w-xl mx-auto">
              {submitted ? (
                /* Success state */
                <div className="text-center py-12 space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[#D8F0EC] border-2 border-[#C83B68] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-9 h-9 text-[#C83B68]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#5A172D]">Booking Request Received!</h2>
                  <p className="text-sm text-[#7E1F3E]/80 leading-relaxed">
                    Thank you! Our Kerala destination wedding concierge team has received your inquiry for{' '}
                    <strong className="text-[#C83B68]">{selectedPkg.title}</strong> on{' '}
                    <strong className="text-[#C83B68]">{formatDisplay(selectedDate)}</strong>.{' '}
                    We'll reach out within 24 hours.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/packages')}
                      className="px-6 py-2.5 rounded-full bg-white border border-[#D8F0EC] text-[#7E1F3E] font-semibold text-sm hover:bg-[#F0F9F8] transition-all"
                    >
                      Explore More Packages
                    </button>
                    <button
                      type="button"
                      onClick={() => { setStep(1); setSelectedPkg(null); setSubmitted(false); setFormData({ fullName: '', phone: '', email: '', guestCount: '', notes: '' }) }}
                      className="px-6 py-2.5 rounded-full bg-[#C83B68] text-white font-bold text-sm hover:bg-[#A42A51] transition-all shadow-md"
                    >
                      Book Another Package
                    </button>
                  </div>
                </div>
              ) : (
                /* Booking form */
                <div className="space-y-5">
                  <div>
                    <button type="button" onClick={() => setStep(2)}
                      className="inline-flex items-center gap-1 text-xs text-[#C83B68] font-semibold mb-4 hover:underline">
                      <ChevronLeft className="w-3.5 h-3.5" /> Back to date selection
                    </button>

                    {/* Summary pill */}
                    <div className="rounded-2xl bg-white border border-[#D8F0EC] p-4 flex items-center gap-4">
                      <img
                        src={selectedPkg.images?.[0] || selectedPkg.image}
                        alt={selectedPkg.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#5A172D] text-sm truncate">{selectedPkg.title}</p>
                        <p className="text-xs text-[#7E1F3E]/70 truncate">{selectedPkg.location}</p>
                        <p className="text-xs font-semibold text-[#C83B68] mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDisplay(selectedDate)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="rounded-2xl bg-white border border-[#D8F0EC] p-6 space-y-4 shadow-sm">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#C83B68]">Confirm Your Booking</span>
                      <h2 className="text-lg font-bold text-[#5A172D] mt-1">Personal Details</h2>
                    </div>

                    {formError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-[#5A172D] mb-1">Full Name *</label>
                      <div className="relative">
                        <input
                          type="text" required maxLength={80}
                          value={formData.fullName}
                          onChange={e => setFormData(p => ({ ...p, fullName: e.target.value }))}
                          placeholder="e.g. Priya Menon"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F8FFFE] border border-[#D8F0EC] rounded-xl text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                        />
                        <User className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#5A172D] mb-1">Phone / WhatsApp *</label>
                        <div className="relative">
                          <input
                            type="tel" required maxLength={20}
                            value={formData.phone}
                            onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F8FFFE] border border-[#D8F0EC] rounded-xl text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                          />
                          <Phone className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#5A172D] mb-1">Email *</label>
                        <div className="relative">
                          <input
                            type="email" required maxLength={100}
                            value={formData.email}
                            onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                            placeholder="you@example.com"
                            className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F8FFFE] border border-[#D8F0EC] rounded-xl text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                          />
                          <Mail className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A172D] mb-1">Estimated Guest Count</label>
                      <div className="relative">
                        <input
                          type="text" maxLength={10}
                          value={formData.guestCount}
                          onChange={e => setFormData(p => ({ ...p, guestCount: e.target.value }))}
                          placeholder="e.g. 300"
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#F8FFFE] border border-[#D8F0EC] rounded-xl text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                        />
                        <Users className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#5A172D] mb-1">Special Preferences or Rituals</label>
                      <textarea
                        rows={3} maxLength={1000}
                        value={formData.notes}
                        onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                        placeholder="Sadya preferences, Nadaswaram, specific rituals, accessibility needs..."
                        className="w-full p-3 text-sm bg-[#F8FFFE] border border-[#D8F0EC] rounded-xl text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40 resize-none"
                      />
                    </div>

                    {/* CTA */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#E05A85] via-[#C83B68] to-[#E05A85] text-white font-extrabold text-sm shadow-lg hover:brightness-105 active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Sending Request...' : 'Submit Booking Inquiry 🎊'}
                    </button>

                    <p className="text-[11px] text-center text-[#7E1F3E]/50">
                      Zero brokerage · Direct connection with verified Kerala planners
                    </p>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
