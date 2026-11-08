import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Phone, MessageCircle, Share2, Check, ArrowLeft, AlertCircle } from 'lucide-react'
import Layout from '../components/layout/Layout'
import PhotoGallery from '../components/gallery/PhotoGallery'
import SpecsGrid from '../components/detail/SpecsGrid'
import AmenitiesList from '../components/detail/AmenitiesList'
import MapPlaceholder from '../components/detail/MapPlaceholder'
import { useAuditoriumDetail } from '../hooks/useAuditoriumDetail'
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

  // Loading Skeleton State
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
          {/* Skeleton Header */}
          <div className="h-6 w-32 bg-green-900/40 rounded" />

          {/* Gallery Skeleton */}
          <div className="w-full aspect-video max-h-[500px] bg-green-950/60 rounded-xl" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-video bg-green-900/30 rounded-lg" />
            ))}
          </div>

          {/* Title Skeleton */}
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-green-900/40 rounded" />
            <div className="h-5 w-40 bg-green-900/40 rounded" />
          </div>

          {/* Specs Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-green-950/60 rounded-xl" />
            ))}
          </div>

          <div className="h-40 bg-green-950/60 rounded-xl" />
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

  // Extract direct phone and WhatsApp contact
  let callPhone = auditorium.profiles?.phone || ''
  let whatsappPhone = ''

  if (auditorium.amenities && Array.isArray(auditorium.amenities)) {
    for (const item of auditorium.amenities) {
      if (item.startsWith('phone:')) {
        callPhone = item.replace('phone:', '').trim()
      } else if (item.startsWith('whatsapp:')) {
        whatsappPhone = item.replace('whatsapp:', '').trim()
      }
    }
  }

  if (!whatsappPhone && callPhone) {
    whatsappPhone = callPhone
  }

  const cleanWhatsApp = whatsappPhone.replace(/[^0-9]/g, '')
  const formattedWhatsApp =
    cleanWhatsApp.startsWith('91') || cleanWhatsApp.length > 10
      ? cleanWhatsApp
      : cleanWhatsApp
      ? `91${cleanWhatsApp}`
      : ''

  const whatsappMessage = encodeURIComponent(
    `Hello! I found ${auditorium.title} on MANA Venues and would like to enquire about hall availability and booking.`
  )
  const whatsappUrl = formattedWhatsApp
    ? `https://wa.me/${formattedWhatsApp}?text=${whatsappMessage}`
    : ''

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white space-y-6">
        {/* Breadcrumb / Back link */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-green-300/80 hover:text-brand-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to discovery</span>
          </Link>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="px-3.5 py-1.5 rounded-xl font-semibold text-green-100 bg-green-950/60 hover:bg-green-900/60 border border-green-800/40 transition-colors flex items-center gap-2 text-xs sm:text-sm cursor-pointer shadow-xs"
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

        {/* 1. Photo Gallery */}
        <PhotoGallery
          photos={auditorium.photos as string[]}
          title={auditorium.title}
        />

        {/* 2. Title, City Badge, Rating & Price Header */}
        <div className="bg-brand-dark/85 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-green-800/40 shadow-xl space-y-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="bg-green-900/50 text-brand-secondary border border-green-700/40 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold tracking-wide">
              {cityName}
            </span>
            <span className="text-brand-secondary text-sm font-bold tracking-wider" aria-label="Rating 4.5 out of 5 stars">
              ★★★★☆ <span className="text-green-300/60 font-normal text-xs ml-1">(4.8 / 5)</span>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              {auditorium.title}
            </h1>
            <div className="flex items-baseline gap-1.5 shrink-0">
              <span className="text-xs uppercase text-green-300/70 font-semibold">Starting from</span>
              <span className="text-2xl sm:text-3xl font-black text-brand-secondary">
                {formatCurrency(auditorium.base_price_per_day)}
              </span>
              <span className="text-sm font-medium text-green-300/70">/ day</span>
            </div>
          </div>
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

        {/* 6. Map Section */}
        <MapPlaceholder
          address={auditorium.address || ''}
          latitude={auditorium.latitude}
          longitude={auditorium.longitude}
        />

        {/* 7. Venue Host Contact Card */}
        <div className="bg-brand-dark/85 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-green-800/40 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-green-400/70 uppercase tracking-wider">
              Venue Host & Direct Contact
            </div>
            <div className="text-lg sm:text-xl font-bold text-white">
              Listed by {vendorName}
            </div>
            <p className="text-xs sm:text-sm text-green-200/70">
              Reach out directly for date availability, hall tours, package pricing, and reservations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {callPhone && (
              <a
                href={`tel:${callPhone}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span>Call {callPhone}</span>
              </a>
            )}

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 shrink-0" />
                <span>WhatsApp</span>
              </a>
            )}

            {!callPhone && !whatsappUrl && (
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-950/60 border border-green-800/40 text-xs sm:text-sm text-green-300/70">
                <Phone className="w-4 h-4 shrink-0 text-green-500/50" />
                <span>Contact via management office</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
