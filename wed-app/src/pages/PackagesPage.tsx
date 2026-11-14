import { useState, useId } from 'react'
import Layout from '../components/layout/Layout'
import {
  Sparkles,
  MapPin,
  Users,
  CheckCircle2,
  Calendar,
  Send,
  X,
  Search,
  Phone,
  Mail,
  User,
  AlertCircle,
  RefreshCw,
  Package,
} from 'lucide-react'

export interface WeddingPackage {
  id: string
  title: string
  tagline: string
  backdrop: 'Backwaters' | 'Coast' | 'Hills' | 'Heritage'
  location: string
  startingPrice: string
  guestCapacity: string
  image: string
  description: string
  inclusions: string[]
  partnerPlanner: string
  verified: boolean
}

export const WEDDING_PACKAGES: WeddingPackage[] = [
  {
    id: 'alleppey-serenade',
    title: 'Alleppey Backwater Serenade',
    tagline: 'Houseboat reception, emerald waterways & swaying palms',
    backdrop: 'Backwaters',
    location: 'Vembanad Lake, Alleppey & Kumarakom',
    startingPrice: '₹8,50,000',
    guestCapacity: '150 - 350 Guests',
    image: '/dest-wedding-2.jpg',
    description:
      'Immerse your wedding party in the serene calm of Kerala’s backwaters. Featuring a sunset lakefront mandap, decorated luxury ketuvallam houseboats for the baraat/bridal entry, and traditional banana-leaf feasts with live instrumental fusion.',
    inclusions: [
      'Lakefront venue & luxury houseboats access',
      'Artisanal water-lily & jasmine floral mandap',
      'Grand Kerala Sadya & coastal fusion banquets',
      'Chenda Melam & classical Mohiniyattam welcome',
      'Dedicated guest transport & backwater shikaras',
      'Full event coordination & ritual support',
    ],
    partnerPlanner: 'Heritage Palms Events (Verified)',
    verified: true,
  },
  {
    id: 'kovalam-sunset',
    title: 'Kovalam Beachside Vows & Romance',
    tagline: 'Golden sands, Arabian sea horizon & cliffside panoramas',
    backdrop: 'Coast',
    location: 'Kovalam & Marari Coastline',
    startingPrice: '₹12,00,000',
    guestCapacity: '200 - 600 Guests',
    image: '/dest-wedding-3.jpg',
    description:
      'Say "I do" as the sun dips into the Arabian Sea. A bespoke beachfront affair complete with ivory silk canopies, imported coastal blooms, live acoustic music, and curated seafood delicacies beneath illuminated coconut palms.',
    inclusions: [
      'Private beach sanctuary venue reservation',
      'Coastal driftwood & blush-rose pavilion canopy',
      'Seafood grill, continental & Kerala buffet stations',
      'Sunset acoustic ensemble & firework finale',
      'Drone cinematography & candid photo crew',
      'On-site hospitality team & concierge desk',
    ],
    partnerPlanner: 'Coastline Luxe Weddings (Verified)',
    verified: true,
  },
  {
    id: 'wayanad-mist',
    title: 'Munnar & Wayanad Misty Estate',
    tagline: 'High-altitude tea gardens, cool mountain breeze & stone chalets',
    backdrop: 'Hills',
    location: 'Vythiri, Wayanad & Munnar Heights',
    startingPrice: '₹9,80,000',
    guestCapacity: '100 - 300 Guests',
    image: '/dest-wedding-1.jpg',
    description:
      'A fairytale highland retreat set amid undulating tea plantations and eucalyptus mist. Perfect for couples seeking an intimate, cool-climate royal celebration surrounded by Western Ghats biodiversity.',
    inclusions: [
      'Estate bungalow & mountain lawn amphitheater',
      'Wildflower, eucalyptus & brass lamp floral design',
      'Warm spice-infused banquet & plantation barbecue',
      'Evening amphitheater bonfire & live acoustic ghazals',
      'Guest estate shuttle & cottage lodging support',
      'Traditional Nadaswaram & Panchavadyam artists',
    ],
    partnerPlanner: 'Highland Blooms Studio (Verified)',
    verified: true,
  },
  {
    id: 'kochi-royal',
    title: 'Fort Kochi Royal Nalukettu Heritage',
    tagline: 'Colonial opulence, antique carved wood & temple courtyards',
    backdrop: 'Heritage',
    location: 'Fort Kochi & Mattancherry Heritage Quarter',
    startingPrice: '₹14,50,000',
    guestCapacity: '300 - 1,200 Guests',
    image: '/dest-wedding-1.jpg',
    description:
      'Honor Kerala’s royal legacy inside restored ancestral courtyards. Hand-carved teakwood pillars, thousands of traditional brass oil lamps (Agal Vilakku), and a ceremonial royal procession fit for royalty.',
    inclusions: [
      'Heritage Nalukettu palace courtyard booking',
      '1,000 brass oil lamp illumination decor',
      'Traditional 28-dish royal Sadya dining service',
      'Kathakali dancers & royal trumpet fanfare',
      'Bespoke bridal styling suite & guest lounge',
      'VIP protocol security & concierge staff',
    ],
    partnerPlanner: 'Royal Travancore Curators (Verified)',
    verified: true,
  },
]

