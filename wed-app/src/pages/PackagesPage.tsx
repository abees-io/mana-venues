import { useState, useId, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import gsap from 'gsap'
import Layout from '../components/layout/Layout'
import StackedDestinationImages from '../components/home/StackedDestinationImages'
import LoopingPackagesStack from '../components/packages/LoopingPackagesStack'
import ReelPlayerCard from '../components/packages/ReelPlayerCard'
import PackageFormModal from '../components/modals/PackageFormModal'
import ReelFormModal from '../components/modals/ReelFormModal'
import { useAuth } from '../contexts/AuthContext'
import { useLoginGate } from '../contexts/LoginGateContext'
import {
  checkRateLimit,
  recordRateLimitAttempt,
  formatRateLimitMessage,
} from '../lib/rateLimit'
import {
  usePackagesStore,
  packageMatchesCity,
  type WeddingPackage,
  type PackageReel,
} from '../store/packagesStore'
import { useCityStore } from '../store/cityStore'
import LocationModal from '../components/modals/LocationModal'
import {
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  X,
  Search,
  Phone,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
  Package,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Film,
  Undo2,
  Redo2,
  Save,
  Monitor,
  Smartphone,
  Check,
  CopyCheck,
  Lock,
  Info,
  Clock,
  Heart,
  Share2,
  MessageCircle,
  SlidersHorizontal,
  Star,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
} from 'lucide-react'

// ─── 23-Day Advance Booking Settings ───────────────────────────────────
const MIN_LEAD_DAYS = 23

function getIST_YYYY_MM_DD(date: Date): string {
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

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.89 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

function PackageImageGallery({
  pkg,
  isAdmin,
  onEdit,
  onDelete,
}: {
  pkg: WeddingPackage
  isAdmin: boolean
  onEdit: () => void
  onDelete: () => void
}) {
  const photos = pkg.images?.length ? pkg.images : [pkg.image]
  const [photoIdx, setPhotoIdx] = useState(0)
  const safeIdx = photoIdx < photos.length ? photoIdx : 0

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Main Image Stage */}
      <div className="relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-2xl bg-[#FDF0F4] border border-[#D8F0EC]/60 group">
        <img
          src={photos[safeIdx]}
          alt={pkg.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Location tag in photo corner */}
        <div className="absolute bottom-3 right-3 text-[11px] font-bold tracking-wider uppercase text-white/90 drop-shadow-sm pointer-events-none">
          {pkg.location}
        </div>

        {/* Carousel arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)
              }}
              aria-label="Previous photo"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setPhotoIdx((prev) => (prev + 1) % photos.length)
              }}
              aria-label="Next photo"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-gray-800 shadow-md backdrop-blur-xs transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Admin Edit/Delete */}
        {isAdmin && (
          <div
            className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${pkg.title}`}
              className="p-2 rounded-full bg-white/90 backdrop-blur-md text-[#C83B68] hover:bg-white border border-[#D8F0EC] shadow-md transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${pkg.title}`}
              className="p-2 rounded-full bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-50 border border-red-200 shadow-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {photos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {photos.map((src, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPhotoIdx(idx)}
              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${idx === safeIdx
                  ? 'border-[#C83B68] ring-2 ring-[#C83B68]/30 shadow-xs'
                  : 'border-transparent opacity-70 hover:opacity-100'
                }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PackagesPage() {
  const { user, profile } = useAuth()
  const { requireAuth } = useLoginGate()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'
  const isPlannerVendor =
    profile?.role === 'vendor' &&
    (!profile?.vendor_type || profile?.vendor_type === 'wedding_planner' || profile?.vendor_type === 'destination_wedding')
  const canManagePackages = Boolean(isAdmin || isPlannerVendor)
  const pageRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const [activePackageIndex, setActivePackageIndex] = useState(0)
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedPlannerFilter, setSelectedPlannerFilter] = useState('All')
  const prevPackagesLengthRef = useRef(0)
  const selectedCity = useCityStore((s) => s.selectedCity)
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  // (packages list is always shown)

  // Smooth scroll when navigating with hash (e.g. from Explore Categories "Destination Wedding")
  useEffect(() => {
    const targetHash = location.hash || window.location.hash
    if (
      targetHash === '#packages-section' ||
      targetHash === '#packages-grid' ||
      targetHash === '#packages-list'
    ) {
      const timer = setTimeout(() => {
        const el = document.getElementById('packages-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 180)
      return () => clearTimeout(timer)
    } else if (targetHash.startsWith('#package-')) {
      const pkgId = targetHash.replace('#package-', '')
      const idx = packages.findIndex((p) => p.id === pkgId)
      if (idx !== -1) {
        setActivePackageIndex(idx)
      }
      const timer = setTimeout(() => {
        const el = document.getElementById('packages-section')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 180)
      return () => clearTimeout(timer)
    }
  }, [location.hash])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Hero text & controls starting reveal
      gsap.fromTo(
        '.packages-hero-reveal',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.1,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity',
        }
      )

      // 2. Stacked destination images entrance animation
      gsap.fromTo(
        '.packages-stack-animate',
        { scale: 0.9, y: 28, opacity: 0, rotate: -2 },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          rotate: 0,
          duration: 0.85,
          delay: 0.18,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity',
        }
      )

      // 3. Explore packages square cards entrance cascade
      gsap.fromTo(
        '.package-square-card-animate',
        { opacity: 0, y: 25, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.25,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform,opacity',
          force3D: true,
        }
      )

      // 4. Package cards staggered stack entrance
      gsap.fromTo(
        '.package-card-animate',
        { y: 30, opacity: 0, scale: 0.98 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.65,
          delay: 0.35,
          stagger: 0.1,
          ease: 'power3.out',
          force3D: true,
          clearProps: 'transform,opacity',
        }
      )
    }, pageRef)

    return () => ctx.revert()
  }, [])

  const packages = usePackagesStore((s) => s.packages)
  const fetchGlobalPackages = usePackagesStore((s) => s.fetchGlobalPackages)

  useEffect(() => {
    fetchGlobalPackages()
  }, [fetchGlobalPackages])

  const past = usePackagesStore((s) => s.past)
  const future = usePackagesStore((s) => s.future)
  const undo = usePackagesStore((s) => s.undo)
  const redo = usePackagesStore((s) => s.redo)
  const savedDesktopAt = usePackagesStore((s) => s.savedDesktopAt)
  const savedMobileAt = usePackagesStore((s) => s.savedMobileAt)
  const saveDesktopEdits = usePackagesStore((s) => s.saveDesktopEdits)
  const saveMobileEdits = usePackagesStore((s) => s.saveMobileEdits)
  const applyLayoutToAllPackages = usePackagesStore((s) => s.applyLayoutToAllPackages)
  const [saveFeedback, setSaveFeedback] = useState<boolean>(false)
  const [hasSavedSession, setHasSavedSession] = useState(false)
  const [lastEditedPkgId, setLastEditedPkgId] = useState<string | null>(null)
  const [appliedAllPkgId, setAppliedAllPkgId] = useState<string | null>(null)

  const handleSaveEdits = () => {
    saveDesktopEdits()
    saveMobileEdits()
    setHasSavedSession(true)
    setSaveFeedback(true)
    setTimeout(() => setSaveFeedback(false), 2200)
  }

  const handleApplyToAll = (pkgId?: string | null) => {
    const targetId = pkgId || lastEditedPkgId || packages[0]?.id
    if (!targetId) return
    applyLayoutToAllPackages(targetId)
    setAppliedAllPkgId(targetId)
    setTimeout(() => setAppliedAllPkgId(null), 2200)
  }
  const deletePackage = usePackagesStore((s) => s.deletePackage)
  const updatePackageReel = usePackagesStore((s) => s.updatePackageReel)
  const deletePackageReel = usePackagesStore((s) => s.deletePackageReel)
  const reorderPackageReels = usePackagesStore((s) => s.reorderPackageReels)
  const movePackageReel = usePackagesStore((s) => s.movePackageReel)

  // Cursor Drag-and-Drop states (Admin only)
  const [draggedReel, setDraggedReel] = useState<{
    pkgId: string
    reelId: string
    index: number
  } | null>(null)

  const handleDropReel = (targetPkgId: string, targetIndex?: number) => {
    if (!draggedReel) return
    if (draggedReel.pkgId === targetPkgId) {
      if (typeof targetIndex === 'number' && draggedReel.index !== targetIndex) {
        reorderPackageReels(targetPkgId, draggedReel.index, targetIndex)
      }
    } else {
      movePackageReel(draggedReel.pkgId, targetPkgId, draggedReel.reelId, targetIndex)
    }
    setDraggedReel(null)
  }

  const [selectedBackdrop, setSelectedBackdrop] = useState<string>('All')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [inquiryPackage, setInquiryPackage] = useState<WeddingPackage | null>(null)
  const [inquirySuccess, setInquirySuccess] = useState<boolean>(false)
  const [inquiryError, setInquiryError] = useState<string | null>(null)

  // Admin Modals State
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<WeddingPackage | null>(null)
  const [isReelModalOpen, setIsReelModalOpen] = useState(false)
  const [reelTargetPackageId, setReelTargetPackageId] = useState<string | null>(null)
  const [editingReel, setEditingReel] = useState<PackageReel | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    eventDate: '',
    guestCount: '',
    notes: '',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({})
  const [pincodes, setPincodes] = useState<Record<string, string>>({})

  // Unique IDs for accessible form controls
  const fullNameId = useId()
  const phoneId = useId()
  const emailId = useId()
  const eventDateId = useId()
  const guestCountId = useId()
  const notesId = useId()

  const handleInquireClick = (pkg: WeddingPackage) => {
    requireAuth(`to view package pricing and submit an inquiry for "${pkg.title}"`, () => {
      setInquiryPackage(pkg)
      setInquirySuccess(false)
    })
  }

  const handleCloseModal = () => {
    setInquiryPackage(null)
    setInquirySuccess(false)
    setInquiryError(null)
    setFormData({
      fullName: '',
      phone: '',
      email: '',
      eventDate: '',
      guestCount: '',
      notes: '',
    })
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryError(null)

    // Rate limiting: max 2 inquiries per 60 seconds
    const rateCheck = checkRateLimit('inquiry_destination_wedding', 2, 60)
    if (!rateCheck.allowed) {
      setInquiryError(formatRateLimitMessage(rateCheck.retryAfterSeconds, 'inquiry'))
      return
    }

    // Sanitize input values
    const sanitizedName = formData.fullName.trim().slice(0, 80)
    const sanitizedPhone = formData.phone.trim().slice(0, 20)
    const sanitizedEmail = formData.email.trim().slice(0, 100)

    if (!sanitizedName || !sanitizedPhone || !sanitizedEmail) return

    setFormSubmitting(true)
    recordRateLimitAttempt('inquiry_destination_wedding', 60)
    // Simulate inquiry submission with sanitized payload
    setTimeout(() => {
      setFormSubmitting(false)
      setInquirySuccess(true)
    }, 800)
  }

  const handleBackdropChange = (tab: string) => {
    setIsLoading(true)
    setSelectedBackdrop(tab)
    setTimeout(() => {
      setIsLoading(false)
    }, 250)
  }

  const packageMatchesBackdropFilter = (pkg: WeddingPackage, filter: string): boolean => {
    if (filter === 'All') return true
    if (filter === 'Destination Weddings') {
      return (
        pkg.backdrop.toLowerCase() === 'destination weddings' ||
        ['coast', 'hills', 'backwaters'].includes(pkg.backdrop.toLowerCase()) ||
        pkg.title.toLowerCase().includes('destination') ||
        pkg.description.toLowerCase().includes('destination')
      )
    }
    if (filter === 'Event Management') {
      return (
        pkg.backdrop.toLowerCase() === 'event management' ||
        pkg.backdrop.toLowerCase() === 'heritage' ||
        pkg.title.toLowerCase().includes('event') ||
        pkg.description.toLowerCase().includes('event') ||
        pkg.partnerPlanner.toLowerCase().includes('event')
      )
    }
    return pkg.backdrop.toLowerCase() === filter.toLowerCase()
  }

  const handleOpenPackage = (pkgId: string) => {
    requireAuth('to view exclusive wedding package details, pricing, and booking dates', () => {
      const idx = filteredPackages.findIndex((p) => p.id === pkgId)
      if (idx !== -1) {
        setActivePackageIndex(idx)
      }
      const pkg = packages.find((p) => p.id === pkgId)
      if (pkg && selectedBackdrop !== 'All' && !packageMatchesBackdropFilter(pkg, selectedBackdrop)) {
        setSelectedBackdrop('All')
      }
      if (searchFilter) {
        setSearchFilter('')
      }
      setSelectedPackageId(pkgId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  const handleSquarePackageClick = (pkgId: string) => {
    handleOpenPackage(pkgId)
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

  // Filter packages based on selected city, category, planner, and search
  const filteredPackages = packages.filter((pkg) => {
    const matchesCity = packageMatchesCity(pkg, selectedCity)
    const matchesBackdrop = packageMatchesBackdropFilter(pkg, selectedBackdrop)
    const matchesPlanner =
      selectedPlannerFilter === 'All' ||
      pkg.partnerPlanner.toLowerCase().includes(selectedPlannerFilter.toLowerCase())
    const matchesSearch =
      !searchFilter ||
      pkg.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesCity && matchesBackdrop && matchesPlanner && matchesSearch
  })

  const activeFilterCount =
    (selectedBackdrop !== 'All' ? 1 : 0) +
    (selectedPlannerFilter !== 'All' ? 1 : 0) +
    (searchFilter.trim() !== '' ? 1 : 0)

  // Clamp carousel index when filteredPackages length changes (e.g. after filter change)
  useEffect(() => {
    if (filteredPackages.length > 0) {
      setActivePackageIndex((prev) => Math.min(prev, filteredPackages.length - 1))
    }
  }, [filteredPackages.length])

  // Jump to newly added package (index 0 since addPackage prepends)
  useEffect(() => {
    if (packages.length > prevPackagesLengthRef.current && prevPackagesLengthRef.current > 0) {
      setActivePackageIndex(0)
    }
    prevPackagesLengthRef.current = packages.length
  }, [packages])

  // Display all matching packages in a clean, comprehensive list on both desktop & mobile
  // so users can see full descriptions, inclusions, and details for every package at once
  const displayedPackages = filteredPackages

  const renderExclusiveLinks = (pkg: WeddingPackage, extraClass = '') => (
    <div className={`flex flex-wrap items-center justify-between gap-2.5 bg-[#F0F9F8] p-2.5 sm:px-3 sm:py-2.5 rounded-xl border border-[#D8F0EC] ${extraClass}`}>
      <div className="flex items-center gap-1.5">
        {user ? (
          <span className="text-xs font-bold text-[#7E1F3E] flex items-center gap-1">
            <span>Exclusive Links:</span>
          </span>
        ) : (
          <span className="text-[11px] font-semibold text-black/80 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-[#C83B68]" />
            <span>Exclusive Socials & Contact:</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <>
            {/* Instagram (Logged In) */}
            {pkg.instagramUrl && (
              <a
                href={pkg.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:brightness-110 shadow-xs transition-all active:scale-95"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
            )}

            {/* WhatsApp (Logged In) */}
            {pkg.whatsappNumber && (
              <a
                href={`https://wa.me/${pkg.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Hi! I found the "${pkg.title}" destination wedding package on MANA and would like to inquire.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-[#25D366] hover:bg-[#20ba59] shadow-xs transition-all active:scale-95"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}
          </>
        ) : (
          <>
            {/* Instagram Gated (Click triggers Login Gate) */}
            <button
              type="button"
              onClick={() =>
                requireAuth(
                  `to view exclusive Instagram reels & photos for "${pkg.title}"`,
                  () => {
                    if (pkg.instagramUrl) window.open(pkg.instagramUrl, '_blank')
                  }
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#5A172D] bg-white hover:bg-pink-50 border border-[#D8F0EC] transition-all shadow-2xs cursor-pointer group"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E1306C]" />
              <span>Instagram</span>
              <Lock className="w-2.5 h-2.5 text-[#C83B68]" />
            </button>

            {/* WhatsApp Gated (Click triggers Login Gate) */}
            <button
              type="button"
              onClick={() =>
                requireAuth(
                  `to chat directly on WhatsApp for "${pkg.title}"`,
                  () => {
                    if (pkg.whatsappNumber) {
                      window.open(
                        `https://wa.me/${pkg.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Hi! I found the "${pkg.title}" destination wedding package on MANA and would like to inquire.`
                        )}`,
                        '_blank'
                      )
                    }
                  }
                )
              }
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#5A172D] bg-white hover:bg-emerald-50 border border-[#D8F0EC] transition-all shadow-2xs cursor-pointer group"
            >
              <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
              <span>WhatsApp</span>
              <Lock className="w-2.5 h-2.5 text-[#C83B68]" />
            </button>
          </>
        )}
      </div>
    </div>
  )

  const renderPackageCard = (pkg: WeddingPackage) => {
    const coverImg =
      pkg.image ||
      (pkg.images && pkg.images[0]) ||
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'

    const canManageThisPackage = Boolean(isAdmin || (isPlannerVendor && pkg.vendorId === profile?.id))

    return (
      <div
        key={pkg.id}
        onClick={() => {
          handleOpenPackage(pkg.id)
        }}
        className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer active:scale-[0.98] group hover:-translate-y-1 relative"
      >
        {/* Top Image, Admin Actions & Wishlist Button */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
          <img
            src={coverImg}
            alt={pkg.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />

          {/* Admin / Vendor Management Toolbar on Card */}
          {canManageThisPackage && (
            <div
              className="absolute top-2 left-2 flex items-center gap-1.5 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setEditingPackage(pkg)
                  setIsPkgModalOpen(true)
                }}
                title={`Edit ${pkg.title}`}
                aria-label={`Edit ${pkg.title}`}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md text-[#C83B68] hover:bg-white border border-[#D8F0EC] shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-90"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  if (window.confirm(`Are you sure you want to delete package "${pkg.title}"? This cannot be undone.`)) {
                    deletePackage(pkg.id)
                    if (selectedPackageId === pkg.id) {
                      setSelectedPackageId(null)
                    }
                  }
                }}
                title={isAdmin ? `Delete Package as Admin: "${pkg.title}"` : `Delete "${pkg.title}"`}
                aria-label={`Delete ${pkg.title}`}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-md text-red-600 hover:bg-red-50 border border-red-200 shadow-md transition-all flex items-center justify-center cursor-pointer active:scale-90"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

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

        {/* Card Details matching uploaded mobile screenshot */}
        <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
          <div className="space-y-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B8710B] block truncate">
              {pkg.partnerPlanner || 'EVENT MANAGEMENT'}
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
              Price on Request
            </span>
          </div>
        </div>
      </div>
    )
  }

  const renderPackageArticle = (pkg: WeddingPackage) => {
    const canManageThisPackage = Boolean(isAdmin || (isPlannerVendor && pkg.vendorId === profile?.id))

    return (
    <article
      key={pkg.id}
      id={`package-${pkg.id}`}
      className="package-card-pop group rounded-2xl overflow-hidden bg-white backdrop-blur-md border border-[#D8F0EC] shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col will-change-[transform,opacity] scroll-mt-24"
    >
      {/* Admin / Vendor Management Banner inside Package Details */}
      {canManageThisPackage && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/70 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-amber-200/70 text-amber-900 font-bold uppercase text-[10px]">
              {isAdmin ? 'Super Admin' : 'Vendor'}
            </span>
            <span className="font-medium text-amber-800">
              Manage Package: <strong className="text-gray-900">{pkg.title}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingPackage(pkg)
                setIsPkgModalOpen(true)
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-black font-semibold shadow-2xs transition-colors"
            >
              <Pencil className="w-3.5 h-3.5 text-[#C83B68]" />
              <span>Edit Details</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to permanently delete package "${pkg.title}"? This cannot be undone.`)) {
                  deletePackage(pkg.id)
                  setSelectedPackageId(null)
                }
              }}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-2xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Package</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Row: Photo on Left + Details on Right (or Swapped by Admin) */}
      <div
        className={`flex flex-col ${pkg.reverseDesktopLayout ? 'lg:flex-row-reverse' : 'lg:flex-row'
          }`}
      >
        {/* Left: Photo Gallery & Admin Controls */}
        <div className="w-full lg:w-[48%] shrink-0 p-5 sm:p-6 lg:p-7">
          <PackageImageGallery
            pkg={pkg}
            isAdmin={canManageThisPackage}
            onEdit={() => {
              setEditingPackage(pkg)
              setIsPkgModalOpen(true)
            }}
            onDelete={() => {
              if (window.confirm(`Delete package "${pkg.title}"?`)) {
                deletePackage(pkg.id)
                setSelectedPackageId(null)
              }
            }}
          />
        </div>

        {/* Right: Package Content styled cleanly according to screenshot */}
        <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between space-y-5 min-w-0">
          {/* Top Category + Action Icons (Like, Share, WhatsApp) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#C83B68]">
              EVENT MANAGEMENT
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Save package"
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-pink-300 text-gray-500 hover:text-[#C83B68] flex items-center justify-center transition-colors bg-white shadow-2xs"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Share package"
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: pkg.title, url: window.location.href }).catch(() => { })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Package link copied to clipboard!')
                  }
                }}
                className="w-8 h-8 rounded-full border border-gray-200 hover:border-pink-300 text-gray-500 hover:text-[#C83B68] flex items-center justify-center transition-colors bg-white shadow-2xs"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {pkg.whatsappNumber && (
                <a
                  href={`https://wa.me/${pkg.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hi! I found the "${pkg.title}" destination wedding package on MANA and would like to inquire.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="w-8 h-8 rounded-full border border-gray-200 hover:border-green-300 text-emerald-600 flex items-center justify-center transition-colors bg-white shadow-2xs"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                </a>
              )}
            </div>
          </div>

          {/* Title & Planner */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
              {pkg.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
              {pkg.partnerPlanner}
            </p>
            <div className="mt-2.5">
              <span className="inline-block px-3 py-1 rounded-md bg-[#FFF5E6] text-[#B8710B] text-xs font-bold border border-[#FFE0B2]">
                Price on Request
              </span>
            </div>
          </div>

          {/* Description with "Read Full Description" toggle */}
          <div>
            <p className={`text-xs sm:text-sm text-gray-600 leading-relaxed transition-all ${expandedDescriptions[pkg.id] ? '' : 'line-clamp-2'
              }`}>
              {pkg.description}
            </p>
            <button
              type="button"
              onClick={() =>
                setExpandedDescriptions((prev) => ({ ...prev, [pkg.id]: !prev[pkg.id] }))
              }
              className="mt-1.5 text-xs font-bold text-gray-800 hover:text-[#C83B68] inline-flex items-center gap-1 transition-colors"
            >
              <span>{expandedDescriptions[pkg.id] ? 'Show Less' : 'Read Full Description'}</span>
              {expandedDescriptions[pkg.id] ? (
                <ChevronUpIcon className="w-3.5 h-3.5" />
              ) : (
                <ChevronDownIcon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>

          {/* WHAT'S AVAILABLE (Inclusions with green checkmarks) */}
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-gray-50/60 border-b border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                WHAT'S AVAILABLE
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {pkg.inclusions.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AVAILABILITY BOX matching screenshot */}
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
                  value={formData.eventDate || getIST_YYYY_MM_DD(addDays(new Date(), MIN_LEAD_DAYS))}
                  min={getIST_YYYY_MM_DD(addDays(new Date(), MIN_LEAD_DAYS))}
                  onChange={(e) => setFormData((prev) => ({ ...prev, eventDate: e.target.value }))}
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

          {/* CANCELLATION POLICY BOX matching screenshot */}
          <div className="rounded-2xl border-l-4 border-l-amber-500 border border-amber-200 bg-amber-50/40 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-700 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>CANCELLATION POLICY</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc marker:text-amber-500">
              <li>50% refund available for cancellations made at least 7 days prior to the delivery date.</li>
              <li>No refund will be provided for cancellations made within 7 days of delivery date.</li>
            </ul>
            <p className="text-[11px] text-gray-500 italic pt-0.5">
              Standard processing charges may apply and are non-refundable.
            </p>
          </div>

          {/* PAYMENT POLICY BOX matching screenshot */}
          <div className="rounded-2xl border-l-4 border-l-sky-500 border border-sky-200 bg-sky-50/40 p-4 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sky-800 text-xs font-bold uppercase tracking-wider">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <span>PAYMENT POLICY</span>
            </div>
            <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc marker:text-sky-500">
              <li>An advance payment of 10% of the total amount is required online for confirmation.</li>
              <li>The remaining balance will be collected at the time of delivery.</li>
              <li>Remaining payments will be collected directly by {pkg.partnerPlanner || 'Verified Partner'}.</li>
            </ul>
          </div>

          {/* MAKE AN ENQUIRY CTA BUTTON matching screenshot */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleInquireClick(pkg)}
              className="px-8 py-3 rounded-xl bg-black text-white hover:bg-gray-800 font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Make an Enquiry
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Reels Section directly UNDER this package (Horizontally ordered on web, vertical on mobile) */}
      {((pkg.reels && pkg.reels.length > 0) || canManageThisPackage) && (
        <div
          onDragOver={(e) => {
            if (canManageThisPackage && draggedReel) e.preventDefault()
          }}
          onDrop={(e) => {
            if (!canManageThisPackage || !draggedReel) return
            e.preventDefault()
            handleDropReel(pkg.id)
          }}
          className="p-5 sm:p-6 lg:px-7 border-t border-[#D8F0EC] bg-[#F0F9F8]/60 space-y-4"
        >
          {canManageThisPackage && (
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                disabled={past.length === 0}
                onClick={undo}
                title="Undo"
                aria-label="Undo last change"
                className="p-1.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 hover:text-brand-secondary border border-emerald-700/50 disabled:opacity-35 transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={future.length === 0}
                onClick={redo}
                title="Redo"
                aria-label="Redo last undone change"
                className="p-1.5 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 hover:text-brand-secondary border border-emerald-700/50 disabled:opacity-35 transition-colors"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setReelTargetPackageId(pkg.id)
                  setEditingReel(null)
                  setIsReelModalOpen(true)
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-900/80 hover:bg-emerald-800 text-brand-secondary text-[11px] font-bold border border-brand-secondary/35 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add Reel</span>
              </button>
            </div>
          )}

          {pkg.reels && pkg.reels.length > 0 ? (
            <div className="flex flex-col md:flex-row md:flex-wrap items-center md:items-start gap-5">
              {pkg.reels.map((reel, rIdx) => (
                <div
                  key={reel.id}
                  draggable={Boolean(canManageThisPackage)}
                  onDragStart={(e) => {
                    e.stopPropagation()
                    setDraggedReel({ pkgId: pkg.id, reelId: reel.id, index: rIdx })
                  }}
                  onDragOver={(e) => {
                    if (canManageThisPackage && draggedReel) e.preventDefault()
                  }}
                  onDrop={(e) => {
                    if (!canManageThisPackage || !draggedReel) return
                    e.preventDefault()
                    e.stopPropagation()
                    handleDropReel(pkg.id, rIdx)
                  }}
                  onDragEnd={() => setDraggedReel(null)}
                  className={`w-full md:w-auto flex justify-center md:justify-start transition-opacity ${draggedReel?.reelId === reel.id ? 'opacity-45' : ''
                    }`}
                >
                  <ReelPlayerCard
                    reel={reel}
                    isAdmin={Boolean(canManageThisPackage)}
                    canMoveLeft={rIdx > 0}
                    canMoveRight={rIdx < pkg.reels.length - 1}
                    onMoveLeft={() => reorderPackageReels(pkg.id, rIdx, rIdx - 1)}
                    onMoveRight={() => reorderPackageReels(pkg.id, rIdx, rIdx + 1)}
                    onEdit={(r) => {
                      setReelTargetPackageId(pkg.id)
                      setEditingReel(r)
                      setIsReelModalOpen(true)
                    }}
                    onDelete={(reelId) => {
                      if (window.confirm(`Delete reel "${reel.title}"?`)) {
                        deletePackageReel(pkg.id, reelId)
                      }
                    }}
                    onUpdateSettings={(reelId, updates) => {
                      setLastEditedPkgId(pkg.id)
                      updatePackageReel(pkg.id, reelId, updates)
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-700/60 italic">
              No reels added yet. Click &quot;Add Reel&quot; to attach a video reel.
            </p>
          )}
        </div>
      )}

      {/* Exclusive Social Media & Direct Chat Links (Mobile only: moved down under the reels) */}
      <div className="block sm:hidden p-4 pt-3 border-t border-[#D8F0EC] bg-[#FFF2F6]/60">
        {renderExclusiveLinks(pkg, 'flex')}
      </div>
    </article>
  )}

  return (
    <Layout>
      <div ref={pageRef}>
        {/* Top Breadcrumb Navigation */}
        <div className="bg-white border-b border-[#D8F0EC]/80 py-3 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs sm:text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#C83B68] transition-colors font-medium">Home</Link>
            <span className="text-gray-300">/</span>
            <Link
              to="/categories"
              className="hover:text-[#C83B68] transition-colors font-medium"
            >
              Services
            </Link>
            <span className="text-gray-300">/</span>
            <span
              onClick={() => setSelectedPackageId(null)}
              className={
                selectedPackageId
                  ? 'text-gray-600 font-medium cursor-pointer hover:text-[#C83B68]'
                  : 'text-[#5A172D] font-bold'
              }
            >
              Event Management
            </span>
            {selectedPackageId && (
              <>
                <span className="text-gray-300">/</span>
                <span className="text-[#5A172D] font-bold truncate max-w-[260px] sm:max-w-md">
                  {displayedPackages.find((p) => p.id === selectedPackageId)?.title ||
                    packages.find((p) => p.id === selectedPackageId)?.title}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mobile: Top Section with Stacked Destination Images Animation (Visible on mobile when !selectedPackageId) */}
        {!selectedPackageId && (
          <section className="lg:hidden relative bg-[#F0F9F8] pt-4 pb-6 px-4">
            <div className="max-w-md mx-auto text-center space-y-3">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/90 border border-[#D8F0EC] text-xs font-semibold text-black">
                <span>God’s Own Country Destination Weddings</span>
              </div>
              <h1
                className="text-2xl font-extrabold uppercase tracking-wide leading-tight text-black"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bespoke Destination Weddings
              </h1>
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Explore verified venues & curated packages across God's Own Country. Tap any card below to flip through.
              </p>
              {/* Stack Image Animation */}
              <div className="packages-stack-animate pt-2 flex justify-center">
                <StackedDestinationImages />
              </div>
            </div>
          </section>
        )}

        {/* Top Hero Banner with Destination Wedding Showcase (Desktop only) */}
        <section className="hidden lg:block relative overflow-x-clip bg-[#F0F9F8] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
          <div
            className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent 100%)',
            }}
          >
            <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#D8F0EC]/60 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#D8F0EC]/50 blur-3xl" />
          </div>

          <div className="relative max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-12 items-center">
              {/* Left Column: Text & Filters */}
              <div className="lg:col-span-7 text-left space-y-4">
                <div className="packages-hero-reveal inline-flex items-center px-3.5 py-1 rounded-full bg-white/90 border border-[#D8F0EC] text-xs font-semibold text-black will-change-[transform,opacity]">
                  <span>God’s Own Country Destination Weddings</span>
                </div>

                <h1
                  className="packages-hero-reveal text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide leading-tight text-black drop-shadow-xs will-change-[transform,opacity]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Bespoke Destination Wedding Packages
                </h1>

                <p className="packages-hero-reveal text-sm sm:text-base lg:text-lg text-black font-medium leading-relaxed will-change-[transform,opacity]">
                  Your celebration deserves the warmth and safety of home. Explore verified venues and
                  bespoke destination wedding packages across God's Own Country, thoughtfully designed to
                  honor Kerala’s rich cultural tapestry while keeping you in expert, caring hands.
                </p>

                {/* Quick Filter & Search Bar — Desktop & Tablet only (hidden on mobile) */}
                <div className="packages-hero-reveal hidden md:flex pt-3 flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between will-change-[transform,opacity]">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      placeholder="Search packages by location or style..."
                      aria-label="Search destination packages"
                      className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#A42A51]/30 rounded-full text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#E05A85]/40 shadow-xs"
                    />
                    <Search className="w-4 h-4 text-[#A42A51]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    {searchFilter && (
                      <button
                        type="button"
                        onClick={() => setSearchFilter('')}
                        aria-label="Clear search text"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Backdrop Filters */}
                  <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter packages by backdrop">
                    {['All', 'Backwaters', 'Coast', 'Hills', 'Heritage'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleBackdropChange(tab)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${selectedBackdrop === tab
                            ? 'bg-[#C83B68] text-white font-bold shadow-md'
                            : 'bg-white text-[#7E1F3E] hover:bg-[#A42A51]/10 border border-[#A42A51]/30'
                          }`}
                      >
                        {tab === 'All' ? 'All Backdrops' : tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Stacked Destination Images Showcase (Mobile & Desktop) */}
              <div className="packages-stack-animate lg:col-span-5 w-full flex items-center justify-center lg:justify-end pt-0 will-change-[transform,opacity]">
                <StackedDestinationImages />
              </div>
            </div>
          </div>
        </section>

        {/* Main Packages Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-10 sm:pt-8 sm:pb-14">
          {/* Admin / Wedding Planner Controls Bar */}
          {canManagePackages && (
            <div className="mb-8 p-4 rounded-2xl bg-[#F0F9F8] border border-[#D8F0EC] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#C83B68]">
                  {isAdmin ? 'Admin Package & Reel Studio' : 'Wedding Planner Package Studio'}
                </p>
                <p className="text-xs text-[#5A172D]/80">
                  {isAdmin
                    ? 'Add packages, upload photos, arrange desktop text/videos, and save edits.'
                    : 'Add and manage your bespoke destination wedding packages.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      disabled={past.length === 0}
                      onClick={undo}
                      title="Undo last package edit"
                      aria-label="Undo"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white hover:bg-[#F0F9F8] text-black font-bold text-xs border border-[#D8F0EC] shadow-sm disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <Undo2 className="w-3.5 h-3.5 text-[#C83B68]" />
                      <span>Undo</span>
                    </button>
                    <button
                      type="button"
                      disabled={future.length === 0}
                      onClick={redo}
                      title="Redo last package edit"
                      aria-label="Redo"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-full bg-white hover:bg-[#F0F9F8] text-black font-bold text-xs border border-[#D8F0EC] shadow-sm disabled:opacity-35 disabled:cursor-not-allowed active:scale-95 transition-all"
                    >
                      <Redo2 className="w-3.5 h-3.5 text-[#C83B68]" />
                      <span>Redo</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingPackage(null)
                    setIsPkgModalOpen(true)
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#E05A85] via-[#F3A2BE] to-[#E05A85] text-white font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Package</span>
                </button>
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setReelTargetPackageId(null)
                        setEditingReel(null)
                        setIsReelModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#C83B68] hover:bg-[#A42A51] text-white font-bold text-xs border border-[#D8F0EC] shadow-md active:scale-95 transition-all"
                    >
                      <Film className="w-4 h-4 text-white" />
                      <span>Add Reel Video</span>
                    </button>

                    {/* Unified Save Button for Desktop & Mobile */}
                    <button
                      type="button"
                      onClick={handleSaveEdits}
                      title={
                        savedDesktopAt || savedMobileAt
                          ? `Last saved: ${new Date(savedDesktopAt || savedMobileAt || '').toLocaleTimeString()}`
                          : 'Save Desktop & Mobile edits'
                      }
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white hover:bg-[#F0F9F8] text-[#C83B68] font-bold text-xs border border-[#D8F0EC] shadow-md active:scale-95 transition-all"
                    >
                      {saveFeedback ? (
                        <Check className="w-3.5 h-3.5 text-[#C83B68]" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      <Monitor className="w-3.5 h-3.5" />
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>{saveFeedback ? 'Saved!' : 'Save Desktop & Mobile'}</span>
                    </button>

                    {/* Apply to All Button — Appears after saving */}
                    {(hasSavedSession || Boolean(savedDesktopAt) || Boolean(savedMobileAt)) && (
                      <button
                        type="button"
                        onClick={() => handleApplyToAll()}
                        title="Apply your saved layout & reel settings to all packages"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#F3A2BE]/20 hover:bg-[#F3A2BE]/35 text-[#C83B68] font-extrabold text-xs border border-[#D8F0EC] shadow-md active:scale-95 transition-all"
                      >
                        {appliedAllPkgId ? (
                          <Check className="w-3.5 h-3.5 text-[#C83B68]" />
                        ) : (
                          <CopyCheck className="w-3.5 h-3.5" />
                        )}
                        <span>{appliedAllPkgId ? 'Applied to All!' : 'Apply to All'}</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Looping Packages Animation (Only when !selectedPackageId) */}
          {!selectedPackageId && (
            <section
              id="packages-section"
              className="scroll-mt-24 mb-4 sm:mb-6 pt-0"
              aria-label="Explore Destination Packages"
            >
              <LoopingPackagesStack
                packages={filteredPackages.length >= 2 ? filteredPackages : packages}
                activeIndex={activePackageIndex}
                onActiveIndexChange={(idx) => {
                  setActivePackageIndex(idx)
                }}
                onSelectPackage={handleSquarePackageClick}
              />
            </section>
          )}

          {/* Header & Filter Bar (Shown on both Mobile & Desktop when !selectedPackageId) */}
          {!selectedPackageId && (
            <div className="mb-6 space-y-4">
              <div>
                <h2
                  className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A1A1A] tracking-tight text-left drop-shadow-xs"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Event Management
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">
                  Discover verified professionals near you
                </p>
              </div>

              {/* Active City Indicator */}
              {selectedCity && (
                <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#F0F9F8] border border-[#D8F0EC] text-xs">
                  <div className="flex items-center gap-1.5 text-gray-700 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-[#C83B68] shrink-0" />
                    <span className="truncate">
                      Packages available in <strong className="text-gray-900 font-bold">{selectedCity.name}</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('mana_open_city_gate'))}
                    className="text-[#C83B68] hover:underline font-bold text-xs shrink-0 ml-2 cursor-pointer"
                  >
                    Change City
                  </button>
                </div>
              )}

              {/* Packages found counter + Filters Button */}
              <div className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-200/90 shadow-2xs">
                <span className="text-xs sm:text-sm text-gray-700 font-medium">
                  <strong className="text-gray-900 font-bold">{filteredPackages.length}</strong> packages found
                </span>
                <div className="flex items-center gap-2">
                  {/* Category Pill Filters (Desktop only) */}
                  <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto py-0.5">
                    {['All', 'Destination Weddings', 'Event Management'].map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => handleBackdropChange(tab)}
                        className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                          selectedBackdrop === tab
                            ? 'bg-[#B8710B] text-white shadow-xs font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Working Filters Button (Mobile & Desktop) */}
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border transition-all shrink-0 cursor-pointer ${
                      activeFilterCount > 0
                        ? 'border-[#B8710B] bg-[#FFF5E6] text-[#B8710B] font-bold shadow-xs'
                        : 'border-gray-200 hover:border-[#B8710B]/50 bg-white text-xs font-bold text-gray-800 hover:text-[#B8710B] shadow-2xs'
                    }`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#B8710B]" />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#B8710B] text-white text-[10px] font-extrabold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" aria-label="Loading packages">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="rounded-2xl border border-[#D8F0EC] bg-[#FFF2F6] p-6 animate-pulse space-y-4"
                >
                  <div className="aspect-video w-full bg-[#E2F4F2] rounded-xl" />
                  <div className="h-6 w-3/4 bg-[#E2F4F2] rounded" />
                  <div className="h-4 w-1/2 bg-[#E2F4F2] rounded" />
                  <div className="space-y-2 pt-2">
                    <div className="h-3 w-full bg-[#E2F4F2] rounded" />
                    <div className="h-3 w-5/6 bg-[#E2F4F2] rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {hasError && !isLoading && (
            <div className="rounded-2xl border border-red-200 bg-[#FFF2F6] p-8 text-center max-w-lg mx-auto space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-bold text-[#5A172D]">Unable to Load Packages</h3>
              <p className="text-sm text-[#7E1F3E]/80">
                We encountered a temporary network issue while fetching the destination wedding
                packages.
              </p>
              <button
                type="button"
                onClick={() => setHasError(false)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#C83B68] hover:bg-[#A42A51] text-white font-bold text-sm shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Loading</span>
              </button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !hasError && filteredPackages.length === 0 && (
            <div className="rounded-2xl border border-[#D8F0EC] bg-[#FFF2F6] p-8 sm:p-10 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <Package className="w-12 h-12 text-[#C83B68] mx-auto opacity-70" />
              <h3 className="text-lg font-bold text-[#5A172D]">
                No Packages Found {selectedCity ? `in ${selectedCity.name}` : ''}
              </h3>
              <p className="text-xs sm:text-sm text-[#7E1F3E]/80 leading-relaxed">
                We could not find any wedding packages available in {selectedCity ? selectedCity.name : 'this location'} matching your current filters.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent('mana_open_city_gate'))}
                  className="px-4 py-2 rounded-xl bg-[#C83B68] text-white hover:bg-[#A42A51] font-bold text-xs transition-all shadow-sm cursor-pointer"
                >
                  Change City
                </button>
                {(selectedBackdrop !== 'All' || selectedPlannerFilter !== 'All' || searchFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBackdrop('All')
                      setSelectedPlannerFilter('All')
                      setSearchFilter('')
                    }}
                    className="px-4 py-2 rounded-xl bg-white text-gray-700 hover:bg-gray-100 font-semibold text-xs border border-gray-200 transition-all cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Packages Display (Cards Grid when !selectedPackageId, or Full Detailed Article when selected) */}
          {!isLoading && !hasError && displayedPackages.length > 0 && (
            <>
              {!selectedPackageId ? (
                <>
                  {/* Desktop: Aligned Packages Grid (directly under LoopingPackagesStack) */}
                  <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedPackages.map((pkg) => renderPackageCard(pkg))}
                  </div>

                  {/* Mobile: 2-Column Small Cards Grid */}
                  <div className="grid grid-cols-2 gap-3.5 lg:hidden">
                    {displayedPackages.map((pkg) => renderPackageCard(pkg))}
                  </div>
                </>
              ) : (
                /* Detail View (Mobile & Desktop) with Back Button */
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setSelectedPackageId(null)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-800 hover:text-black shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4 text-[#B8710B]" />
                    <span>Back to all packages</span>
                  </button>

                  {displayedPackages
                    .filter((p) => p.id === selectedPackageId)
                    .map((pkg) => renderPackageArticle(pkg))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Bespoke Package Inquiry Modal */}
        {inquiryPackage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inquiry-modal-title"
          >
            <div className="relative w-full max-w-lg rounded-2xl bg-[#FFF2F6] border border-[#D8F0EC] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              {/* Close Button */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-1.5 text-[#7E1F3E] hover:text-[#5A172D] rounded-full bg-white border border-[#D8F0EC]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {inquirySuccess ? (
                <div className="py-6 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-white border border-[#D8F0EC] flex items-center justify-center mx-auto text-[#C83B68]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#5A172D]">Inquiry Received with Warmth</h3>
                  <p className="text-sm text-[#7E1F3E]/90 leading-relaxed">
                    Thank you! Our dedicated Kerala destination wedding concierges and verified vendor
                    partners have received your inquiry for{' '}
                    <strong className="text-[#C83B68]">{inquiryPackage.title}</strong>. We will
                    reach out to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-full bg-[#C83B68] text-white font-bold text-sm hover:bg-[#A42A51] transition-all shadow-md"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <span className="text-xs uppercase tracking-wider text-[#C83B68] font-semibold">
                      Bespoke Consultation
                    </span>
                    <h3 id="inquiry-modal-title" className="text-xl font-bold text-[#5A172D]">
                      Inquire: {inquiryPackage.title}
                    </h3>
                    <p className="text-xs text-[#7E1F3E]/80">
                      Direct transparent connection with verified Kerala planners. Zero brokerage.
                    </p>
                  </div>

                  {inquiryError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <div>
                      <label htmlFor={fullNameId} className="block text-xs font-semibold text-[#5A172D] mb-1">
                        Your Full Name *
                      </label>
                      <div className="relative">
                        <input
                          id={fullNameId}
                          type="text"
                          required
                          maxLength={80}
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. Anjali Nair"
                          className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8F0EC] rounded-lg text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/50"
                        />
                        <User className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={phoneId} className="block text-xs font-semibold text-[#5A172D] mb-1">
                          Phone / WhatsApp *
                        </label>
                        <div className="relative">
                          <input
                            id={phoneId}
                            type="tel"
                            required
                            maxLength={20}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+91 98765 43210"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8F0EC] rounded-lg text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/50"
                          />
                          <Phone className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      <div>
                        <label htmlFor={emailId} className="block text-xs font-semibold text-[#5A172D] mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <input
                            id={emailId}
                            type="email"
                            required
                            maxLength={100}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="anjali@example.com"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8F0EC] rounded-lg text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/50"
                          />
                          <Mail className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={eventDateId} className="block text-xs font-semibold text-[#5A172D] mb-1">
                          Preferred Event Date
                        </label>
                        <div className="relative">
                          <input
                            id={eventDateId}
                            type="date"
                            value={formData.eventDate}
                            min={getIST_YYYY_MM_DD(addDays(new Date(), MIN_LEAD_DAYS))}
                            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8F0EC] rounded-lg text-[#5A172D] focus:outline-none focus:ring-2 focus:ring-[#C83B68]/50"
                          />
                          <Calendar className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                        <p className="mt-1 text-[11px] text-amber-700 flex items-center gap-1">
                          <Info className="w-3 h-3 shrink-0" />
                          Minimum 23 days advance booking required
                        </p>
                      </div>

                      <div>
                        <label htmlFor={guestCountId} className="block text-xs font-semibold text-[#5A172D] mb-1">
                          Estimated Guests
                        </label>
                        <div className="relative">
                          <input
                            id={guestCountId}
                            type="text"
                            maxLength={10}
                            value={formData.guestCount}
                            onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                            placeholder="e.g. 250"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#D8F0EC] rounded-lg text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/50"
                          />
                          <Users className="w-4 h-4 text-[#C83B68] absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={notesId} className="block text-xs font-semibold text-[#5A172D] mb-1">
                        Special Preferences or Rituals
                      </label>
                      <textarea
                        id={notesId}
                        rows={3}
                        maxLength={1000}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Share details on traditions (Sadya preferences, musical welcome, temple rituals, etc.)"
                        className="w-full p-2.5 text-sm bg-white border border-[#D8F0EC] rounded-lg text-[#5A172D] placeholder-[#5A172D]/40 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/50"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-xs font-semibold text-[#7E1F3E] hover:text-[#5A172D]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E05A85] via-[#F3A2BE] to-[#E05A85] hover:brightness-105 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {formSubmitting ? 'Sending Request...' : 'Submit Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
        {/* Admin Package Add/Edit Modal */}
        <PackageFormModal
          isOpen={isPkgModalOpen}
          onClose={() => {
            setIsPkgModalOpen(false)
            setEditingPackage(null)
          }}
          initialPackage={editingPackage}
        />

        {/* Admin Reel Add/Edit Modal */}
        <ReelFormModal
          isOpen={isReelModalOpen}
          onClose={() => {
            setIsReelModalOpen(false)
            setEditingReel(null)
            setReelTargetPackageId(null)
          }}
          packageId={reelTargetPackageId}
          initialReel={editingReel}
        />

        {/* Interactive Filter Modal for Mobile & Desktop */}
        {isFilterModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-modal-title"
            onClick={() => setIsFilterModalOpen(false)}
          >
            <div
              className="relative w-full max-w-md rounded-2xl bg-white border border-gray-200 shadow-2xl p-5 sm:p-6 space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#B8710B]" />
                  <h3 id="filter-modal-title" className="text-base font-bold text-gray-900">
                    Filter Packages
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Destination Weddings', 'Event Management'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSelectedBackdrop(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedBackdrop === tab
                          ? 'bg-[#B8710B] text-white shadow-xs font-bold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tab === 'All' ? 'All' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Event Planner / Partner Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Partner / Planner
                </label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Meliora Events', 'Heyday Event Planners', 'Regal Castle'].map((planner) => (
                    <button
                      key={planner}
                      type="button"
                      onClick={() => setSelectedPlannerFilter(planner)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        selectedPlannerFilter === planner
                          ? 'bg-[#B8710B] text-white shadow-xs font-bold'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {planner}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Input Filter */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Search by Keyword
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search package name, location or style..."
                    className="w-full pl-9 pr-8 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B8710B]/30"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  {searchFilter && (
                    <button
                      type="button"
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedBackdrop('All')
                    setSelectedPlannerFilter('All')
                    setSearchFilter('')
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-gray-800 underline transition-colors cursor-pointer"
                >
                  Reset All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#B8710B] hover:bg-[#995d08] text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Show {filteredPackages.length} Packages
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Location / City Switcher Modal */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
        />
      </div>
    </Layout>
  )
}
