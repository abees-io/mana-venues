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
} from 'lucide-react'
import CoolCameraIcon from '../components/common/CoolCameraIcon'
import Layout from '../components/layout/Layout'
import PhotographyMotionHero from '../components/photography/PhotographyMotionHero'
import {
  usePhotographyStore,
  type PhotographyCategory,
  type PhotographyPackage,
} from '../store/photographyStore'

export default function PhotographyPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const packagesListRef = useRef<HTMLDivElement>(null)

  const packages = usePhotographyStore((s) => s.packages)
  const selectedCategory = usePhotographyStore((s) => s.selectedCategory)
  const setSelectedCategory = usePhotographyStore((s) => s.setSelectedCategory)

  const [searchQuery, setSearchQuery] = useState('')
  const [inquiryPackage, setInquiryPackage] = useState<PhotographyPackage | null>(null)
  const [inquirySuccess, setInquirySuccess] = useState(false)
  const [expandedInclusions, setExpandedInclusions] = useState<Record<string, boolean>>({})

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
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Please provide your name and contact phone number.')
      return
    }
    setFormSubmitting(true)
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

            {/* Search Input */}
            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search packages, gear, reels..."
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white border border-[#D8F0EC] rounded-full text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 shadow-2xs"
              />
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
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
              {filteredPackages.map((pkg) => {
                const isExpanded = Boolean(expandedInclusions[pkg.id])
                return (
                  <article
                    key={pkg.id}
                    className="group rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-[#D8F0EC] shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col will-change-transform"
                  >
                    {/* Package Cover Image */}
                    <div className="relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden bg-black/10">
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                      {/* Category Badge Top Left */}
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/95 backdrop-blur-md border border-[#D8F0EC] text-[8.5px] sm:text-[10px] font-bold text-[#7E1F3E] shadow-2xs">
                        <span className="sm:hidden capitalize">{pkg.category}</span>
                        <span className="hidden sm:inline">{pkg.categoryLabel}</span>
                      </div>

                      {/* Price Badge Top Right */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 px-2 sm:px-3.5 py-0.5 sm:py-1 rounded-full bg-gradient-to-r from-[#E05A85] to-[#C83B68] text-white text-[10px] sm:text-xs font-black shadow-xs">
                        <span>{pkg.price}</span>
                      </div>

                      {/* Bottom Info on Image (Desktop) */}
                      <div className="hidden sm:block absolute bottom-3 left-3 right-3 text-white space-y-1 pointer-events-none">
                        <div className="flex items-center gap-3 text-[11px] text-[#F0F9F8] font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#F3A2BE]" />
                            <span>{pkg.duration}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#F3A2BE]" />
                            <span>{pkg.teamSize}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-2.5 sm:p-5 lg:p-6 flex-1 flex flex-col justify-between space-y-2.5 sm:space-y-4">
                      <div className="space-y-2 sm:space-y-2.5">
                        <h3
                          className="text-xs sm:text-lg lg:text-xl font-bold text-[#5A172D] leading-tight line-clamp-2 group-hover:text-[#C83B68] transition-colors"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          {pkg.title}
                        </h3>

                        <p className="text-[10px] sm:text-xs text-black/75 font-medium leading-tight sm:leading-relaxed line-clamp-2">
                          {pkg.tagline}
                        </p>

                        {/* Mobile Duration & Crew Mini Row */}
                        <div className="flex sm:hidden items-center gap-2 text-[9px] text-[#C83B68] font-semibold">
                          <span className="flex items-center gap-1 truncate">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            <span>{pkg.duration.split('(')[0].trim()}</span>
                          </span>
                          <span className="text-[#D8F0EC]">â€¢</span>
                          <span className="flex items-center gap-1 truncate">
                            <Users className="w-2.5 h-2.5 shrink-0" />
                            <span>{pkg.teamSize.split('+')[0].trim()}</span>
                          </span>
                        </div>

                        {/* Camera Gear Spec */}
                        <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-[#F0F9F8] border border-[#D8F0EC] text-[9px] sm:text-[11px] font-mono text-[#5A172D]">
                          <span className="font-bold text-[#C83B68] block text-[8px] sm:text-[10px] leading-tight mb-0.5">CAMERA RIG</span>
                          <span className="truncate block leading-tight">{pkg.gear}</span>
                        </div>

                        {/* Deliverables Matrix */}
                        <div className="grid grid-cols-2 gap-1 sm:gap-2 pt-0.5 sm:pt-1">
                          <div className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-1 sm:gap-2">
                            <Video className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#C83B68] shrink-0" />
                            <div className="text-[8px] sm:text-[10px] leading-tight">
                              <span className="font-bold text-black/90 block leading-tight">Reels</span>
                              <span className="text-black/60 truncate block leading-tight">{pkg.deliverables.reels}</span>
                            </div>
                          </div>

                          <div className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-1 sm:gap-2">
                            <ImageIcon className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#C83B68] shrink-0" />
                            <div className="text-[8px] sm:text-[10px] leading-tight">
                              <span className="font-bold text-black/90 block leading-tight">Photos</span>
                              <span className="text-black/60 truncate block leading-tight">{pkg.deliverables.photos}</span>
                            </div>
                          </div>

                          <div className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-1 sm:gap-2">
                            <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#C83B68] shrink-0" />
                            <div className="text-[8px] sm:text-[10px] leading-tight">
                              <span className="font-bold text-black/90 block leading-tight">Film</span>
                              <span className="text-black/60 truncate block leading-tight">{pkg.deliverables.films}</span>
                            </div>
                          </div>

                          <div className="p-1 sm:p-2 rounded-md sm:rounded-lg bg-gray-50 border border-gray-100 flex items-center gap-1 sm:gap-2">
                            <Clock className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#C83B68] shrink-0" />
                            <div className="text-[8px] sm:text-[10px] leading-tight">
                              <span className="font-bold text-black/90 block leading-tight">Delivery</span>
                              <span className="text-black/60 truncate block leading-tight">{pkg.deliverables.deliveryTime}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Inclusions Accordion */}
                        <div className="pt-1 sm:pt-2">
                          <button
                            type="button"
                            onClick={() => toggleInclusions(pkg.id)}
                            className="text-[9px] sm:text-xs font-bold text-[#C83B68] hover:underline flex items-center gap-1"
                          >
                            <span className="sm:hidden">{isExpanded ? 'Hide Inclusions' : 'Inclusions (5+)'}</span>
                            <span className="hidden sm:inline">{isExpanded ? 'Hide All Inclusions' : 'View Full Inclusions (5+)'}</span>
                            <span className="text-[8px] sm:text-[10px]">{isExpanded ? 'â–²' : 'â–¼'}</span>
                          </button>

                          {isExpanded && (
                            <ul className="mt-1.5 space-y-1 sm:space-y-1.5 pl-0.5 border-t border-[#D8F0EC] pt-1.5 text-[8.5px] sm:text-xs text-black/80">
                              {pkg.inclusions.map((inc, iIdx) => (
                                <li key={iIdx} className="flex items-start gap-1 sm:gap-1.5">
                                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#C83B68] shrink-0 mt-0.5" />
                                  <span className="leading-tight">{inc}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2 sm:pt-3 border-t border-[#D8F0EC] flex items-center gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInquiryPackage(pkg)
                            setInquirySuccess(false)
                          }}
                          className="flex-1 inline-flex items-center justify-center gap-1 py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-xl sm:rounded-full bg-gradient-to-r from-[#C83B68] via-[#E05A85] to-[#C83B68] hover:brightness-105 text-white font-extrabold text-[10px] sm:text-xs md:text-sm shadow-sm active:scale-95 transition-all"
                        >
                          <Send className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                          <span className="sm:hidden">Inquire</span>
                          <span className="hidden sm:inline">Inquire Package</span>
                        </button>
                      </div>
                    </div>
                  </article>
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
                      Starting from {inquiryPackage.price} â€¢ {inquiryPackage.duration}
                    </p>
                  </div>

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
    </Layout>
  )
}

