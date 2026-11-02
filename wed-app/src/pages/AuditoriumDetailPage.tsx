import { useState } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Phone, Share2, Check, ArrowLeft, AlertCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PhotoGallery from '../components/gallery/PhotoGallery'
import SpecsGrid from '../components/detail/SpecsGrid'
import AmenitiesList from '../components/detail/AmenitiesList'
import MapPlaceholder from '../components/detail/MapPlaceholder'
import { useAuditoriumDetail } from '../hooks/useAuditoriumDetail'
import { useAuth } from '../contexts/AuthContext'
import { formatCurrency } from '../lib/utils'
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.warn('Could not copy link:', err)
    }
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/auth/login', { state: { returnUrl: location.pathname } })
    } else {
      const widget = document.getElementById('booking-section')
      if (widget) {
        widget.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  // Loading Skeleton State
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
          {/* Skeleton Header */}
          <div className="h-6 w-32 bg-gray-200 rounded mb-6" />

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left Column Skeleton */}
            <div className="flex-1 space-y-6 w-full">
              <div className="w-full aspect-video max-h-[500px] bg-gray-200 rounded-xl" />
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video bg-gray-200 rounded-lg" />
                ))}
              </div>
              <div className="space-y-3">
                <div className="h-8 w-2/3 bg-gray-200 rounded" />
                <div className="h-5 w-40 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl" />
                ))}
              </div>
              <div className="h-40 bg-gray-200 rounded-xl" />
            </div>

            {/* Right Column Skeleton */}
            <div className="w-full md:w-[380px] shrink-0">
              <div className="h-80 bg-gray-200 rounded-2xl" />
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Venue Not Found</h1>
          <p className="text-gray-600 mb-6">
            The auditorium you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white font-medium hover:bg-brand-primary/90 transition-colors shadow-sm"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb / Back link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-primary transition-colors"
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
                <span className="bg-brand-accent text-brand-primary px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide">
                  {cityName}
                </span>
                <span className="text-brand-secondary text-sm font-bold tracking-wider" aria-label="Rating 4.5 out of 5 stars">
                  ★★★★☆ <span className="text-gray-500 font-normal text-xs ml-1">(4.8 / 5)</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                {auditorium.title}
              </h1>
            </div>

            {/* 3. Specs Grid */}
            <SpecsGrid auditorium={auditorium} />

            {/* 4. Description Section */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-100 space-y-3">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">About This Venue</h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-line">
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
            <div className="sticky top-24 bg-white rounded-2xl shadow-lg p-6 border border-gray-100 space-y-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Book This Venue</h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-xs uppercase text-gray-500 font-semibold">From</span>
                  <span className="text-2xl sm:text-3xl font-black text-brand-primary">
                    {formatCurrency(auditorium.base_price_per_day)}
                  </span>
                  <span className="text-sm font-medium text-gray-500">/ day</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">30% advance on booking</p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleBookNow}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-brand-primary hover:bg-brand-primary/95 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  Book Now
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">Link Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-gray-600" />
                      <span>Share Venue</span>
                    </>
                  )}
                </button>
              </div>

              {/* Vendor Information */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Venue Host
                </div>
                <div className="text-sm font-bold text-gray-900">
                  Listed by {vendorName}
                </div>
                {vendorPhone ? (
                  <a
                    href={`tel:${vendorPhone}`}
                    className="inline-flex items-center gap-2 text-sm text-brand-primary font-medium hover:underline"
                  >
                    <Phone className="w-4 h-4 shrink-0" />
                    <span>{vendorPhone}</span>
                  </a>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                    <span>Contact via booking request</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
