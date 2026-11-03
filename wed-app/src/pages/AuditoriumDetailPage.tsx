import { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Phone, Share2, Check, ArrowLeft, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout'
import PhotoGallery from '../components/gallery/PhotoGallery'
import SpecsGrid from '../components/detail/SpecsGrid'
import AmenitiesList from '../components/detail/AmenitiesList'
import MapPlaceholder from '../components/detail/MapPlaceholder'
import AvailabilityCalendar from '../components/booking/AvailabilityCalendar'
import BookingModal from '../components/booking/BookingModal'
import { useAuditoriumDetail } from '../hooks/useAuditoriumDetail'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency, calculateAdvance, cn } from '../lib/utils'
import type { Auditorium, City } from '../lib/types'

interface JoinedAuditorium extends Auditorium {
  cities?: City | null
  profiles?: {
    full_name: string
    phone: string | null
    email: string
  } | null
}

export default function AuditoriumDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, isLoading, error } = useAuditoriumDetail(slug || '')
  const auditorium = data as unknown as JoinedAuditorium | undefined

  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedPrice, setSelectedPrice] = useState<number>(0)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Could not copy link:', err)
    }
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Skeleton Header */}
          <div className="h-6 w-32 bg-green-900/40 rounded mb-6" />

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column Skeleton */}
            <div className="flex-1 space-y-6 w-full">
              <div className="w-full aspect-video max-h-[500px] bg-green-950/60 rounded-xl" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video bg-green-900/30 rounded-lg" />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-8 w-2/3 bg-green-900/40 rounded" />
                <div className="h-5 w-40 bg-green-900/40 rounded" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-green-950/60 rounded-xl" />
                ))}
              </div>
              <div className="h-40 bg-green-950/60 rounded-xl" />
            </div>

            {/* Right Column Skeleton */}
            <div className="w-full md:w-[380px] shrink-0">
              <div className="h-80 bg-green-950/60 rounded-2xl" />
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  // Error State
  if (error || !auditorium) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-950 text-red-400 mb-4 border border-red-800/40">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Venue Not Found</h1>
          <p className="text-green-200/70 mb-6">
            The auditorium you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-secondary text-brand-dark font-bold hover:bg-brand-secondary/90 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Venues</span>
          </Link>
        </div>
      </Layout>
    )
  }

  const cityName = auditorium.cities?.name || 'Kerala'
  const vendorName = auditorium.profiles?.full_name || 'Verified Partner'
  const vendorPhone = auditorium.profiles?.phone

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white">
        {/* Breadcrumb / Back link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-300/80 hover:text-brand-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to discovery</span>
          </Link>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* LEFT Column */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* 1. Photo Gallery */}
            <PhotoGallery
              photos={auditorium.photos as string[]}
              title={auditorium.title}
            />

            {/* 2. Title, City Badge & Rating */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <span className="bg-green-900/50 text-brand-secondary border border-green-700/40 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide">
                  {cityName}
                </span>
                <span className="text-brand-secondary text-sm font-bold tracking-wider" aria-label="Rating 4.5 out of 5 stars">
                  ★★★★☆ <span className="text-green-300/60 font-normal text-xs ml-1">(4.8 / 5)</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {auditorium.title}
              </h1>
            </div>

            {/* 3. Specs Grid */}
            <SpecsGrid auditorium={auditorium} />

            {/* 4. Description Section */}
            <div className="bg-brand-dark/85 backdrop-blur-md rounded-xl p-5 sm:p-6 border border-green-800/40 shadow-xl space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-white">About This Venue</h3>
              <p className="text-green-100/80 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {auditorium.description ||
                  'Experience timeless celebrations at this premier wedding destination equipped with modern amenities and scenic surroundings.'}
              </p>
            </div>

            {/* 5. Amenities List */}
            <AmenitiesList amenities={auditorium.amenities as string[]} />

            {/* 6. Map Placeholder */}
            <MapPlaceholder
              address={auditorium.address || ''}
              latitude={auditorium.latitude}
              longitude={auditorium.longitude}
            />
          </div>

          {/* RIGHT Column (Sticky Booking Card) */}
          <div className="w-full md:w-[380px] shrink-0" id="booking-section">
            <div className="sticky top-24 bg-brand-dark/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-green-800/50 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Book This Venue</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xs uppercase text-green-300/70 font-semibold">From</span>
                  <span className="text-2xl sm:text-3xl font-black text-brand-secondary">
                    {formatCurrency(auditorium.base_price_per_day)}
                  </span>
                  <span className="text-sm font-medium text-green-300/70">/ day</span>
                </div>
                <p className="text-xs text-green-400/80 mt-1">30% advance on booking</p>
              </div>

              {/* Availability Calendar */}
              <AvailabilityCalendar
                auditoriumId={auditorium.id}
                basePricePerDay={auditorium.base_price_per_day}
                selectedDate={selectedDate}
                onDateSelect={(date, price) => {
                  setSelectedDate(date)
                  setSelectedPrice(price)
                }}
              />

              {/* Selected Date Summary */}
              {selectedDate && (
                <div className="bg-green-950/70 border border-green-700/40 rounded-xl p-3.5 space-y-1.5 text-sm">
                  <div className="flex justify-between items-center text-green-100">
                    <span className="text-xs font-semibold text-green-300/70 uppercase">Selected</span>
                    <span className="font-semibold text-white">
                      {format(selectedDate, 'EEEE, d MMM yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-100">
                    <span className="text-xs font-semibold text-green-300/70 uppercase">Total</span>
                    <span className="font-bold text-brand-secondary">
                      {formatCurrency(selectedPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-100 border-t border-green-800/40 pt-1.5">
                    <span className="text-xs font-semibold text-green-300/70 uppercase">Advance (30%)</span>
                    <span className="font-bold text-brand-secondary">
                      {formatCurrency(calculateAdvance(selectedPrice, 0.3))}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  disabled={!selectedDate}
                  onClick={() => {
                    if (!selectedDate) return
                    if (!user) {
                      navigate('/auth/login', { state: { returnUrl: location.pathname } })
                    } else {
                      setIsBookingModalOpen(true)
                    }
                  }}
                  className={cn(
                    'w-full py-3.5 px-4 rounded-xl font-bold shadow-md transition-all',
                    selectedDate
                      ? 'bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark hover:shadow-lg active:scale-[0.98] cursor-pointer'
                      : 'bg-green-950/80 text-green-700 cursor-not-allowed shadow-none border border-green-900/40'
                  )}
                >
                  Book This Date
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-green-100 bg-green-950/60 hover:bg-green-900/60 border border-green-800/40 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-brand-secondary" />
                      <span className="text-brand-secondary font-medium">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-green-300" />
                      <span>Share Venue</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vendor Information */}
              <div className="pt-4 border-t border-green-800/40 space-y-2">
                <div className="text-xs font-semibold text-green-400/70 uppercase tracking-wider">
                  Venue Host
                </div>
                <div className="text-sm font-bold text-white">
                  Listed by {vendorName}
                </div>
                {vendorPhone ? (
                  <a
                    href={`tel:${vendorPhone}`}
                    className="inline-flex items-center gap-2 text-sm text-brand-secondary font-medium hover:underline"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{vendorPhone}</span>
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-green-400/60">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-green-500/50" />
                    <span>Contact via booking request</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isBookingModalOpen && selectedDate && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          auditorium={{
            id: auditorium.id,
            title: auditorium.title,
            base_price_per_day: auditorium.base_price_per_day,
          }}
          date={selectedDate}
          totalPrice={selectedPrice}
        />
      )}
    </Layout>
  )
}
