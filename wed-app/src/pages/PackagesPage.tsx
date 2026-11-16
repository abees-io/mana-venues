import { useState, useId } from 'react'
import Layout from '../components/layout/Layout'
import StackedDestinationImages from '../components/home/StackedDestinationImages'
import ReelPlayerCard from '../components/packages/ReelPlayerCard'
import PackageFormModal from '../components/modals/PackageFormModal'
import ReelFormModal from '../components/modals/ReelFormModal'
import { useAuth } from '../contexts/AuthContext'
import {
  usePackagesStore,
  type WeddingPackage,
  type PackageReel,
  type PackageTextGroup,
} from '../store/packagesStore'
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
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
  GripVertical,
  Undo2,
  Redo2,
  RotateCcw,
  Move,
  Save,
  Monitor,
  Smartphone,
  Check,
  Lock,
  CopyCheck,
} from 'lucide-react'

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
    <div
      onClick={() => {
        if (photos.length > 1) {
          setPhotoIdx((prev) => (prev + 1) % photos.length)
        }
      }}
      className={`relative aspect-[16/10] sm:aspect-video lg:aspect-auto lg:h-full lg:min-h-[340px] w-full overflow-hidden bg-brand-dark ${
        photos.length > 1 ? 'cursor-pointer' : ''
      }`}
    >
      <img
        src={photos[safeIdx]}
        alt={pkg.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent pointer-events-none" />

      {/* Backdrop Badge */}
      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-brand-dark/90 backdrop-blur-md border border-brand-secondary/60 text-xs font-semibold text-brand-secondary shadow-md">
        <span>{pkg.backdrop} Experience</span>
      </div>

      {/* Admin Edit / Delete Controls */}
      {isAdmin && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${pkg.title}`}
            className="p-2 rounded-full bg-brand-dark/90 backdrop-blur-md text-brand-secondary hover:bg-black border border-brand-secondary/50 shadow-md transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${pkg.title}`}
            className="p-2 rounded-full bg-brand-dark/90 backdrop-blur-md text-red-400 hover:bg-red-950 border border-red-500/40 shadow-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Multi-Image Carousel Arrows (Admin only — regular users tap image to switch) */}
      {isAdmin && photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setPhotoIdx((prev) => (prev - 1 + photos.length) % photos.length)
            }}
            aria-label="Previous package photo"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setPhotoIdx((prev) => (prev + 1) % photos.length)
            }}
            aria-label="Next package photo"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/75 text-white backdrop-blur-xs transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Photo indicator dots */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 pointer-events-none">
          {photos.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === safeIdx ? 'w-4 bg-white' : 'w-1.5 bg-white/45'
              }`}
            />
          ))}
        </div>
      )}

      {/* Pricing tag */}
      <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-lg bg-brand-dark/95 backdrop-blur-md border border-emerald-700/50 shadow-md text-right">
        <span className="block text-[10px] uppercase tracking-wider text-emerald-300">
          Starting From
        </span>
        <span className="text-base sm:text-lg font-extrabold text-brand-secondary">
          {pkg.startingPrice}
        </span>
      </div>
    </div>
  )
}

export default function PackagesPage() {
  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'

  const packages = usePackagesStore((s) => s.packages)
  const past = usePackagesStore((s) => s.past)
  const future = usePackagesStore((s) => s.future)
  const undo = usePackagesStore((s) => s.undo)
  const redo = usePackagesStore((s) => s.redo)
  const savedDesktopAt = usePackagesStore((s) => s.savedDesktopAt)
  const savedMobileAt = usePackagesStore((s) => s.savedMobileAt)
  const saveDesktopEdits = usePackagesStore((s) => s.saveDesktopEdits)
  const saveMobileEdits = usePackagesStore((s) => s.saveMobileEdits)
  const applyLayoutToAllPackages = usePackagesStore((s) => s.applyLayoutToAllPackages)
  const [saveFeedback, setSaveFeedback] = useState<'desktop' | 'mobile' | null>(null)
  const [hasSavedSession, setHasSavedSession] = useState(false)
  const [lastEditedPkgId, setLastEditedPkgId] = useState<string | null>(null)
  const [appliedAllPkgId, setAppliedAllPkgId] = useState<string | null>(null)

  const handleSaveDesktop = () => {
    saveDesktopEdits()
    setHasSavedSession(true)
    setSaveFeedback('desktop')
    setTimeout(() => setSaveFeedback(null), 2200)
  }

  const handleSaveMobile = () => {
    saveMobileEdits()
    setHasSavedSession(true)
    setSaveFeedback('mobile')
    setTimeout(() => setSaveFeedback(null), 2200)
  }

  const handleApplyToAll = (pkgId?: string | null) => {
    const targetId = pkgId || lastEditedPkgId || packages[0]?.id
    if (!targetId) return
    applyLayoutToAllPackages(targetId)
    setAppliedAllPkgId(targetId)
    setTimeout(() => setAppliedAllPkgId(null), 2200)
  }
  const updatePackage = usePackagesStore((s) => s.updatePackage)
  const deletePackage = usePackagesStore((s) => s.deletePackage)
  const updatePackageReel = usePackagesStore((s) => s.updatePackageReel)
  const deletePackageReel = usePackagesStore((s) => s.deletePackageReel)
  const reorderPackageReels = usePackagesStore((s) => s.reorderPackageReels)
  const movePackageReel = usePackagesStore((s) => s.movePackageReel)

  // Cursor Drag-and-Drop states (Admin only)
  const [draggedTextGroup, setDraggedTextGroup] = useState<{
    pkgId: string
    group: PackageTextGroup
  } | null>(null)
  const [freeDragState, setFreeDragState] = useState<{
    pkgId: string
    group: PackageTextGroup
    x: number
    y: number
  } | null>(null)
  const [draggedReel, setDraggedReel] = useState<{
    pkgId: string
    reelId: string
    index: number
  } | null>(null)

  const handleFreeMoveStart = (
    pkg: WeddingPackage,
    group: PackageTextGroup,
    e: React.PointerEvent<HTMLSpanElement>
  ) => {
    if (!isAdmin) return
    e.stopPropagation()
    e.preventDefault()

    const currentOffset = pkg.textOffsets?.[group] || { x: 0, y: 0 }
    const startX = e.clientX
    const startY = e.clientY
    let latest = { ...currentOffset }

    setFreeDragState({ pkgId: pkg.id, group, x: latest.x, y: latest.y })

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX
      const dy = moveEvent.clientY - startY
      latest = {
        x: Math.round(currentOffset.x + dx),
        y: Math.round(currentOffset.y + dy),
      }
      setFreeDragState({ pkgId: pkg.id, group, x: latest.x, y: latest.y })
    }

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      setFreeDragState(null)
      setLastEditedPkgId(pkg.id)
      updatePackage(pkg.id, {
        textOffsets: {
          ...(pkg.textOffsets || {}),
          [group]: latest,
        },
      })
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
  }

  const handleMoveTextGroup = (
    pkg: WeddingPackage,
    group: PackageTextGroup,
    direction: -1 | 1
  ) => {
    const order: PackageTextGroup[] = pkg.textOrder?.length
      ? [...pkg.textOrder]
      : ['header', 'inclusions', 'footer']
    const idx = order.indexOf(group)
    const targetIdx = idx + direction
    if (idx === -1 || targetIdx < 0 || targetIdx >= order.length) return
    const next = [...order]
    ;[next[idx], next[targetIdx]] = [next[targetIdx], next[idx]]
    updatePackage(pkg.id, { textOrder: next })
  }

  const handleDropTextGroup = (pkg: WeddingPackage, targetGroup: PackageTextGroup) => {
    if (!draggedTextGroup || draggedTextGroup.pkgId !== pkg.id) return
    if (draggedTextGroup.group === targetGroup) return
    const order: PackageTextGroup[] = pkg.textOrder?.length
      ? [...pkg.textOrder]
      : ['header', 'inclusions', 'footer']
    const fromIdx = order.indexOf(draggedTextGroup.group)
    const toIdx = order.indexOf(targetGroup)
    if (fromIdx === -1 || toIdx === -1) return
    const next = [...order]
    const [moved] = next.splice(fromIdx, 1)
    next.splice(toIdx, 0, moved)
    updatePackage(pkg.id, { textOrder: next })
    setDraggedTextGroup(null)
  }

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

  // Unique IDs for accessible form controls
  const fullNameId = useId()
  const phoneId = useId()
  const emailId = useId()
  const eventDateId = useId()
  const guestCountId = useId()
  const notesId = useId()

  const handleInquireClick = (pkg: WeddingPackage) => {
    setInquiryPackage(pkg)
    setInquirySuccess(false)
  }

  const handleCloseModal = () => {
    setInquiryPackage(null)
    setInquirySuccess(false)
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
    // Sanitize input values
    const sanitizedName = formData.fullName.trim().slice(0, 80)
    const sanitizedPhone = formData.phone.trim().slice(0, 20)
    const sanitizedEmail = formData.email.trim().slice(0, 100)

    if (!sanitizedName || !sanitizedPhone || !sanitizedEmail) return

    setFormSubmitting(true)
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

  // Filter packages based on backdrop and search
  const filteredPackages = packages.filter((pkg) => {
    const matchesBackdrop =
      selectedBackdrop === 'All' || pkg.backdrop.toLowerCase() === selectedBackdrop.toLowerCase()
    const matchesSearch =
      pkg.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pkg.location.toLowerCase().includes(searchFilter.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchFilter.toLowerCase())
    return matchesBackdrop && matchesSearch
  })

  return (
    <Layout>
      {/* Top Hero Banner with Destination Wedding Showcase */}
      <section className="relative overflow-hidden bg-brand-dark py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-green-900/40">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-brand-secondary/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Text & Filters */}
            <div className="lg:col-span-7 text-left space-y-4">
              <div className="inline-flex items-center px-3.5 py-1 rounded-full bg-emerald-950/80 border border-brand-secondary/50 text-xs font-semibold text-brand-secondary">
                <span>God’s Own Country Destination Weddings</span>
              </div>

              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide leading-tight bg-[linear-gradient(135deg,#FFAE00_0%,#F9E866_100%)] bg-clip-text text-transparent drop-shadow-md"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Bespoke Destination Wedding Packages
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 font-medium leading-relaxed">
                Your celebration deserves the warmth and safety of home. Explore verified venues and
                bespoke destination wedding packages across God's Own Country, thoughtfully designed to
                honor Kerala’s rich cultural tapestry while keeping you in expert, caring hands.
              </p>

              {/* Quick Filter & Search Bar */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search packages by location or style..."
                    aria-label="Search destination packages"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-brand-dark/90 border border-green-700/50 rounded-full text-white placeholder-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-brand-secondary/40"
                  />
                  <Search className="w-4 h-4 text-emerald-400/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        selectedBackdrop === tab
                          ? 'bg-brand-secondary text-brand-dark font-bold shadow-md'
                          : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-900 border border-emerald-800/40'
                      }`}
                    >
                      {tab === 'All' ? 'All Backdrops' : tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Stacked Destination Images Showcase (Mobile & Desktop) */}
            <div className="lg:col-span-5 w-full flex items-center justify-center lg:justify-end pt-4 lg:pt-0">
              <StackedDestinationImages />
            </div>
          </div>
        </div>
      </section>

      {/* Main Packages Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* Admin Controls Bar (Visible only to Admin users) */}
        {isAdmin && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-950/60 border border-brand-secondary/40 flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                  Admin Package &amp; Reel Studio
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-900/90 border border-emerald-600/50 text-[10px] font-semibold text-emerald-200">
                  <Lock className="w-3 h-3 text-brand-secondary" />
                  <span>Mobile Layout Frozen</span>
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Add packages, upload photos, arrange desktop text/videos, and save edits for Desktop or Mobile.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingPackage(null)
                  setIsPkgModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFF04B] via-[#FFC700] to-[#FFA000] text-brand-dark font-extrabold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Package</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setReelTargetPackageId(null)
                  setEditingReel(null)
                  setIsReelModalOpen(true)
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-600/50 shadow-md active:scale-95 transition-all"
              >
                <Film className="w-4 h-4 text-brand-secondary" />
                <span>Add Reel Video</span>
              </button>

              {/* Separate Save Button for Desktop */}
              <button
                type="button"
                onClick={handleSaveDesktop}
                title={savedDesktopAt ? `Last saved: ${new Date(savedDesktopAt).toLocaleTimeString()}` : 'Save Desktop edits'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-900 hover:bg-emerald-800 text-brand-secondary font-bold text-xs border border-brand-secondary/50 shadow-md active:scale-95 transition-all"
              >
                {saveFeedback === 'desktop' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <Monitor className="w-3.5 h-3.5" />
                <span>{saveFeedback === 'desktop' ? 'Saved Desktop!' : 'Save Desktop'}</span>
              </button>

              {/* Apply to All Button — Appears between Save Desktop & Save Mobile after saving */}
              {(hasSavedSession || Boolean(savedDesktopAt) || Boolean(savedMobileAt)) && (
                <button
                  type="button"
                  onClick={() => handleApplyToAll()}
                  title="Apply your saved layout & reel settings to all packages"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary font-extrabold text-xs border border-brand-secondary/60 shadow-md active:scale-95 transition-all"
                >
                  {appliedAllPkgId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                  ) : (
                    <CopyCheck className="w-3.5 h-3.5" />
                  )}
                  <span>{appliedAllPkgId ? 'Applied to All!' : 'Apply to All'}</span>
                </button>
              )}

              {/* Separate Save Button for Mobile */}
              <button
                type="button"
                onClick={handleSaveMobile}
                title={savedMobileAt ? `Last saved: ${new Date(savedMobileAt).toLocaleTimeString()}` : 'Save Mobile edits'}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-900 hover:bg-emerald-800 text-brand-secondary font-bold text-xs border border-brand-secondary/50 shadow-md active:scale-95 transition-all"
              >
                {saveFeedback === 'mobile' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <Smartphone className="w-3.5 h-3.5" />
                <span>{saveFeedback === 'mobile' ? 'Saved Mobile!' : 'Save Mobile'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8" aria-label="Loading packages">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-green-800/40 bg-brand-dark/70 p-6 animate-pulse space-y-4"
              >
                <div className="aspect-video w-full bg-emerald-950/60 rounded-xl" />
                <div className="h-6 w-3/4 bg-emerald-950/80 rounded" />
                <div className="h-4 w-1/2 bg-emerald-950/60 rounded" />
                <div className="space-y-2 pt-2">
                  <div className="h-3 w-full bg-emerald-950/40 rounded" />
                  <div className="h-3 w-5/6 bg-emerald-950/40 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {hasError && !isLoading && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-8 text-center max-w-lg mx-auto space-y-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Unable to Load Packages</h3>
            <p className="text-sm text-red-200/80">
              We encountered a temporary network issue while fetching the destination wedding
              packages.
            </p>
            <button
              type="button"
              onClick={() => setHasError(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-secondary text-brand-dark font-bold text-sm shadow-md hover:bg-brand-secondary/90 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Loading</span>
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !hasError && filteredPackages.length === 0 && (
          <div className="rounded-2xl border border-emerald-800/40 bg-brand-dark/80 p-10 text-center max-w-md mx-auto space-y-4">
            <Package className="w-12 h-12 text-brand-secondary mx-auto opacity-70" />
            <h3 className="text-lg font-bold text-white">No Matching Packages Found</h3>
            <p className="text-sm text-emerald-200/80">
              We could not find any destination packages matching "{searchFilter || selectedBackdrop}
              ". Try selecting another backdrop or clear your search query.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedBackdrop('All')
                setSearchFilter('')
              }}
              className="px-5 py-2 rounded-full bg-emerald-900 text-emerald-100 hover:bg-emerald-800 font-semibold text-xs border border-emerald-700/50 transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Package Cards List — Horizontal card on desktop, with its own horizontally-ordered Reels section under it */}
        {!isLoading && !hasError && filteredPackages.length > 0 && (
          <div className="flex flex-col gap-10">
            {filteredPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="group rounded-2xl overflow-hidden bg-brand-dark/85 backdrop-blur-md border border-green-800/50 shadow-xl hover:border-brand-secondary/60 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Top Row: Photo on Left + Details on Right (or Swapped by Admin) */}
                <div
                  className={`flex flex-col ${
                    pkg.reverseDesktopLayout ? 'lg:flex-row-reverse' : 'lg:flex-row'
                  }`}
                >
                  {/* Left: Photo Gallery & Admin Controls */}
                  <div className="w-full lg:w-[44%] shrink-0">
                    <PackageImageGallery
                      pkg={pkg}
                      isAdmin={Boolean(isAdmin)}
                      onEdit={() => {
                        setEditingPackage(pkg)
                        setIsPkgModalOpen(true)
                      }}
                      onDelete={() => {
                        if (window.confirm(`Delete package "${pkg.title}"?`)) {
                          deletePackage(pkg.id)
                        }
                      }}
                    />
                  </div>

                  {/* Right: Package Content with Admin-Movable Text Groups */}
                  <div className="p-5 sm:p-6 lg:p-7 flex-1 flex flex-col justify-between space-y-4 min-w-0">
                    {isAdmin && (
                      <div className="hidden lg:flex flex-wrap items-center justify-end gap-2">
                        {pkg.textOffsets && Object.keys(pkg.textOffsets).length > 0 && (
                          <button
                            type="button"
                            onClick={() => updatePackage(pkg.id, { textOffsets: {} })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-amber-300 text-[10px] font-semibold border border-amber-600/40 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reset Text Positions</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            updatePackage(pkg.id, {
                              reverseDesktopLayout: !pkg.reverseDesktopLayout,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-200 text-[10px] font-semibold border border-emerald-700/50 transition-colors"
                        >
                          <ArrowLeftRight className="w-3 h-3 text-brand-secondary" />
                          <span>Swap Image / Text Side</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyToAll(pkg.id)}
                          title="Apply this package's layout & reel settings to all packages"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-secondary/20 hover:bg-brand-secondary/35 text-brand-secondary text-[10px] font-bold border border-brand-secondary/50 transition-colors"
                        >
                          {appliedAllPkgId === pkg.id ? (
                            <Check className="w-3 h-3 text-emerald-300" />
                          ) : (
                            <CopyCheck className="w-3 h-3" />
                          )}
                          <span>
                            {appliedAllPkgId === pkg.id ? 'Applied to All!' : 'Apply to All Packages'}
                          </span>
                        </button>
                      </div>
                    )}

                    {(pkg.textOrder?.length
                      ? pkg.textOrder
                      : (['header', 'inclusions', 'footer'] as PackageTextGroup[])
                    ).map((groupKey, gIdx, arr) => {
                      const activeFreeOffset =
                        freeDragState?.pkgId === pkg.id && freeDragState.group === groupKey
                          ? { x: freeDragState.x, y: freeDragState.y }
                          : pkg.textOffsets?.[groupKey]

                      // Scope free-drag offsets to Desktop (lg:) so Mobile alignment remains 100% frozen
                      const hasOffset =
                        activeFreeOffset && (activeFreeOffset.x !== 0 || activeFreeOffset.y !== 0)
                      const freeStyle = hasOffset
                        ? ({
                            '--pkg-tx': `${activeFreeOffset.x}px`,
                            '--pkg-ty': `${activeFreeOffset.y}px`,
                            zIndex: freeDragState?.group === groupKey ? 30 : 10,
                          } as React.CSSProperties)
                        : undefined
                      const freeClass = hasOffset
                        ? 'lg:relative lg:[transform:translate3d(var(--pkg-tx,0px),var(--pkg-ty,0px),0)]'
                        : ''

                      const moveControls = isAdmin ? (
                        <div className="hidden lg:flex items-center gap-1 shrink-0">
                          <span
                            onPointerDown={(e) => handleFreeMoveStart(pkg, groupKey, e)}
                            title="Grab & drag anywhere on this package"
                            className="inline-flex items-center gap-0.5 px-1.5 py-1 rounded bg-brand-secondary/20 text-brand-secondary hover:bg-brand-secondary/35 cursor-move border border-brand-secondary/50 select-none"
                          >
                            <Move className="w-3 h-3" />
                            <span className="text-[9px] font-bold">Move</span>
                          </span>
                          <span
                            title="Drag to swap vertical order"
                            className="p-1 rounded bg-emerald-950/80 text-emerald-200 cursor-grab active:cursor-grabbing border border-emerald-800/60"
                          >
                            <GripVertical className="w-3 h-3" />
                          </span>
                          <button
                            type="button"
                            disabled={gIdx === 0}
                            onClick={() => handleMoveTextGroup(pkg, groupKey, -1)}
                            aria-label={`Move ${groupKey} up`}
                            className="p-1 rounded bg-emerald-950/80 text-emerald-200 hover:text-brand-secondary border border-emerald-800/60 disabled:opacity-30"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={gIdx === arr.length - 1}
                            onClick={() => handleMoveTextGroup(pkg, groupKey, 1)}
                            aria-label={`Move ${groupKey} down`}
                            className="p-1 rounded bg-emerald-950/80 text-emerald-200 hover:text-brand-secondary border border-emerald-800/60 disabled:opacity-30"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      ) : null

                      const dragWrapperProps = isAdmin
                        ? {
                            draggable: true,
                            onDragStart: (e: React.DragEvent) => {
                              e.stopPropagation()
                              setDraggedTextGroup({ pkgId: pkg.id, group: groupKey })
                            },
                            onDragOver: (e: React.DragEvent) => {
                              if (draggedTextGroup?.pkgId === pkg.id) {
                                e.preventDefault()
                              }
                            },
                            onDrop: (e: React.DragEvent) => {
                              e.preventDefault()
                              handleDropTextGroup(pkg, groupKey)
                            },
                            onDragEnd: () => setDraggedTextGroup(null),
                          }
                        : {}

                      const isBeingDragged =
                        draggedTextGroup?.pkgId === pkg.id && draggedTextGroup.group === groupKey

                      if (groupKey === 'header') {
                        return (
                          <div
                            key="header"
                            {...dragWrapperProps}
                            style={freeStyle}
                            className={`space-y-2 rounded-xl transition-shadow ${freeClass} ${
                              isAdmin ? 'lg:hover:outline lg:hover:outline-1 lg:hover:outline-dashed lg:hover:outline-emerald-700/70 lg:p-1 lg:-m-1' : ''
                            } ${isBeingDragged ? 'opacity-45' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 flex-wrap">
                                <MapPin className="w-3.5 h-3.5 text-white/80 shrink-0" />
                                <span>{pkg.location}</span>
                                <span className="text-emerald-700">•</span>
                                <Users className="w-3.5 h-3.5 text-white/80 shrink-0" />
                                <span>{pkg.guestCapacity}</span>
                              </div>
                              {moveControls}
                            </div>

                            <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-brand-secondary transition-colors leading-snug">
                              {pkg.title}
                            </h2>

                            <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed">
                              {pkg.description}
                            </p>
                          </div>
                        )
                      }

                      if (groupKey === 'inclusions') {
                        return (
                          <div
                            key="inclusions"
                            {...dragWrapperProps}
                            style={freeStyle}
                            className={`space-y-2 pt-2 border-t border-emerald-900/60 rounded-xl transition-shadow ${freeClass} ${
                              isAdmin ? 'lg:hover:outline lg:hover:outline-1 lg:hover:outline-dashed lg:hover:outline-emerald-700/70 lg:p-1 lg:-m-1' : ''
                            } ${isBeingDragged ? 'opacity-45' : ''}`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                                Bespoke Inclusions
                              </p>
                              {moveControls}
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100/90">
                              {pkg.inclusions.map((inc, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary/80 shrink-0 mt-1.5" />
                                  <span>{inc}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      }

                      return (
                        <div
                          key="footer"
                          {...dragWrapperProps}
                          style={freeStyle}
                          className={`pt-3 border-t border-emerald-900/60 flex items-center justify-between gap-4 rounded-xl transition-shadow ${freeClass} ${
                            isAdmin ? 'lg:hover:outline lg:hover:outline-1 lg:hover:outline-dashed lg:hover:outline-emerald-700/70 lg:p-1 lg:-m-1' : ''
                          } ${isBeingDragged ? 'opacity-45' : ''}`}
                        >
                          <div className="text-[11px] text-emerald-400/80">
                            <span>Curated by </span>
                            <strong className="text-emerald-200">{pkg.partnerPlanner}</strong>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {moveControls}
                            <button
                              type="button"
                              onClick={() => handleInquireClick(pkg)}
                              className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#FFF04B] via-[#FFC700] to-[#FFA000] hover:from-[#FFF566] hover:to-[#FFB000] text-brand-dark font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 shrink-0"
                            >
                              <span>Inquire Package</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bottom Row: Reels Section directly UNDER this package (Horizontally ordered on web, vertical on mobile) */}
                {((pkg.reels && pkg.reels.length > 0) || isAdmin) && (
                  <div
                    onDragOver={(e) => {
                      if (isAdmin && draggedReel) e.preventDefault()
                    }}
                    onDrop={(e) => {
                      if (!isAdmin || !draggedReel) return
                      e.preventDefault()
                      handleDropReel(pkg.id)
                    }}
                    className="p-5 sm:p-6 lg:px-7 border-t border-emerald-900/60 bg-emerald-950/20 space-y-4"
                  >
                    {isAdmin && (
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
                            draggable={Boolean(isAdmin)}
                            onDragStart={(e) => {
                              e.stopPropagation()
                              setDraggedReel({ pkgId: pkg.id, reelId: reel.id, index: rIdx })
                            }}
                            onDragOver={(e) => {
                              if (isAdmin && draggedReel) e.preventDefault()
                            }}
                            onDrop={(e) => {
                              if (!isAdmin || !draggedReel) return
                              e.preventDefault()
                              e.stopPropagation()
                              handleDropReel(pkg.id, rIdx)
                            }}
                            onDragEnd={() => setDraggedReel(null)}
                            className={`w-full md:w-auto flex justify-center md:justify-start transition-opacity ${
                              draggedReel?.reelId === reel.id ? 'opacity-45' : ''
                            }`}
                          >
                            <ReelPlayerCard
                              reel={reel}
                              isAdmin={Boolean(isAdmin)}
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
                      <p className="text-xs text-emerald-300/60 italic">
                        No reels added yet. Click &quot;Add Reel&quot; to attach a 5s dummy or custom video.
                      </p>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
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
          <div className="relative w-full max-w-lg rounded-2xl bg-brand-dark border border-brand-secondary/50 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full bg-emerald-950/60 border border-emerald-800/40"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {inquirySuccess ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-900/80 border border-brand-secondary flex items-center justify-center mx-auto text-brand-secondary">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Inquiry Received with Warmth</h3>
                <p className="text-sm text-emerald-100/90 leading-relaxed">
                  Thank you! Our dedicated Kerala destination wedding concierges and verified vendor
                  partners have received your inquiry for{' '}
                  <strong className="text-brand-secondary">{inquiryPackage.title}</strong>. We will
                  reach out to you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2.5 rounded-full bg-brand-secondary text-brand-dark font-bold text-sm hover:bg-brand-secondary/90 transition-all shadow-md"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-brand-secondary font-semibold">
                    Bespoke Consultation
                  </span>
                  <h3 id="inquiry-modal-title" className="text-xl font-bold text-white">
                    Inquire: {inquiryPackage.title}
                  </h3>
                  <p className="text-xs text-emerald-200/80">
                    Direct transparent connection with verified Kerala planners. Zero brokerage.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label htmlFor={fullNameId} className="block text-xs font-semibold text-emerald-200 mb-1">
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
                        className="w-full pl-9 pr-3 py-2 text-sm bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                      />
                      <User className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={phoneId} className="block text-xs font-semibold text-emerald-200 mb-1">
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
                          className="w-full pl-9 pr-3 py-2 text-sm bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                        />
                        <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor={emailId} className="block text-xs font-semibold text-emerald-200 mb-1">
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
                          className="w-full pl-9 pr-3 py-2 text-sm bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                        />
                        <Mail className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor={eventDateId} className="block text-xs font-semibold text-emerald-200 mb-1">
                        Preferred Event Date
                      </label>
                      <div className="relative">
                        <input
                          id={eventDateId}
                          type="date"
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                        />
                        <Calendar className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor={guestCountId} className="block text-xs font-semibold text-emerald-200 mb-1">
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
                          className="w-full pl-9 pr-3 py-2 text-sm bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                        />
                        <Users className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={notesId} className="block text-xs font-semibold text-emerald-200 mb-1">
                      Special Preferences or Rituals
                    </label>
                    <textarea
                      id={notesId}
                      rows={3}
                      maxLength={1000}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Share details on traditions (Sadya preferences, musical welcome, temple rituals, etc.)"
                      className="w-full p-2.5 text-sm bg-brand-dark/90 border border-emerald-700/50 rounded-lg text-white placeholder-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-brand-secondary/50"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#FFF04B] via-[#FFC700] to-[#FFA000] hover:from-[#FFF566] hover:to-[#FFB000] text-brand-dark font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
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
    </Layout>
  )
}