export default function PackagesPage() {
  const [selectedBackdrop, setSelectedBackdrop] = useState<string>('All')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const [inquiryPackage, setInquiryPackage] = useState<WeddingPackage | null>(null)
  const [inquirySuccess, setInquirySuccess] = useState<boolean>(false)

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
    setFormSubmitting(true)
    // Simulate inquiry submission
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
  const filteredPackages = WEDDING_PACKAGES.filter((pkg) => {
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
      {/* Top Hero Banner */}
      <section className="relative overflow-hidden bg-brand-dark py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-green-900/40">
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-brand-secondary/30 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-emerald-600/20 blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-brand-secondary/50 text-xs font-semibold text-brand-secondary">
            <Sparkles className="w-3.5 h-3.5" />
            <span>God’s Own Country Destination Weddings</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide leading-tight bg-[linear-gradient(135deg,#FFAE00_0%,#F9E866_100%)] bg-clip-text text-transparent drop-shadow-md"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            Bespoke Destination Wedding Packages
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 font-medium max-w-3xl leading-relaxed">
            Your celebration deserves the warmth and safety of home. Explore verified venues and
            bespoke destination wedding packages across God's Own Country, thoughtfully designed to
            honor Kerala’s rich cultural tapestry while keeping you in expert, caring hands.
          </p>

          {/* Quick Filter & Search Bar */}
          <div className="pt-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
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
      </section>

      {/* Main Packages Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
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

        {/* Package Cards Grid */}
        {!isLoading && !hasError && filteredPackages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredPackages.map((pkg) => (
              <article
                key={pkg.id}
                className="group rounded-2xl overflow-hidden bg-brand-dark/85 backdrop-blur-md border border-green-800/50 shadow-xl hover:border-brand-secondary/60 hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Photo & Badge */}
                <div className="relative aspect-[16/10] sm:aspect-video w-full overflow-hidden bg-brand-dark">
                  <img
                    src={pkg.image}
                    alt={pkg.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/20 to-transparent" />

                  {/* Backdrop Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-dark/90 backdrop-blur-md border border-brand-secondary/60 text-xs font-semibold text-brand-secondary shadow-md">
                    <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>{pkg.backdrop} Experience</span>
                  </div>

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

                {/* Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                      <MapPin className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
                      <span>{pkg.location}</span>
                      <span className="text-emerald-700">•</span>
                      <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{pkg.guestCapacity}</span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-brand-secondary transition-colors leading-snug">
                      {pkg.title}
                    </h2>

                    <p className="text-xs sm:text-sm text-gray-300/90 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Curated Inclusions */}
                  <div className="space-y-2 pt-2 border-t border-emerald-900/60">
                    <p className="text-xs font-bold uppercase tracking-wider text-brand-secondary">
                      Bespoke Inclusions
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-100/90">
                      {pkg.inclusions.map((inc, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-secondary shrink-0 mt-0.5" />
                          <span>{inc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Footer & Action Button */}
                  <div className="pt-3 border-t border-emerald-900/60 flex items-center justify-between gap-4">
                    <div className="text-[11px] text-emerald-400/80">
                      <span>Curated by </span>
                      <strong className="text-emerald-200">{pkg.partnerPlanner}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInquireClick(pkg)}
                      className="px-5 py-2.5 rounded-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center gap-1.5 shrink-0"
                    >
                      <span>Inquire Package</span>
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
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
                    className="px-6 py-2.5 rounded-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {formSubmitting ? 'Sending Request...' : 'Submit Inquiry'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
