import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Heart,
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  X,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Star,
  ChevronLeft,
  MapPin,
  Calendar,
  Info,
} from 'lucide-react'

const MIN_LEAD_DAYS = 23
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}
function getIST_YYYY_MM_DD(d: Date): string {
  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(d.getTime() + istOffset)
  return istTime.toISOString().split('T')[0]
}
import CoolCameraIcon from '../components/common/CoolCameraIcon'
import Layout from '../components/layout/Layout'
import PhotographyMotionHero from '../components/photography/PhotographyMotionHero'
import {
  usePhotographyStore,
  type PhotographyCategory,
  type PhotographyPackage,
} from '../store/photographyStore'
import { useLoginGate } from '../contexts/LoginGateContext'
import { useAuth } from '../contexts/AuthContext'
import { useCityStore } from '../store/cityStore'
import { matchesPackageCities } from '../lib/cityMatch'
import { MultiCitySelector } from '../components/common/MultiCitySelector'
import {
  checkRateLimit,
  recordRateLimitAttempt,
  formatRateLimitMessage,
} from '../lib/rateLimit'

export default function PhotographyPage() {
  const { requireAuth } = useLoginGate()
  const { user, profile } = useAuth()
  const selectedCity = useCityStore((s) => s.selectedCity)
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'
  const isPhotoVendor = profile?.role === 'vendor' && profile?.vendor_type === 'photographer'
  const canManagePhotography = Boolean(isAdmin || isPhotoVendor)

  const [searchParams, setSearchParams] = useSearchParams()
  const packagesListRef = useRef<HTMLDivElement>(null)

  const packages = usePhotographyStore((s) => s.packages)
  const selectedCategory = usePhotographyStore((s) => s.selectedCategory)
  const setSelectedCategory = usePhotographyStore((s) => s.setSelectedCategory)
  const addPackage = usePhotographyStore((s) => s.addPackage)
  const updatePackage = usePhotographyStore((s) => s.updatePackage)
  const deletePackage = usePhotographyStore((s) => s.deletePackage)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [pincodes, setPincodes] = useState<Record<string, string>>({})
  const [inquiryPackage, setInquiryPackage] = useState<PhotographyPackage | null>(null)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [inquiryError, setInquiryError] = useState<string | null>(null)

  // Add/Edit modal state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<PhotographyPackage | null>(null)

  // Photography package form state
  const [pkgTitle, setPkgTitle] = useState('')
  const [pkgCategory, setPkgCategory] = useState<PhotographyCategory>('wedding')
  const [pkgTagline, setPkgTagline] = useState('')
  const [pkgPrice, setPkgPrice] = useState('')
  const [pkgDuration, setPkgDuration] = useState('')
  const [pkgTeamSize, setPkgTeamSize] = useState('')
  const [pkgGear, setPkgGear] = useState('')
  const [pkgBadge, setPkgBadge] = useState('')
  const [pkgImage, setPkgImage] = useState('/photo-wedding.jpg')
  const [pkgInclusionsText, setPkgInclusionsText] = useState('')
  const [pkgReels, setPkgReels] = useState('')
  const [pkgPhotos, setPkgPhotos] = useState('')
  const [pkgFilms, setPkgFilms] = useState('')
  const [pkgDelivery, setPkgDelivery] = useState('')
  const [pkgCities, setPkgCities] = useState<string[]>([])

  const handleOpenAddModal = () => {
    setPkgTitle('')
    setPkgCategory('wedding')
    setPkgTagline('')
    setPkgPrice('Price on Demand')
    setPkgDuration('')
    setPkgTeamSize('')
    setPkgGear('')
    setPkgBadge('')
    setPkgImage('/photo-wedding.jpg')
    setPkgInclusionsText('')
    setPkgReels('')
    setPkgPhotos('')
    setPkgFilms('')
    setPkgDelivery('')
    setPkgCities([])
    setEditingPkg(null)
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditModal = (pkg: PhotographyPackage) => {
    setPkgTitle(pkg.title)
    setPkgCategory(pkg.category)
    setPkgTagline(pkg.tagline)
    setPkgPrice(pkg.price)
    setPkgDuration(pkg.duration)
    setPkgTeamSize(pkg.teamSize)
    setPkgGear(pkg.gear)
    setPkgBadge(pkg.badge)
    setPkgImage(pkg.image)
    setPkgInclusionsText(pkg.inclusions.join('\n'))
    setPkgReels(pkg.deliverables.reels)
    setPkgPhotos(pkg.deliverables.photos)
    setPkgFilms(pkg.deliverables.films)
    setPkgDelivery(pkg.deliverables.deliveryTime)
    setPkgCities(pkg.cities || [])
    setEditingPkg(pkg)
    setIsAddEditModalOpen(true)
  }

  const categoryLabels: Record<PhotographyCategory, string> = {
    wedding: 'Wedding Photography',
    mobile: 'Mobile Photography',
    normal: 'Normal Photography',
  }

  const handleSavePhotographyPackage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pkgTitle.trim() || !pkgPrice.trim()) {
      alert('Please fill in at least a title and price.')
      return
    }
    if (pkgCities.length === 0) {
      alert('Please select at least one service city.')
      return
    }
    const inclusionsArray = pkgInclusionsText.split('\n').map((s) => s.trim()).filter(Boolean)

    if (editingPkg) {
      updatePackage(editingPkg.id, {
        title: pkgTitle.trim(),
        category: pkgCategory,
        categoryLabel: categoryLabels[pkgCategory],
        tagline: pkgTagline.trim(),
        price: pkgPrice.trim(),
        duration: pkgDuration.trim(),
        teamSize: pkgTeamSize.trim(),
        gear: pkgGear.trim(),
        badge: pkgBadge.trim(),
        image: pkgImage.trim() || '/photo-wedding.jpg',
        inclusions: inclusionsArray,
        cities: pkgCities,
        deliverables: {
          reels: pkgReels.trim(),
          photos: pkgPhotos.trim(),
          films: pkgFilms.trim(),
          deliveryTime: pkgDelivery.trim(),
        },
      })
    } else {
      const newPkg: PhotographyPackage = {
        id: `photo-${Date.now()}`,
        title: pkgTitle.trim(),
        category: pkgCategory,
        categoryLabel: categoryLabels[pkgCategory],
        tagline: pkgTagline.trim(),
        price: pkgPrice.trim(),
        duration: pkgDuration.trim(),
        teamSize: pkgTeamSize.trim(),
        gear: pkgGear.trim(),
        badge: pkgBadge.trim() || 'Custom Package',
        image: pkgImage.trim() || '/photo-wedding.jpg',
        highlights: ['HD Footage', 'Professional Crew', 'Quick Delivery'],
        inclusions: inclusionsArray,
        cities: pkgCities,
        deliverables: {
          reels: pkgReels.trim(),
          photos: pkgPhotos.trim(),
          films: pkgFilms.trim(),
          deliveryTime: pkgDelivery.trim(),
        },
        vendorId: profile?.id,
        vendorName: profile?.business_name || profile?.full_name || 'MANA Verified Photographer',
      }
      addPackage(newPkg)
    }
    setIsAddEditModalOpen(false)
  }

  // Form state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [notes, setNotes] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Sync category with URL query param if present (e.g. /photography?type=wedding)
  useEffect(() => {
    const typeParam = searchParams.get('type') as PhotographyCategory | null
    if (
      typeParam &&
      ['wedding', 'mobile', 'normal'].includes(typeParam)
    ) {
      setSelectedCategory(typeParam)
    }
  }, [searchParams, setSelectedCategory])

  const handleCategoryFilter = (cat: PhotographyCategory | 'all') => {
    setSelectedCategory(cat)
    if (cat === 'all') {
      searchParams.delete('type')
    } else {
      searchParams.set('type', cat)
    }
    setSearchParams(searchParams, { replace: true })
  }

  const handleScrollToPackages = () => {
    packagesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    const matchesCity = matchesPackageCities(pkg.cities, selectedCity, undefined, true)
    const matchesCategory =
      selectedCategory === 'all' || pkg.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.gear.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCity && matchesCategory && matchesSearch
  })

  const handleOpenPackage = (pkgId: string) => {
    requireAuth('to view exclusive wedding package details, pricing, and booking dates', () => {
      setSelectedPackageId(pkgId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Guard selectedPackageId so unauthenticated users cannot view packages without signing in
  useEffect(() => {
    if (selectedPackageId && !user) {
      const pendingPkgId = selectedPackageId
      setSelectedPackageId(null)
      requireAuth('to view exclusive wedding package details, pricing, and booking dates', () => {
        setSelectedPackageId(pendingPkgId)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
    }
  }, [selectedPackageId, user, requireAuth])

  const renderPackageCard = (pkg: PhotographyPackage) => {
    return (
      <div
        key={pkg.id}
        onClick={() => handleOpenPackage(pkg.id)}
        className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer active:scale-[0.98] group hover:-translate-y-1"
      >
        {/* Top Image & Wishlist Button */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={pkg.image}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <button
            type="button"
            aria-label="Save package"
            onClick={(e) => {
              e.stopPropagation()
            }}
            className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/60 active:scale-90 transition-transform"
          >
            <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
          </button>
        </div>

        {/* Card Details matching Destination Wedding style */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B8710B] block truncate">
              {pkg.vendorName || pkg.categoryLabel || 'PHOTOGRAPHY'}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2">
              {pkg.title}
            </h3>
            {/* 5-star rating + (0) */}
            <div className="flex items-center gap-1 pt-0.5">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-gray-200 text-gray-300" />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium">(0)</span>
            </div>
          </div>

          {/* Price on Request Pill Badge */}
          <div className="pt-1.5">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FFF5E6] text-[#B8710B] text-[10px] sm:text-xs font-bold border border-[#FFE0B2]">
              {pkg.price || 'Price on Request'}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderPackageArticle = (pkg: PhotographyPackage) => {
    const canEditPkg = Boolean(isAdmin || (isPhotoVendor && pkg.vendorId === profile?.id))

    return (
      <article
        key={pkg.id}
        id={`package-${pkg.id}`}
        className="package-card-pop group rounded-2xl overflow-hidden bg-white backdrop-blur-md border border-[#D8F0EC] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col will-change-[transform,opacity] scroll-mt-24"
      >
        <div className="flex flex-col lg:flex-row">
          {/* Left: Photo & Camera Rig Spec */}
          <div className="w-full lg:w-[48%] shrink-0 p-5 sm:p-6 lg:p-7 space-y-3">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-black/10 border border-[#D8F0EC]">
              <img
                src={pkg.image}
                alt={pkg.title}
                className="w-full h-full object-cover"
              />
              {/* Category Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#D8F0EC] text-[11px] font-bold text-[#7E1F3E] shadow-2xs">
                <span>{pkg.categoryLabel}</span>
              </div>

              {/* Admin Edit/Delete */}
              {canEditPkg && (
                <div
                  className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(pkg)}
                    aria-label={`Edit ${pkg.title}`}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-md text-[#C83B68] hover:bg-white border border-[#D8F0EC] shadow-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete "${pkg.title}"?`)) {
                        deletePackage(pkg.id)
                        setSelectedPackageId(null)
                      }
                    }}
                    aria-label={`Delete ${pkg.title}`}
                    className="p-2 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-50 border border-red-200 shadow-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Camera Rig spec callout */}
            {pkg.gear && (
              <div className="p-3 rounded-xl bg-[#F0F9F8] border border-[#D8F0EC] text-xs font-mono text-[#5A172D]">
                <span className="font-bold text-[#C83B68] block text-[10px] uppercase tracking-wider mb-0.5">
                  CAMERA RIG SPECIFICATION
                </span>
                <span className="font-semibold">{pkg.gear}</span>
              </div>
            )}
          </div>

          {/* Right: Package Details */}
          <div className="flex-1 p-5 sm:p-6 lg:p-7 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B8710B] block">
                {pkg.vendorName || pkg.categoryLabel || 'PHOTOGRAPHY'}
              </span>

              <h1
                className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] leading-tight"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                {pkg.title}
              </h1>

              {/* 5-star rating + (0) */}
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-gray-200 text-gray-300" />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">(0)</span>
              </div>

              {/* Price Badge */}
              <div className="pt-1">
                <span className="inline-block px-3 py-1 rounded-md bg-[#FFF5E6] text-[#B8710B] text-xs sm:text-sm font-bold border border-[#FFE0B2]">
                  {pkg.price || 'Price on Request'}
                </span>
              </div>

              {/* Tagline / Description */}
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                {pkg.tagline}
              </p>

              {/* Deliverables Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Video className="w-3.5 h-3.5 text-[#C83B68]" />
                    <span>Reels</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1">{pkg.deliverables.reels}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <ImageIcon className="w-3.5 h-3.5 text-[#C83B68]" />
                    <span>Photos</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1">{pkg.deliverables.photos}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-[#C83B68]" />
                    <span>Films</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1">{pkg.deliverables.films}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-[#C83B68]" />
                    <span>Delivery</span>
                  </div>
                  <p className="text-xs font-bold text-gray-900 mt-1 truncate">{pkg.deliverables.deliveryTime}</p>
                </div>
              </div>

              {/* Crew & Duration */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-gray-700 font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Clock className="w-3.5 h-3.5 text-[#C83B68]" />
                  <span>{pkg.duration}</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                  <Users className="w-3.5 h-3.5 text-[#C83B68]" />
                  <span>{pkg.teamSize}</span>
                </span>
              </div>

              {/* Inclusions */}
              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block">
                    PACKAGE INCLUSIONS
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {pkg.inclusions.map((inc, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2 text-xs text-gray-700 font-medium">
                        <CheckCircle2 className="w-4 h-4 text-[#C83B68] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* AVAILABILITY BOX matching Destination Wedding */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 space-y-3.5 shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">
                AVAILABILITY
              </span>

              {/* Location Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    value={pincodes[pkg.id] ?? '682001'}
                    onChange={(e) => {
                      const val = e.target.value
                      setPincodes((prev) => ({ ...prev, [pkg.id]: val }))
                    }}
                    placeholder="Enter pincode or city..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 transition-all"
                  />
                  <MapPin className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {(pincodes[pkg.id] ?? '682001') && (
                    <button
                      type="button"
                      onClick={() => setPincodes((prev) => ({ ...prev, [pkg.id]: '' }))}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Event Date Input */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Event Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={eventDate || getIST_YYYY_MM_DD(addDays(new Date(), MIN_LEAD_DAYS))}
                    min={getIST_YYYY_MM_DD(addDays(new Date(), MIN_LEAD_DAYS))}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 text-xs bg-gray-50/70 border border-gray-200 rounded-lg text-gray-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 transition-all cursor-pointer"
                  />
                  <Calendar className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="mt-1.5 text-[11px] font-medium text-rose-500">
                  Booking must be made at least 23 days in advance. Earliest available date is{' '}
                  {getIST_YYYY_MM_DD(addDays(new Date(), MIN_LEAD_DAYS))}.
                </p>
              </div>
            </div>

            {/* CANCELLATION POLICY BOX */}
            <div className="rounded-2xl border-l-4 border-l-amber-500 border border-amber-200 bg-amber-50/40 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>CANCELLATION POLICY</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc marker:text-amber-500">
                <li>50% refund available for cancellations made at least 7 days prior to the event date.</li>
                <li>No refund will be provided for cancellations made within 7 days of event date.</li>
              </ul>
              <p className="text-[11px] text-gray-500 italic pt-0.5">
                Standard processing charges may apply and are non-refundable.
              </p>
            </div>

            {/* PAYMENT POLICY BOX */}
            <div className="rounded-2xl border-l-4 border-l-sky-500 border border-sky-200 bg-sky-50/40 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-sky-800 text-xs font-bold uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-sky-600" />
                <span>PAYMENT POLICY</span>
              </div>
              <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc marker:text-sky-500">
                <li>An advance payment of 10% of the total amount is required online for confirmation.</li>
                <li>The remaining balance will be collected at the time of delivery.</li>
                <li>Remaining payments will be collected directly by {pkg.vendorName || 'Verified Partner'}.</li>
              </ul>
            </div>

            {/* MAKE AN ENQUIRY CTA BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  requireAuth(`to inquire about "${pkg.title}"`, () => {
                    setInquiryPackage(pkg)
                    setInquirySuccess(false)
                  })
                }}
                className="px-8 py-3 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Make an Enquiry
              </button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  const handleInquireSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryError(null)

    const rateCheck = checkRateLimit('inquiry_photography', 2, 60)
    if (!rateCheck.allowed) {
      setInquiryError(formatRateLimitMessage(rateCheck.retryAfterSeconds, 'inquiry'))
      return
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Please provide your name and contact phone number.')
      return
    }
    setFormSubmitting(true)
    recordRateLimitAttempt('inquiry_photography', 60)
    setTimeout(() => {
      setFormSubmitting(false)
      setInquirySuccess(true)
    }, 700)
  }

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Section with Live Motion Graphic Animation */}
        <PhotographyMotionHero
          onSelectCategory={(cat) => handleCategoryFilter(cat)}
          onExplorePackages={handleScrollToPackages}
        />

        {/* PHOTOGRAPHY PACKAGES BROWSER SECTION */}
        <div
          ref={packagesListRef}
          id="photography-packages"
          className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6 sm:pb-12 scroll-mt-20"
        >
          {/* Header & Filter Bar (Shown when !selectedPackageId) */}
          {!selectedPackageId && (
            <div className="mb-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight text-left drop-shadow-xs"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    Photography Packages
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                    Discover verified camera crews and wedding cinematographers
                  </p>
                </div>

                {/* Search Input & Vendor Add Button */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="w-full md:w-72">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search packages, gear, reels..."
                      className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-full text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 shadow-2xs"
                    />
                  </div>
                  {canManagePhotography && (
                    <button
                      type="button"
                      onClick={handleOpenAddModal}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#C83B68] hover:bg-[#A82B54] text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add Package</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Packages found counter */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  <strong className="text-gray-900 font-bold">{filteredPackages.length}</strong> packages found
                </span>
              </div>
            </div>
          )}

          {/* Packages Display (Cards Grid when !selectedPackageId, or Full Detailed Article when selected) */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#D8F0EC] shadow-sm max-w-md mx-auto space-y-3">
              <CoolCameraIcon className="w-12 h-12 text-[#C83B68] mx-auto opacity-70" />
              <h3 className="text-lg font-bold text-[#5A172D]">No Matching Packages</h3>
              <p className="text-xs text-black/60">
                We couldn't find any packages matching "{searchQuery}". Try selecting another category or resetting your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="px-4 py-2 rounded-full bg-[#C83B68] text-white font-bold text-xs cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {!selectedPackageId ? (
                <>
                  {/* Desktop: Aligned Packages Grid */}
                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map((pkg) => renderPackageCard(pkg))}
                  </div>

                  {/* Mobile: 2-Column Small Cards Grid */}
                  <div className="grid grid-cols-2 gap-3.5 lg:hidden">
                    {filteredPackages.map((pkg) => renderPackageCard(pkg))}
                  </div>
                </>
              ) : (
                /* Detail View with Back Button */
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPackageId(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:text-black shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#B8710B]" />
                    <span>Back to all packages</span>
                  </button>

                  {filteredPackages
                    .filter((p) => p.id === selectedPackageId)
                    .map((pkg) => renderPackageArticle(pkg))}
                </div>
              )}
            </>
          )}
        </div>

        {/* INQUIRY MODAL */}
        {inquiryPackage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-[#FFF2F6] border border-[#D8F0EC] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setInquiryPackage(null)}
                className="absolute top-4 right-4 p-1.5 text-[#7E1F3E] hover:text-[#5A172D] rounded-full bg-white border border-[#D8F0EC]"
              >
                <X className="w-4 h-4" />
              </button>

              {inquirySuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-white border border-[#D8F0EC] flex items-center justify-center mx-auto text-[#C83B68]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#5A172D]">Inquiry Sent Successfully</h3>
                  <p className="text-xs sm:text-sm text-[#7E1F3E]/80">
                    Our lead visual director has received your request for{' '}
                    <strong className="text-[#C83B68]">{inquiryPackage.title}</strong>. We will contact you at{' '}
                    <strong>{clientPhone}</strong> within 4 business hours with custom crew availability and portfolio reels.
                  </p>
                  <button
                    type="button"
                    onClick={() => setInquiryPackage(null)}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#C83B68] text-white font-bold text-xs shadow-md"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquireSubmit} className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C83B68]">
                      {inquiryPackage.categoryLabel}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#5A172D]">
                      Inquire: {inquiryPackage.title}
                    </h3>
                    <p className="text-xs text-[#7E1F3E]/70 font-medium">
                      Pricing: {inquiryPackage.price} • {inquiryPackage.duration}
                    </p>
                  </div>

                  {inquiryError && (
                    <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#5A172D] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Ananya Nair"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#5A172D] mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#5A172D] mb-1">
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A172D] mb-1">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        value={clientEmail}
                        onChange={(e) => setClientEmail(e.target.value)}
                        placeholder="ananya@example.com"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#5A172D] mb-1">
                        Ceremonies / Special Requirements
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Tell us about your events (Muhurtham, Haldi, Reception), preferred shoot locations, or drone preferences..."
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/40 resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setInquiryPackage(null)}
                      className="px-4 py-2 rounded-full bg-white text-[#7E1F3E] text-xs font-bold border border-[#D8F0EC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2 rounded-full bg-gradient-to-r from-[#C83B68] to-[#E05A85] text-white text-xs font-extrabold shadow-md active:scale-95 transition-all disabled:opacity-50"
                    >
                      {formSubmitting ? 'Sending Request...' : 'Send Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Vendor / Admin: Add / Edit Photography Package Modal */}
      {isAddEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#D8F0EC] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-bold text-[#5A172D] mb-4 flex items-center gap-2">
              <CoolCameraIcon className="w-5 h-5 text-[#C83B68]" />
              <span>{editingPkg ? 'Edit Photography Package' : 'Add Photography Package'}</span>
            </h3>

            <form onSubmit={handleSavePhotographyPackage} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Package Title *</label>
                  <input
                    type="text"
                    required
                    value={pkgTitle}
                    onChange={(e) => setPkgTitle(e.target.value)}
                    placeholder="e.g. Grand Royal Wedding"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Category *</label>
                  <select
                    value={pkgCategory}
                    onChange={(e) => setPkgCategory(e.target.value as PhotographyCategory)}
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  >
                    <option value="wedding">Wedding Photography</option>
                    <option value="mobile">Mobile Photography</option>
                    <option value="normal">Normal Photography</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Tagline</label>
                <input
                  type="text"
                  value={pkgTagline}
                  onChange={(e) => setPkgTagline(e.target.value)}
                  placeholder="Short highlight caption"
                  className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    value={pkgPrice}
                    onChange={(e) => setPkgPrice(e.target.value)}
                    placeholder="e.g. Price on Demand"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Duration</label>
                  <input
                    type="text"
                    value={pkgDuration}
                    onChange={(e) => setPkgDuration(e.target.value)}
                    placeholder="e.g. 3 Days"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Team Size</label>
                  <input
                    type="text"
                    value={pkgTeamSize}
                    onChange={(e) => setPkgTeamSize(e.target.value)}
                    placeholder="e.g. 4-Crew"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Camera Gear</label>
                <input
                  type="text"
                  value={pkgGear}
                  onChange={(e) => setPkgGear(e.target.value)}
                  placeholder="e.g. Sony FX3 • DJI Drone • 70-200mm GM"
                  className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                />
              </div>

              <MultiCitySelector
                theme="light"
                selectedCities={pkgCities}
                onChange={setPkgCities}
              />

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={pkgBadge}
                  onChange={(e) => setPkgBadge(e.target.value)}
                  placeholder="e.g. Most Popular"
                  className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Image URL</label>
                <input
                  type="text"
                  value={pkgImage}
                  onChange={(e) => setPkgImage(e.target.value)}
                  placeholder="/photo-wedding.jpg"
                  className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Reels Deliverable</label>
                  <input
                    type="text"
                    value={pkgReels}
                    onChange={(e) => setPkgReels(e.target.value)}
                    placeholder="e.g. 3 Viral Reels"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Photos Deliverable</label>
                  <input
                    type="text"
                    value={pkgPhotos}
                    onChange={(e) => setPkgPhotos(e.target.value)}
                    placeholder="e.g. 600+ Retouched"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Film Deliverable</label>
                  <input
                    type="text"
                    value={pkgFilms}
                    onChange={(e) => setPkgFilms(e.target.value)}
                    placeholder="e.g. 25-min 4K Film"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Delivery Time</label>
                  <input
                    type="text"
                    value={pkgDelivery}
                    onChange={(e) => setPkgDelivery(e.target.value)}
                    placeholder="e.g. 21 Days"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-black/80 mb-1">Inclusions (one per line)</label>
                <textarea
                  rows={4}
                  value={pkgInclusionsText}
                  onChange={(e) => setPkgInclusionsText(e.target.value)}
                  placeholder="Coverage of Haldi, Muhurtham & Reception&#10;4K drone aerial shots&#10;Luxury leather album"
                  className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl resize-y"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#7E1F3E] hover:text-[#5A172D]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E05A85] via-[#F3A2BE] to-[#E05A85] text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                >
                  {editingPkg ? 'Save Changes' : 'Add Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}


