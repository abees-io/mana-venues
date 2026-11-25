import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Smartphone,
  Heart,
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  Send,
  X,
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Star,
  ChevronLeft,
} from 'lucide-react'
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
import {
  checkRateLimit,
  recordRateLimitAttempt,
  formatRateLimitMessage,
} from '../lib/rateLimit'

export default function PhotographyPage() {
  const { requireAuth } = useLoginGate()
  const { user, profile } = useAuth()
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
  const [inquiryPackage, setInquiryPackage] = useState<PhotographyPackage | null>(null)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [inquiryError, setInquiryError] = useState<string | null>(null)
  const [expandedInclusions, setExpandedInclusions] = useState<Record<string, boolean>>({})

  const handleOpenPackage = (pkgId: string) => {
    requireAuth('to view full photography package details and inquire', () => {
      setSelectedPackageId(pkgId)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

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
    const matchesCategory =
      selectedCategory === 'all' || pkg.category === selectedCategory
    const matchesSearch =
      searchQuery === '' ||
      pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.gear.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleInclusions = (pkgId: string) => {
    setExpandedInclusions((prev) => ({
      ...prev,
      [pkgId]: !prev[pkgId],
    }))
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
          className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-8 sm:py-14 scroll-mt-20"
        >
          {/* Filter Bar & Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border border-[#D8F0EC] text-[11px] font-bold text-[#C83B68] mb-1.5 shadow-2xs">
                <span>Curated Camera Crews</span>
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold text-[#7E1F3E] tracking-wide"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                Photography Packages
              </h2>
              <p className="text-xs sm:text-sm text-black/70 font-medium mt-1">
                Transparent pricing, high-end equipment specs, and instant deliverables for your celebration.
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
                  className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-full text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 shadow-2xs"
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

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 pb-2 border-b border-[#D8F0EC]">
            {[
              { id: 'all', label: 'All Packages', icon: SlidersHorizontal },
              { id: 'wedding', label: 'Wedding Photography', icon: Heart },
              { id: 'mobile', label: 'Mobile Photography', icon: Smartphone },
              { id: 'normal', label: 'Normal Photography', icon: CoolCameraIcon },
            ].map((tab) => {
              const isSelected = selectedCategory === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleCategoryFilter(tab.id as PhotographyCategory | 'all')}
                  className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all shadow-2xs active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] text-white shadow-xs'
                      : 'bg-white hover:bg-[#F0F9F8] text-[#5A172D] border border-[#D8F0EC]'
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

          {/* Packages Grid */}
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
                  const canEditPkg = Boolean(isAdmin || (isPhotoVendor && pkg.vendorId === profile?.id))
                  return (
                    <article
                      key={pkg.id}
                      className="group relative rounded-3xl overflow-hidden bg-white border border-[#D8F0EC] shadow-md flex flex-col max-w-4xl mx-auto"
                    >
                      {canEditPkg && (
                        <div className="absolute top-3 left-3 z-30 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleOpenEditModal(pkg); }}
                            title="Edit Package"
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-[#C83B68] shadow-md border border-[#D8F0EC] transition-transform active:scale-90"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete "${pkg.title}"?`)) { deletePackage(pkg.id); setSelectedPackageId(null); }
                            }}
                            title="Delete Package"
                            className="p-2 rounded-full bg-white/90 hover:bg-white text-red-600 shadow-md border border-[#D8F0EC] transition-transform active:scale-90"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <div className="relative aspect-[16/9] max-h-[380px] overflow-hidden bg-black/10">
                        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover object-center" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                        <div className={`absolute top-3 ${canEditPkg ? 'left-20' : 'left-3'} px-3 py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#D8F0EC] text-xs font-bold text-[#7E1F3E] shadow-2xs`}>
                          {pkg.categoryLabel}
                        </div>
                        <div className="absolute top-3 right-3 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#E05A85] to-[#C83B68] text-white text-xs font-black shadow-xs">
                          {pkg.price}
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 text-white flex items-center gap-4 text-xs font-medium pointer-events-none">
                          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-[#F3A2BE]" /><span>{pkg.duration}</span></span>
                          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-[#F3A2BE]" /><span>{pkg.teamSize}</span></span>
                        </div>
                      </div>
                      <div className="p-5 sm:p-7 space-y-5">
                        <div className="space-y-2">
                          <h3 className="text-xl sm:text-2xl font-bold text-[#5A172D] leading-tight" style={{ fontFamily: "'Cinzel', serif" }}>{pkg.title}</h3>
                          <p className="text-xs sm:text-sm text-black/75 font-medium leading-relaxed">{pkg.tagline}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[#F0F9F8] border border-[#D8F0EC] text-xs font-mono text-[#5A172D]">
                          <span className="font-bold text-[#C83B68] block text-[10px] leading-tight mb-0.5">CAMERA RIG</span>
                          <span>{pkg.gear}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                            <Video className="w-4 h-4 text-[#C83B68] shrink-0" />
                            <div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Reels</span><span className="text-black/60">{pkg.deliverables.reels}</span></div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-[#C83B68] shrink-0" />
                            <div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Photos</span><span className="text-black/60">{pkg.deliverables.photos}</span></div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#C83B68] shrink-0" />
                            <div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Film</span><span className="text-black/60">{pkg.deliverables.films}</span></div>
                          </div>
                          <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#C83B68] shrink-0" />
                            <div className="text-xs leading-tight"><span className="font-bold text-black/90 block">Delivery</span><span className="text-black/60">{pkg.deliverables.deliveryTime}</span></div>
                          </div>
                        </div>
                        <div>
                          <button type="button" onClick={() => toggleInclusions(pkg.id)} className="text-xs font-bold text-[#C83B68] hover:underline flex items-center gap-1 cursor-pointer">
                            <span>{isExpanded ? 'Hide Inclusions' : `View All Inclusions (${pkg.inclusions.length})`}</span>
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
                            onClick={() => requireAuth(`to view photographer details and inquire about "${pkg.title}"`, () => { setInquiryPackage(pkg); setInquirySuccess(false); })}
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
                const canEditPkg = Boolean(isAdmin || (isPhotoVendor && pkg.vendorId === profile?.id))
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


