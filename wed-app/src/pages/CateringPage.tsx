import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  UtensilsCrossed,
  Soup,
  Flame,
  Clock,
  Users,
  CheckCircle2,
  Send,
  X,
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Edit3,
  AlertCircle,
  Star,
  ChevronLeft,
  Heart,
} from 'lucide-react'
import Layout from '../components/layout/Layout'
import CateringMotionHero from '../components/catering/CateringMotionHero'
import {
  useCateringStore,
  type CateringCategory,
  type CateringPackage,
} from '../store/cateringStore'
import { useAuth } from '../contexts/AuthContext'
import { useLoginGate } from '../contexts/LoginGateContext'
import {
  checkRateLimit,
  recordRateLimitAttempt,
  formatRateLimitMessage,
} from '../lib/rateLimit'

export default function CateringPage() {
  const { requireAuth } = useLoginGate()
  const [searchParams, setSearchParams] = useSearchParams()
  const packagesListRef = useRef<HTMLDivElement>(null)

  const packages = useCateringStore((s) => s.packages)
  const selectedCategory = useCateringStore((s) => s.selectedCategory)
  const setSelectedCategory = useCateringStore((s) => s.setSelectedCategory)
  const addPackage = useCateringStore((s) => s.addPackage)
  const updatePackage = useCateringStore((s) => s.updatePackage)
  const deletePackage = useCateringStore((s) => s.deletePackage)
  const heroTexts = useCateringStore((s) => s.heroTexts)
  const updateHeroTexts = useCateringStore((s) => s.updateHeroTexts)

  const { user, profile } = useAuth()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'
  const isCateringVendor = profile?.role === 'vendor' && profile?.vendor_type === 'catering'
  const canManageCatering = Boolean(isAdmin || isCateringVendor)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null)
  const [inquiryPackage, setInquiryPackage] = useState<CateringPackage | null>(null)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [inquiryError, setInquiryError] = useState<string | null>(null)
  const [expandedInclusions, setExpandedInclusions] = useState<Record<string, boolean>>({})

  const handleOpenPackage = (pkgId: string) => {
    requireAuth('to view full catering package details and inquire', () => {
      setSelectedPackageId(pkgId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  // Admin Modals
  const [isEditHeroModalOpen, setIsEditHeroModalOpen] = useState(false)
  const [isAddEditPackageModalOpen, setIsAddEditPackageModalOpen] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)

  // Hero text form state
  const [heroFormTitle, setHeroFormTitle] = useState(heroTexts.title)
  const [heroFormDesc, setHeroFormDesc] = useState(heroTexts.description)

  // Package Form state
  const [pkgTitle, setPkgTitle] = useState('')
  const [pkgCategory, setPkgCategory] = useState<CateringCategory>('sadya')
  const [pkgTagline, setPkgTagline] = useState('')
  const [pkgPrice, setPkgPrice] = useState('')
  const [pkgDuration, setPkgDuration] = useState('')
  const [pkgGuestCount, setPkgGuestCount] = useState('')
  const [pkgKitchenSpec, setPkgKitchenSpec] = useState('')
  const [pkgBadge, setPkgBadge] = useState('')
  const [pkgImage, setPkgImage] = useState('/catering-sadya.jpg')
  const [pkgInclusionsText, setPkgInclusionsText] = useState('')
  const [pkgCourses, setPkgCourses] = useState('')
  const [pkgLiveStalls, setPkgLiveStalls] = useState('')
  const [pkgDesserts, setPkgDesserts] = useState('')
  const [pkgServiceCrew, setPkgServiceCrew] = useState('')

  // Client Inquiry form state
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [approxGuests, setApproxGuests] = useState('500')
  const [notes, setNotes] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)

  // Sync category with URL query param if present (e.g. /catering?type=sadya)
  useEffect(() => {
    const typeParam = searchParams.get('type') as CateringCategory | null
    if (typeParam && ['sadya', 'buffet', 'live'].includes(typeParam)) {
      setSelectedCategory(typeParam)
    }
  }, [searchParams, setSelectedCategory])

  const handleCategoryFilter = (cat: CateringCategory | 'all') => {
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

  const filteredPackages = packages.filter((pkg) => {
    const matchesCategory =
      selectedCategory === 'all' || pkg.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.kitchenSpec.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleInclusions = (pkgId: string) => {
    setExpandedInclusions((prev) => ({
      ...prev,
      [pkgId]: !prev[pkgId],
    }))
  }

  // Open Add Package Modal
  const handleOpenAddModal = () => {
    setEditingPackageId(null)
    setPkgTitle('')
    setPkgCategory('sadya')
    setPkgTagline('')
    setPkgPrice('Price on Demand')
    setPkgDuration('Lunch (11:30 AM - 3:30 PM)')
    setPkgGuestCount('Min. 250 Guests')
    setPkgKitchenSpec('100% Traditional Brass Urulis â€¢ Pure Ghee')
    setPkgBadge('Signature Feast')
    setPkgImage('/catering-sadya.jpg')
    setPkgInclusionsText('28 Traditional Curries on Plantain Leaf\n4 Hot Payasams\nKasavu Uniformed Servers\nLive Payasam Counter')
    setPkgCourses('28 Dishes')
    setPkgLiveStalls('Live Payasam Stall')
    setPkgDesserts('4 Payasams')
    setPkgServiceCrew('1 Server per 15 Guests')
    setIsAddEditPackageModalOpen(true)
  }

  // Open Edit Package Modal
  const handleOpenEditModal = (pkg: CateringPackage) => {
    setEditingPackageId(pkg.id)
    setPkgTitle(pkg.title)
    setPkgCategory(pkg.category)
    setPkgTagline(pkg.tagline)
    setPkgPrice(pkg.price)
    setPkgDuration(pkg.duration)
    setPkgGuestCount(pkg.guestCount)
    setPkgKitchenSpec(pkg.kitchenSpec)
    setPkgBadge(pkg.badge)
    setPkgImage(pkg.image)
    setPkgInclusionsText(pkg.inclusions.join('\n'))
    setPkgCourses(pkg.deliverables.courses)
    setPkgLiveStalls(pkg.deliverables.liveStalls)
    setPkgDesserts(pkg.deliverables.desserts)
    setPkgServiceCrew(pkg.deliverables.serviceCrew)
    setIsAddEditPackageModalOpen(true)
  }

  // Save Package (Add or Update)
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pkgTitle.trim() || !pkgPrice.trim()) {
      alert('Please enter a feast title and price per plate.')
      return
    }

    const inclusionsArray = pkgInclusionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)

    const categoryLabels: Record<CateringCategory, string> = {
      sadya: 'Traditional Royal Sadya',
      buffet: 'Grand Multi-Cuisine Buffet',
      live: 'Live Counters & Fiesta',
    }

    if (editingPackageId) {
      updatePackage(editingPackageId, {
        title: pkgTitle.trim(),
        category: pkgCategory,
        categoryLabel: categoryLabels[pkgCategory],
        tagline: pkgTagline.trim(),
        price: pkgPrice.trim(),
        duration: pkgDuration.trim(),
        guestCount: pkgGuestCount.trim(),
        kitchenSpec: pkgKitchenSpec.trim(),
        badge: pkgBadge.trim(),
        image: pkgImage.trim() || '/catering-sadya.jpg',
        inclusions: inclusionsArray,
        deliverables: {
          courses: pkgCourses.trim(),
          liveStalls: pkgLiveStalls.trim(),
          desserts: pkgDesserts.trim(),
          serviceCrew: pkgServiceCrew.trim(),
        },
      })
    } else {
      const newPkg: CateringPackage = {
        id: `catering-${Date.now()}`,
        title: pkgTitle.trim(),
        category: pkgCategory,
        categoryLabel: categoryLabels[pkgCategory],
        tagline: pkgTagline.trim(),
        price: pkgPrice.trim(),
        duration: pkgDuration.trim(),
        guestCount: pkgGuestCount.trim(),
        image: pkgImage.trim() || '/catering-sadya.jpg',
        kitchenSpec: pkgKitchenSpec.trim(),
        badge: pkgBadge.trim() || 'Custom Feast',
        highlights: ['Pure Ghee', 'Artisanal Preparation', 'Uniformed Crew'],
        inclusions: inclusionsArray,
        deliverables: {
          courses: pkgCourses.trim(),
          liveStalls: pkgLiveStalls.trim(),
          desserts: pkgDesserts.trim(),
          serviceCrew: pkgServiceCrew.trim(),
        },
        vendorId: profile?.id,
        vendorName: profile?.business_name || profile?.full_name || 'MANA Verified Catering',
      }
      addPackage(newPkg)
    }

    setIsAddEditPackageModalOpen(false)
  }

  // Save Hero Texts
  const handleSaveHeroTexts = (e: React.FormEvent) => {
    e.preventDefault()
    updateHeroTexts({
      title: heroFormTitle.trim(),
      description: heroFormDesc.trim(),
    })
    setIsEditHeroModalOpen(false)
  }

  const handleInquireSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setInquiryError(null)

    const rateCheck = checkRateLimit('inquiry_catering', 2, 60)
    if (!rateCheck.allowed) {
      setInquiryError(formatRateLimitMessage(rateCheck.retryAfterSeconds, 'inquiry'))
      return
    }

    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Please provide your name and contact phone number.')
      return
    }
    setFormSubmitting(true)
    recordRateLimitAttempt('inquiry_catering', 60)
    setTimeout(() => {
      setFormSubmitting(false)
      setInquirySuccess(true)
    }, 600)
  }

  return (
    <Layout>
      <div className="w-full">
        {/* Hero Section with Grand Royal Banquet & Platter Cascade Motion */}
        <CateringMotionHero
          onSelectCategory={(cat) => handleCategoryFilter(cat)}
          onExplorePackages={handleScrollToPackages}
          onOpenEditHeroModal={() => {
            setHeroFormTitle(heroTexts.title)
            setHeroFormDesc(heroTexts.description)
            setIsEditHeroModalOpen(true)
          }}
        />

        {/* CATERING PACKAGES BROWSER */}
        <div
          ref={packagesListRef}
          id="catering-packages"
          className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-8 sm:py-14 scroll-mt-20"
        >
          {/* Filter Bar & Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#7E1F3E] tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Catering & Dining Packages
              </h2>
              <p className="text-xs sm:text-sm text-black/70 font-medium mt-1">
                Authentic banana-leaf Sadya, luxury multi-cuisine buffets, and theatrical live food counters.
              </p>
            </div>

            {/* Search Input & Admin Add Button */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="w-full md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sadya, buffet, live chaat..."
                  className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-full text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 shadow-2xs"
                />
              </div>

              {/* Admin / Catering Vendor: Add New Feast Button */}
              {canManageCatering && (
                <button
                  type="button"
                  onClick={handleOpenAddModal}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#C83B68] hover:bg-[#A82B54] text-white font-bold text-xs shadow-xs active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Add Feast</span>
                  <span className="sm:hidden">Add</span>
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 pb-2 border-b border-[#D8F0EC]">
            {[
              { id: 'all', label: 'All Menus', icon: SlidersHorizontal },
              { id: 'sadya', label: 'Traditional Royal Sadya', icon: Soup },
              { id: 'buffet', label: 'Grand Multi-Cuisine Buffet', icon: UtensilsCrossed },
              { id: 'live', label: 'Live Counters & Fiesta', icon: Flame },
            ].map((tab) => {
              const isSelected = selectedCategory === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryFilter(tab.id as CateringCategory | 'all')}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] text-white shadow-xs'
                      : 'bg-white hover:bg-[#FFF9ED] text-[#5A172D] border border-[#D8F0EC]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tab.id === 'all'
                      ? packages.length
                      : packages.filter((p) => p.category === tab.id).length}
                  </span>
                </button>
              )
            })}
          </div>

          {/* 2-Column Mobile Grid of Packages */}
          {filteredPackages.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-[#D8F0EC] shadow-sm max-w-md mx-auto space-y-3">
              <UtensilsCrossed className="w-12 h-12 text-[#C83B68] mx-auto opacity-70" />
              <h3 className="text-lg font-bold text-[#5A172D]">No Matching Menus</h3>
              <p className="text-xs text-black/60">
                We couldn't find any packages matching "{searchQuery}".
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all')
                  setSearchQuery('')
                }}
                className="px-4 py-2 rounded-full bg-[#C83B68] text-white font-bold text-xs"
              >
                Reset Filters
              </button>
            </div>
          ) : selectedPackageId ? (
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
                .map((pkg) => {
                  const isExpanded = Boolean(expandedInclusions[pkg.id])
                  const canEditPkg = Boolean(isAdmin || (isCateringVendor && pkg.vendorId === profile?.id))
                  return (
                    <article
                      key={pkg.id}
                      className="group relative rounded-3xl overflow-hidden bg-white border border-[#D8F0EC] shadow-md flex flex-col max-w-4xl mx-auto"
                    >
                      {canEditPkg && (
                        <div className="absolute top-3 left-3 z-30 flex items-center gap-1">
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(pkg); }} title="Edit Package" className="p-2 rounded-full bg-white/90 hover:bg-white text-[#C83B68] shadow-md border border-[#D8F0EC] transition-transform active:scale-90"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${pkg.title}"?`)) { deletePackage(pkg.id); setSelectedPackageId(null); } }} title="Delete Package" className="p-2 rounded-full bg-white/90 hover:bg-white text-red-600 shadow-md border border-[#D8F0EC] transition-transform active:scale-90"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                      <div className="relative aspect-[16/9] max-h-[380px] overflow-hidden bg-black/10">
                        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover object-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        <div className={`absolute top-3 ${canEditPkg ? 'left-20' : 'left-3'} px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#D8F0EC] text-xs font-bold text-[#7E1F3E] shadow-2xs`}>{pkg.categoryLabel}</div>
                        <div className="absolute top-3 right-3 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#E05A85] to-[#C83B68] text-white text-xs font-black shadow-xs">{pkg.price}</div>
                        <div className="absolute bottom-4 left-4 right-4 text-white flex items-center gap-4 text-xs font-medium pointer-events-none">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#F3A2BE]" /><span>{pkg.duration}</span></span>
                          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#F3A2BE]" /><span>{pkg.guestCount}</span></span>
                        </div>
                      </div>
                      <div className="p-5 sm:p-7 space-y-5">
                        <div className="space-y-2">
                          <h3 className="text-xl sm:text-2xl font-bold text-[#5A172D] leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>{pkg.title}</h3>
                          <p className="text-xs sm:text-sm text-black/75 font-medium leading-relaxed">{pkg.tagline}</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2"><Soup className="w-4 h-4 text-[#C83B68] shrink-0" /><div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Courses</span><span className="text-black/60">{pkg.deliverables.courses}</span></div></div>
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2"><Flame className="w-4 h-4 text-[#C83B68] shrink-0" /><div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Live Stations</span><span className="text-black/60">{pkg.deliverables.liveStalls}</span></div></div>
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2"><UtensilsCrossed className="w-4 h-4 text-[#C83B68] shrink-0" /><div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Dessert Bar</span><span className="text-black/60">{pkg.deliverables.desserts}</span></div></div>
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2"><Users className="w-4 h-4 text-[#C83B68] shrink-0" /><div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Service Crew</span><span className="text-black/60">{pkg.deliverables.serviceCrew}</span></div></div>
                        </div>
                        <div>
                          <button type="button" onClick={() => toggleInclusions(pkg.id)} className="text-xs font-bold text-[#C83B68] hover:underline flex items-center gap-1 cursor-pointer">
                            <span>{isExpanded ? 'Hide Menu' : `View Full Menu Inclusions (${pkg.inclusions.length})`}</span>
                          </button>
                          <ul className="mt-2.5 space-y-2 border-t border-[#D8F0EC] pt-3 text-xs sm:text-sm text-black/80">
                            {(isExpanded ? pkg.inclusions : pkg.inclusions.slice(0, 4)).map((inc, iIdx) => (
                              <li key={iIdx} className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#C83B68] shrink-0 mt-0.5" /><span>{inc}</span></li>
                            ))}
                          </ul>
                        </div>
                        <div className="pt-3 border-t border-[#D8F0EC]">
                          <button
                            type="button"
                            onClick={() => requireAuth(`to view catering details and inquire about "${pkg.title}"`, () => { setInquiryPackage(pkg); setInquirySuccess(false); })}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] hover:brightness-105 text-white font-extrabold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                          >
                            <Send className="w-4 h-4" />
                            <span>Inquire Package</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  )
                })}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5 lg:gap-6">
              {filteredPackages.map((pkg) => {
                const canEditPkg = Boolean(isAdmin || (isCateringVendor && pkg.vendorId === profile?.id))
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleOpenPackage(pkg.id)}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer active:scale-[0.98] group hover:-translate-y-1 relative"
                  >
                    {canEditPkg && (
                      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1">
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleOpenEditModal(pkg); }} title="Edit Package" className="p-1.5 rounded-full bg-white/95 hover:bg-white text-[#C83B68] shadow-sm border border-gray-200 transition-transform active:scale-90"><Edit2 className="w-3 h-3" /></button>
                        <button type="button" onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${pkg.title}"?`)) deletePackage(pkg.id); }} title="Delete Package" className="p-1.5 rounded-full bg-white/95 hover:bg-white text-red-600 shadow-sm border border-gray-200 transition-transform active:scale-90"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    )}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <button type="button" aria-label="Save package" onClick={(e) => e.stopPropagation()} className="absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-amber-500 shadow-sm border border-amber-100/60 active:scale-90 transition-transform">
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" />
                      </button>
                    </div>
                    <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-1.5">
                      <div className="space-y-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#B8710B] block truncate">{pkg.vendorName || pkg.categoryLabel}</span>
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-snug line-clamp-2">{pkg.title}</h3>
                        <div className="flex items-center gap-1 pt-0.5">
                          <div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-gray-200 text-gray-300" />))}</div>
                          <span className="text-[10px] sm:text-xs text-gray-400 font-medium">(0)</span>
                        </div>
                      </div>
                      <div className="pt-1.5">
                        <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FFF5E6] text-[#B8710B] text-[10px] sm:text-xs font-bold border border-[#FFE0B2]">{pkg.price || 'Price on Request'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

{/* INQUIRY MODAL */}
        {inquiryPackage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-[#FFFDF7] border border-[#D8F0EC] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setInquiryPackage(null)}
                className="absolute top-4 right-4 p-1.5 text-[#7E1F3E] hover:text-[#5A172D] rounded-full bg-white border border-[#D8F0EC] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {inquirySuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-white border border-[#D8F0EC] flex items-center justify-center mx-auto text-[#C83B68]">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-[#5A172D]">Menu Tasting & Inquiry Sent</h3>
                  <p className="text-xs sm:text-sm text-[#7E1F3E]/80">
                    Thank you! Our master banquet chef will contact you at{' '}
                    <span className="font-semibold text-black">{clientPhone}</span> with custom menu curation and food tasting slots.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setInquiryPackage(null)
                      setInquirySuccess(false)
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-[#C83B68] text-white font-bold text-xs"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquireSubmit} className="space-y-4">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#C83B68] border border-[#D8F0EC]">
                      {inquiryPackage.categoryLabel}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-[#5A172D] mt-1">
                      Inquire Menu: {inquiryPackage.title}
                    </h3>
                    <p className="text-xs text-black/70">
                      Pricing: <strong className="text-[#C83B68]">{inquiryPackage.price}</strong>
                    </p>
                  </div>

                  {inquiryError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{inquiryError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-black/80 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="e.g. Rahul Varma"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          placeholder="rahul@example.com"
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          Event Date
                        </label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-black/80 mb-1">
                          Expected Guest Count
                        </label>
                        <input
                          type="number"
                          value={approxGuests}
                          onChange={(e) => setApproxGuests(e.target.value)}
                          placeholder="500"
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-black/80 mb-1">
                        Cuisine Preferences & Special Dish Requests
                      </label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Traditional Palada payasam, live dosa counter, pure vegetarian Sadya"
                        className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] text-white font-extrabold text-xs sm:text-sm shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    {formSubmitting ? 'Sending Request...' : 'Request Menu Tasting & Quote'}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ADMIN EDIT HERO TEXTS MODAL */}
        {isEditHeroModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-md rounded-3xl bg-white border border-[#D8F0EC] shadow-2xl p-6 sm:p-7">
              <button
                type="button"
                onClick={() => setIsEditHeroModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-[#5A172D] mb-4 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C83B68]" />
                <span>Edit Catering Hero Title & Description</span>
              </h3>

              <form onSubmit={handleSaveHeroTexts} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Hero Title
                  </label>
                  <input
                    type="text"
                    required
                    value={heroFormTitle}
                    onChange={(e) => setHeroFormTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D8F0EC] rounded-xl focus:ring-2 focus:ring-[#C83B68]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Hero Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={heroFormDesc}
                    onChange={(e) => setHeroFormDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#D8F0EC] rounded-xl focus:ring-2 focus:ring-[#C83B68]/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditHeroModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#C83B68] text-white text-xs font-bold"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN ADD / EDIT PACKAGE MODAL */}
        {isAddEditPackageModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <div className="relative w-full max-w-lg rounded-3xl bg-white border border-[#D8F0EC] shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setIsAddEditPackageModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-lg font-bold text-[#5A172D] mb-4 flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4 text-[#C83B68]" />
                <span>{editingPackageId ? 'Edit Catering Package' : 'Add New Catering Package'}</span>
              </h3>

              <form onSubmit={handleSavePackage} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">Package Title *</label>
                    <input
                      type="text"
                      required
                      value={pkgTitle}
                      onChange={(e) => setPkgTitle(e.target.value)}
                      placeholder="e.g. Imperial Sadya"
                      className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">Category *</label>
                    <select
                      value={pkgCategory}
                      onChange={(e) => setPkgCategory(e.target.value as CateringCategory)}
                      className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                    >
                      <option value="sadya">Traditional Royal Sadya</option>
                      <option value="buffet">Grand Multi-Cuisine Buffet</option>
                      <option value="live">Live Counters & Fiesta</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">Price per Plate / Package Cost *</label>
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
                    <label className="block text-xs font-bold text-black/80 mb-1">Badge Text</label>
                    <input
                      type="text"
                      value={pkgBadge}
                      onChange={(e) => setPkgBadge(e.target.value)}
                      placeholder="e.g. Heritage Feast"
                      className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">Service Hours</label>
                    <input
                      type="text"
                      value={pkgDuration}
                      onChange={(e) => setPkgDuration(e.target.value)}
                      placeholder="e.g. Lunch Hours (11:30 AM - 3:30 PM)"
                      className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black/80 mb-1">Guest Capacity</label>
                    <input
                      type="text"
                      value={pkgGuestCount}
                      onChange={(e) => setPkgGuestCount(e.target.value)}
                      placeholder="e.g. Min. 300 - 3,000+ Guests"
                      className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Kitchen & Vessel Rig Spec</label>
                  <input
                    type="text"
                    value={pkgKitchenSpec}
                    onChange={(e) => setPkgKitchenSpec(e.target.value)}
                    placeholder="e.g. 100% Traditional Brass Urulis â€¢ Pure Golden Ghee"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Short Tagline</label>
                  <input
                    type="text"
                    value={pkgTagline}
                    onChange={(e) => setPkgTagline(e.target.value)}
                    placeholder="e.g. Authentic heritage feast served on fresh green plantain leaves"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">Image URL / Path</label>
                  <input
                    type="text"
                    value={pkgImage}
                    onChange={(e) => setPkgImage(e.target.value)}
                    placeholder="/catering-sadya.jpg"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-black/70 mb-0.5">Courses</label>
                    <input
                      type="text"
                      value={pkgCourses}
                      onChange={(e) => setPkgCourses(e.target.value)}
                      placeholder="28 Dishes"
                      className="w-full px-2 py-1 text-xs border border-[#D8F0EC] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black/70 mb-0.5">Live Stalls</label>
                    <input
                      type="text"
                      value={pkgLiveStalls}
                      onChange={(e) => setPkgLiveStalls(e.target.value)}
                      placeholder="Live Payasam"
                      className="w-full px-2 py-1 text-xs border border-[#D8F0EC] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black/70 mb-0.5">Desserts</label>
                    <input
                      type="text"
                      value={pkgDesserts}
                      onChange={(e) => setPkgDesserts(e.target.value)}
                      placeholder="4 Payasams"
                      className="w-full px-2 py-1 text-xs border border-[#D8F0EC] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-black/70 mb-0.5">Service Crew</label>
                    <input
                      type="text"
                      value={pkgServiceCrew}
                      onChange={(e) => setPkgServiceCrew(e.target.value)}
                      placeholder="1 Server / 15 Guests"
                      className="w-full px-2 py-1 text-xs border border-[#D8F0EC] rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black/80 mb-1">
                    Menu Inclusions (One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={pkgInclusionsText}
                    onChange={(e) => setPkgInclusionsText(e.target.value)}
                    placeholder="28 authentic curries on fresh plantain leaf&#10;4 hot payasams (Palada, Parippu, Ada)&#10;Kasavu uniform serving team"
                    className="w-full px-3 py-1.5 text-xs border border-[#D8F0EC] rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddEditPackageModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-gray-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#C83B68] text-white text-xs font-bold"
                  >
                    {editingPackageId ? 'Update Menu' : 'Create Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

