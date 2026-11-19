import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MakeupCategory = 'hd_bridal' | 'airbrush' | 'party'

export interface MakeupPackage {
  id: string
  title: string
  category: MakeupCategory
  categoryLabel: string
  tagline: string
  price: string
  duration: string
  teamSize: string
  image: string
  brandKit: string
  badge: string
  highlights: string[]
  inclusions: string[]
  deliverables: {
    trials: string
    touchups: string
    draping: string
    hairstyling: string
  }
}

export interface MakeupHeroText {
  title: string
  subtitle: string
  description: string
}

export const DEFAULT_MAKEUP_PACKAGES: MakeupPackage[] = [
  {
    id: 'makeup-royal-muhurtham',
    title: 'Royal Muhurtham HD Bridal Signature',
    category: 'hd_bridal',
    categoryLabel: 'HD Bridal Makeup',
    tagline: 'Timeless traditional glow with 18-hour sweat-proof HD makeup and bridal saree draping',
    price: '₹28,000',
    duration: '4-5 Hours (Pre-Muhurtham Call)',
    teamSize: 'Senior Lead Artist + Hair Stylist',
    image: '/makeup-bridal.jpg',
    brandKit: 'Charlotte Tilbury • MAC Pro • Huda Beauty • Dior Backstage',
    badge: 'Most Popular for Muhurtham',
    highlights: ['18h Waterproof HD', 'Temple Jewelry Setting', 'Silk Saree Draping', 'Hydration Prep'],
    inclusions: [
      'Comprehensive pre-bridal luxury skin prep & 24K gold serum hydration',
      'High-Definition waterproof makeup with custom lash extensions & cut-crease eye art',
      'Traditional South Indian bridal hairstyle with fresh floral jasmine veni placement',
      'Professional Kanchipuram silk saree pre-pleating, iron press & pin-tight drape',
      'Touchup mini-kit for touchups during the ceremony',
    ],
    deliverables: {
      trials: '1 Paid Look Trial',
      touchups: '3 Ceremony Touch-ups',
      draping: 'Saree & Dupatta Drape',
      hairstyling: 'Elaborate Floral Braid',
    },
  },
  {
    id: 'makeup-celebrity-airbrush',
    title: 'Celebrity Airbrush Reception Glamour',
    category: 'airbrush',
    categoryLabel: 'Airbrush Glam',
    tagline: 'Silicone-based micro-fine mist airbrush for a poreless, camera-ready red carpet finish',
    price: '₹38,000',
    duration: '4 Hours (Evening Reception)',
    teamSize: 'Celebrity Master Artist + 2 Assistants',
    image: '/makeup-airbrush.jpg',
    brandKit: 'TEMPTU Pro Airbrush • Estée Lauder • Natasha Denona • Hourglass',
    badge: 'Luxury 24H Poreless Finish',
    highlights: ['Micro-Mist Airbrush', 'No-Crease Longwear', 'Hollywood Waves', 'Chest & Back Glow'],
    inclusions: [
      'Full TEMPTU 2.0 airbrush silicone base application with flawless contour sculpting',
      'Body shimmer and luminous collarbone/back highlight application for evening gowns',
      'Hollywood glam waves, textured bun or sleek bridal updo with imported Swarovski clips',
      'Dramatic 3D mink eyelashes and custom waterproof lip shade layering',
      'Pre-wedding bespoke skin tone consultation & shade formulation',
    ],
    deliverables: {
      trials: 'Complimentary Mini Trial',
      touchups: 'Full Evening Presence',
      draping: 'Lehenga / Gown Fitting',
      hairstyling: 'Hollywood Glam Curls',
    },
  },
  {
    id: 'makeup-sangeet-haldi-party',
    title: 'Sangeet & Haldi Dewy Party Glow',
    category: 'party',
    categoryLabel: 'Pre-Wedding & Sangeet',
    tagline: 'Vibrant, lightweight dewy glow with colorful graphic accents and playful party hair',
    price: '₹18,000',
    duration: '2.5 Hours',
    teamSize: 'Lead Artist + Hair Specialist',
    image: '/makeup-party.jpg',
    brandKit: 'Fenty Beauty • Rare Beauty • Too Faced • NARS Orgasm',
    badge: 'Trending Fresh & Dewy',
    highlights: ['Glass-Skin Dewy', 'Floral Haldi Hair', 'Bold Party Liner', 'All-Day Dance Proof'],
    inclusions: [
      'Weightless glass-skin serum foundation with natural flushed rosy cheeks',
      'Smudge-proof festival eyeliner and glitter eye sparkle accents for high-energy dancing',
      'Boho messy braid with baby’s breath flowers or textured half-up half-down styling',
      'Crop-top lehenga / sharara dupatta draping with movement-proof safety pins',
      'Complimentary mini lip lacquer touchup wand',
    ],
    deliverables: {
      trials: 'Digital Color Palette Consultation',
      touchups: '1 Quick Refresh',
      draping: 'Dupatta & Skirt Pinning',
      hairstyling: 'Boho Floral Fishtail',
    },
  },
  {
    id: 'makeup-traditional-classic',
    title: 'Classic Muhurtham Elegance Package',
    category: 'hd_bridal',
    categoryLabel: 'HD Bridal Makeup',
    tagline: 'Subtle, radiant traditional bridal beauty highlighting your natural features',
    price: '₹22,000',
    duration: '3.5 Hours',
    teamSize: 'Lead Artist + Hair Stylist',
    image: '/category-makeup.jpg',
    brandKit: 'MAC Studio Fix • Smashbox • Urban Decay • Anastasia BH',
    badge: 'Classic Heritage',
    highlights: ['Natural Radiance', 'Traditional Braid', 'Comfortable Wear', 'Premium Lashes'],
    inclusions: [
      'Silky matte natural finish base with tear-proof eye makeup',
      'Traditional jasmine veni and hair accessories arrangement',
      'Silk saree pleating and secure pin drape',
      'Complementary bindi art styling',
    ],
    deliverables: {
      trials: 'Add-on on request',
      touchups: 'Ceremony Refresh',
      draping: 'Saree Drape',
      hairstyling: 'Classic South Indian Braid',
    },
  },
]

interface MakeupState {
  packages: MakeupPackage[]
  selectedCategory: MakeupCategory | 'all'
  heroTexts: MakeupHeroText
  setSelectedCategory: (cat: MakeupCategory | 'all') => void
  addPackage: (pkg: MakeupPackage) => void
  updatePackage: (id: string, updates: Partial<MakeupPackage>) => void
  deletePackage: (id: string) => void
  updateHeroTexts: (texts: Partial<MakeupHeroText>) => void
}

export const useMakeupStore = create<MakeupState>()(
  persist(
    (set) => ({
      packages: DEFAULT_MAKEUP_PACKAGES,
      selectedCategory: 'all',
      heroTexts: {
        title: 'Bridal & Makeup Artistry',
        subtitle: 'Bespoke Haute Glamour & Sacred Muhurtham Radiance',
        description:
          'From camera-ready 24-hour Airbrush finishes to soulful traditional Muhurtham saree styling, our master beauty artists illuminate your once-in-a-lifetime radiance.',
      },
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
      updateHeroTexts: (texts) =>
        set((state) => ({
          heroTexts: { ...state.heroTexts, ...texts },
        })),
    }),
    {
      name: 'mana_makeup_store_v1',
    }
  )
)
