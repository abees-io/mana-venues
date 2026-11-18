import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type PhotographyCategory = 'wedding' | 'mobile' | 'normal'

export interface PhotographyPackage {
  id: string
  title: string
  category: PhotographyCategory
  categoryLabel: string
  tagline: string
  price: string
  duration: string
  teamSize: string
  image: string
  gear: string
  badge: string
  highlights: string[]
  inclusions: string[]
  deliverables: {
    reels: string
    photos: string
    films: string
    deliveryTime: string
  }
}

export const DEFAULT_PHOTOGRAPHY_PACKAGES: PhotographyPackage[] = [
  // 1. Wedding Photography
  {
    id: 'wedding-royal-mandap',
    title: 'Grand Royal Wedding & Reception',
    category: 'wedding',
    categoryLabel: 'Wedding Photography',
    tagline: 'Multi-day luxury celebration, sacred Muhurtham ceremonies & 4K cinematic films',
    price: '₹1,45,000',
    duration: '3 Days (Haldi, Muhurtham & Reception)',
    teamSize: '4-Crew Master Team + Drone Pilot',
    image: '/photo-wedding.jpg',
    gear: 'Sony FX3 Cinema • DJI Drone • 70-200mm GM • 10-bit S-Log3',
    badge: 'Most Popular Grand Wedding',
    highlights: ['4K Drone Flight', 'Italian Leather Album', '25-Min Cinema Film', 'Traditional Rituals'],
    inclusions: [
      'Comprehensive coverage of Haldi, Mehendi, Sangeet, Wedding Muhurtham & Grand Reception',
      '4-member dedicated crew (2 Traditional Photographers + 1 Candid Specialist + 1 Cinematographer)',
      'Licensed aerial drone pilot for grand mandap arrivals and venue establishing shots',
      'Handcrafted Italian leather-bound flush-mount luxury photo album (40 sheets / 80 pages)',
      'Cinematic 20-25 minute full wedding film + 3-minute viral teaser trailer in 4K UHD',
      'Complete raw footage backup on an external hard drive',
    ],
    deliverables: {
      reels: '8 Trending Wedding Reels',
      photos: '1,200+ Master Photos',
      films: '25 Min 4K Film + Teaser',
      deliveryTime: '21 Days Delivery',
    },
  },
  {
    id: 'wedding-classic-muhurtham',
    title: 'Classic Muhurtham & Reception Saga',
    category: 'wedding',
    categoryLabel: 'Wedding Photography',
    tagline: 'Timeless traditional ceremony coverage, emotional family portraits & rituals',
    price: '₹85,000',
    duration: '2 Days (Ceremony & Reception)',
    teamSize: '3 Photographers + Cinematographer',
    image: '/photo-wedding.jpg',
    gear: 'Sony A7 IV • Canon R6 • Prime Optics • Wireless Audio Rigs',
    badge: 'Ceremony Classic',
    highlights: ['Traditional Posed & Candid', 'Flush Mount Album', '15-Min Highlight', 'Dual Rigs'],
    inclusions: [
      'Full coverage of wedding day rituals, thali-kettu, and grand stage reception',
      'Lead candid specialist focusing on genuine bride & groom emotional expressions',
      'Dedicated stage photographer for family group portraits and guest greetings',
      'Custom embossed 50-page wedding photo album with velvet presentation box',
      '15-minute highlight wedding film + 1-minute Instagram teaser in 4K',
    ],
    deliverables: {
      reels: '4 Wedding Reels',
      photos: '700+ Edited Photos',
      films: '15-Min Wedding Film',
      deliveryTime: '15 Days Delivery',
    },
  },

  // 2. Mobile Photography
  {
    id: 'mobile-creator-bts',
    title: 'Mobile Wedding Content Creator',
    category: 'mobile',
    categoryLabel: 'Mobile Photography',
    tagline: 'Instant 4K vertical reels, unfiltered BTS moments & same-day story deliveries',
    price: '₹28,000',
    duration: 'Full Day (10 Hours)',
    teamSize: '1 Dedicated Creator',
    image: '/photo-mobile.jpg',
    gear: 'iPhone 16 Pro Max • DJI Osmo Mobile • Wireless Lav Mics',
    badge: 'Trending Social-First',
    highlights: ['Instant Airdrop', '15+ Viral Reels', 'Live Story Takeover', 'Raw Clip Drive'],
    inclusions: [
      'Dedicated on-site phone content creator alongside the bride & groom all day',
      '15+ high-energy edited vertical reels formatted with trending audio',
      'Continuous Instagram Story & WhatsApp status uploads throughout the events',
      'All unedited raw photos & 4K video clips transferred within 6 hours',
      'Bespoke digital styling & candid guest interview reels',
    ],
    deliverables: {
      reels: '15+ Edited Reels',
      photos: '250+ Candid Shots',
      films: '2 Min Highlight Reel',
      deliveryTime: 'Within 6 Hours',
    },
  },
  {
    id: 'mobile-viral-story-pack',
    title: 'Social Viral Bride & Groom Crew',
    category: 'mobile',
    categoryLabel: 'Mobile Photography',
    tagline: 'High-energy TikTok & Instagram ready reels, transitions & instant guest memories',
    price: '₹36,000',
    duration: '2 Days Coverage',
    teamSize: '2 Mobile Content Creators',
    image: '/photo-mobile.jpg',
    gear: 'Dual iPhone Pro Max • DJI Osmo Pocket 3 • Wireless Rode Mics',
    badge: 'Social Media Takeover',
    highlights: ['25+ Trending Reels', 'Live Broadcast Support', 'Guest Video Messages', 'Zero Delay'],
    inclusions: [
      'Two mobile creators: one accompanying bride party, one accompanying groom party',
      '25+ creative transition reels matching current Instagram sound trends',
      'Guest confession booth & heartfelt video messages compiled in vertical 4K',
      'Daily morning recap stories ready before breakfast for friends & family',
      'All original 4K 60fps ProRes clips transferred instantly via AirDrop / Google Drive',
    ],
    deliverables: {
      reels: '25+ Viral Reels',
      photos: '400+ Phone Candids',
      films: '5-Min Reel Documentary',
      deliveryTime: 'Same Night Delivery',
    },
  },

  // 3. Normal Photography
  {
    id: 'normal-traditional-stage',
    title: 'Normal Stage & Traditional Photography',
    category: 'normal',
    categoryLabel: 'Normal Photography',
    tagline: 'Standard event coverage, crisp family stage greetings & keepsake photo albums',
    price: '₹35,000',
    duration: 'Full Day Event Coverage',
    teamSize: '2 Photographers',
    image: '/photo-normal.jpg',
    gear: 'Full-Frame DSLRs • Portable Strobe Lighting • 24-105mm Lenses',
    badge: 'Standard & Reliable',
    highlights: ['Full Stage Coverage', '300+ Standard Photos', 'Hardcover Album', 'High-Res USB'],
    inclusions: [
      'Comprehensive traditional stage coverage for all guest arrivals and blessing photos',
      'Two professional event photographers with balanced flash lighting setups',
      '300+ color-corrected, print-ready high-resolution photographs',
      'Hardcover wedding album with 30 matte-finish sheets (60 pages)',
      'Full digital gallery delivered on high-speed USB flash drive',
    ],
    deliverables: {
      reels: '2 Recap Mini-Reels',
      photos: '300+ Print-Ready Photos',
      films: 'Standard Event Highlight',
      deliveryTime: '10 Days Delivery',
    },
  },
  {
    id: 'normal-portrait-couple',
    title: 'Normal Couple & Family Portraiture',
    category: 'normal',
    categoryLabel: 'Normal Photography',
    tagline: 'Clean, timeless portraits for family keepsakes, invitations & wedding stages',
    price: '₹24,000',
    duration: 'Half Day (5 Hours)',
    teamSize: '1 Lead Photographer + Assistant',
    image: '/photo-normal.jpg',
    gear: 'High-Res Camera • Softbox Portrait Arrays • 50mm & 85mm Lenses',
    badge: 'Classic Portraiture',
    highlights: ['Posed Family Portraits', '150+ Retouched Shots', 'Framed Canvas', 'Quick Turnaround'],
    inclusions: [
      'Dedicated couple portrait session at the venue or studio setup',
      'Family heirloom group photography with uniform lighting',
      '150+ retouched high-resolution images ready for framing and sharing',
      'One 16x24 inch wooden-framed premium photo print for living room display',
      'Secure cloud link with high-speed download for all guests',
    ],
    deliverables: {
      reels: '1 Portrait Reel',
      photos: '150+ Retouched Photos',
      films: 'Photo Slideshow Video',
      deliveryTime: '7 Days Delivery',
    },
  },
]

interface PhotographyState {
  packages: PhotographyPackage[]
  selectedCategory: PhotographyCategory | 'all'
  setSelectedCategory: (cat: PhotographyCategory | 'all') => void
  addPackage: (pkg: PhotographyPackage) => void
  updatePackage: (id: string, updates: Partial<PhotographyPackage>) => void
  deletePackage: (id: string) => void
}

export const usePhotographyStore = create<PhotographyState>()(
  persist(
    (set) => ({
      packages: DEFAULT_PHOTOGRAPHY_PACKAGES,
      selectedCategory: 'all',
      setSelectedCategory: (cat) => set({ selectedCategory: cat }),
      addPackage: (pkg) =>
        set((state) => ({ packages: [pkg, ...state.packages] })),
      updatePackage: (id, updates) =>
        set((state) => ({
          packages: state.packages.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deletePackage: (id) =>
        set((state) => ({
          packages: state.packages.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'mana_photography_store_v3',
    }
  )
)
