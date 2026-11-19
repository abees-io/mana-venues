import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CateringCategory = 'sadya' | 'buffet' | 'live'

export interface CateringPackage {
  id: string
  title: string
  category: CateringCategory
  categoryLabel: string
  tagline: string
  price: string
  duration: string
  guestCount: string
  image: string
  kitchenSpec: string
  badge: string
  highlights: string[]
  inclusions: string[]
  deliverables: {
    courses: string
    liveStalls: string
    desserts: string
    serviceCrew: string
  }
}

export interface CateringHeroText {
  title: string
  subtitle: string
  description: string
}

export const DEFAULT_CATERING_PACKAGES: CateringPackage[] = [
  {
    id: 'catering-royal-sadya',
    title: 'Imperial 28-Course Royal Wedding Sadya',
    category: 'sadya',
    categoryLabel: 'Traditional Royal Sadya',
    tagline: 'Authentic heritage feast served on fresh green plantain leaves with 4 varieties of payasam',
    price: '₹420 / Plate',
    duration: 'Lunch Hours (11:30 AM - 3:30 PM)',
    guestCount: 'Min. 300 - 3,000+ Guests',
    image: '/catering-sadya.jpg',
    kitchenSpec: '100% Brass Urulis • Pure Ghee • Organic Spices • Cold Storage',
    badge: 'Heritage Kerala Wedding Feast',
    highlights: ['28 Authentic Curries', '4 Hot Payasams', 'Fresh Banana Leaves', 'Uniformed Servers'],
    inclusions: [
      '28 traditional curries including Avial, Olan, Thoran, Kalan, Pachadi, Injipuli, and Sharkara Varatti',
      'Matta rice and fragrant jeerakasala rice with homemade melted golden ghee & parippu',
      '4 artisanal hot payasams (Palada Pradhaman, Parippu Pradhaman, Ada, and Wheat Payasam)',
      'Fresh tender plantain leaves, earthen water carafes, and crisp papadams',
      'Trained traditional serving squad dressed in traditional Kerala kasavu attire',
    ],
    deliverables: {
      courses: '28 Gourmet Dishes',
      liveStalls: 'Hot Boli & Payasam Stall',
      desserts: '4 Artisanal Payasams',
      serviceCrew: '1 Server per 15 Guests',
    },
  },
  {
    id: 'catering-grand-buffet',
    title: 'Grand Royal Multi-Cuisine Banquet Buffet',
    category: 'buffet',
    categoryLabel: 'Grand Multi-Cuisine Buffet',
    tagline: 'Opulent spread featuring Royal Dum Biryani, Tandoori platters, Continental mains & salads',
    price: '₹750 / Plate',
    duration: 'Full Event Coverage (Dinner/Reception)',
    guestCount: 'Min. 200 - 2,500+ Guests',
    image: '/catering-buffet.jpg',
    kitchenSpec: 'Chafing Dishes • Live Tandoor • Master Chefs • Thermobox Transport',
    badge: 'Most Popular Reception Buffet',
    highlights: ['Hyderabadi Dum Biryani', 'Fresh Tandoor Naans', 'Gourmet Salad Bar', 'Live Pasta Station'],
    inclusions: [
      'Welcome refresher drinks: Tender Coconut Punch, Spiced Mint Mojito, and Mango Lassi',
      'Live Tandoori appetizer counters with Paneer Tikka, Malai Murgh, and crispy corn chaat',
      'Slow-cooked copper degchi Hyderabadi Dum Biryani with rich Mirchi Ka Salan and boondi raita',
      '6 Continental & North Indian gourmet curries with live butter naan and kulcha ovens',
      'Polished roll-top brass & stainless steel buffet setup with elegant floral runners',
    ],
    deliverables: {
      courses: '36+ Pan-Indian Dishes',
      liveStalls: 'Tandoor & Pasta Bar',
      desserts: 'Gourmet Sweet Symphony',
      serviceCrew: 'Full Captained Team',
    },
  },
  {
    id: 'catering-live-counters',
    title: 'Carnival Live Stalls & Street Food Fiesta',
    category: 'live',
    categoryLabel: 'Live Counters & Fiesta',
    tagline: 'High-energy live cooking stations: Delhi Chaat, Woodfired Pizzas, Dosa Bars & Mocktails',
    price: '₹580 / Plate',
    duration: 'High Tea & Evening Reception (4-6 Hours)',
    guestCount: 'Min. 150 - 1,500 Guests',
    image: '/catering-live.jpg',
    kitchenSpec: 'Stone Pizza Ovens • Tawa Stations • Nitro Mocktail Bar',
    badge: 'Trending Interactive Dining',
    highlights: ['Live Chaat Cart', 'Artisanal Dosa Bar', 'Flaming Mocktails', 'Waffle & Churro Cart'],
    inclusions: [
      'Delhi 6 Pani Puri and Dahi Bhalla street food cart with 5 flavored herbal waters',
      'Live Kerala & Chettinad Dosa station featuring 12 customized gourmet fillings',
      'Artisanal Italian wood-fired mini pizzas with live toppings and truffle garlic bread',
      'Theatrical Molecular Mocktail Bar with smoke, dry ice, and edible flower garnishes',
      'Live hot Belgian waffle station with Belgian chocolate fountains and fresh berries',
    ],
    deliverables: {
      courses: '8 Live Interactive Bars',
      liveStalls: 'Live Pizza, Chaat, Dosa',
      desserts: 'Fondue & Churro Wall',
      serviceCrew: 'Chef Station Masters',
    },
  },
  {
    id: 'catering-intimate-soiree',
    title: 'Intimate Gathering & High-Tea Delicacies',
    category: 'buffet',
    categoryLabel: 'Grand Multi-Cuisine Buffet',
    tagline: 'Refined menu designed for Haldi, Mehendi, engagement rituals and intimate family affairs',
    price: '₹380 / Plate',
    duration: 'Afternoon / Evening (3 Hours)',
    guestCount: 'Min. 50 - 250 Guests',
    image: '/category-catering.jpg',
    kitchenSpec: 'Fine Bone China • Earthen Urns • Organic Tea Bar',
    badge: 'Perfect for Haldi & Mehendi',
    highlights: ['Specialty Chai Bar', 'Artisanal Sandwiches', 'Hot Kerala Snacks', 'Customized Plating'],
    inclusions: [
      'Live Kulhad Chai and South Indian Filter Coffee counter with freshly roasted beans',
      'Crispy Pazham Pori, Unniyappam, and Paneer Samosas served piping hot',
      'Assorted mini club sandwiches, sliders, and gourmet mezze dip platters',
      'Light golden saffron pulao with creamy Dal Makhani and butter rotis',
      'Mini Gulab Jamun cups with rabdi dollops',
    ],
    deliverables: {
      courses: '18 Bite-sized Delicacies',
      liveStalls: 'Kulhad Chai & Snack Bar',
      desserts: 'Warm Rabdi Cups',
      serviceCrew: 'Attentive Host Staff',
    },
  },
]

interface CateringState {
  packages: CateringPackage[]
  selectedCategory: CateringCategory | 'all'
  heroTexts: CateringHeroText
  setSelectedCategory: (cat: CateringCategory | 'all') => void
  addPackage: (pkg: CateringPackage) => void
  updatePackage: (id: string, updates: Partial<CateringPackage>) => void
  deletePackage: (id: string) => void
  updateHeroTexts: (texts: Partial<CateringHeroText>) => void
}

export const useCateringStore = create<CateringState>()(
  persist(
    (set) => ({
      packages: DEFAULT_CATERING_PACKAGES,
      selectedCategory: 'all',
      heroTexts: {
        title: 'Catering & Royal Feasts',
        subtitle: 'Authentic Heritage Sadya, Multi-Cuisine Buffets & Live Counters',
        description:
          'From pure brass uruli banana-leaf Sadya banquets to theatrical live street food counters, we deliver unmatched culinary delight with Michelin-grade hygiene and gracious hospitality.',
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
      name: 'mana_catering_store_v1',
    }
  )
)
