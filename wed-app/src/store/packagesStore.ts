import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export type ReelAspectRatio = '9:16' | '16:9'
export type ReelSize = 'sm' | 'md' | 'lg' | 'full'
export type ReelTextPosition = 'top' | 'center' | 'bottom'
export type ReelTextAlign = 'left' | 'center' | 'right'
export type PackageTextGroup = 'header' | 'inclusions' | 'footer'

export interface PackageReel {
  id: string
  title: string
  location: string
  videoUrl: string // 'dummy-5s' for built-in 5s animated dummy reel, or MP4/WebM URL
  posterUrl?: string
  aspectRatio: ReelAspectRatio
  size: ReelSize
  textPosition?: ReelTextPosition
  textAlign?: ReelTextAlign
  textPos?: { x: number; y: number } // Free cursor-dragged position in % (0-100)
}

export interface WeddingPackage {
  id: string
  title: string
  tagline: string
  backdrop: 'Backwaters' | 'Coast' | 'Hills' | 'Heritage'
  location: string
  startingPrice: string
  guestCapacity: string
  image: string
  images?: string[]
  description: string
  inclusions: string[]
  partnerPlanner: string
  verified: boolean
  reels: PackageReel[]
  textOrder?: PackageTextGroup[]
  textOffsets?: Partial<Record<PackageTextGroup, { x: number; y: number }>>
  reverseDesktopLayout?: boolean
  instagramUrl?: string
  whatsappNumber?: string
  vendorId?: string
}

export const DEFAULT_PACKAGES: WeddingPackage[] = [
  {
    id: 'alleppey-serenade',
    title: 'Alleppey Backwater Serenade',
    tagline: 'Houseboat reception, emerald waterways & swaying palms',
    backdrop: 'Backwaters',
    location: 'Vembanad Lake, Alleppey & Kumarakom',
    startingPrice: 'Price on Demand',
    guestCapacity: '150 - 350 Guests',
    image: '/dest-wedding-2.jpg',
    images: ['/dest-wedding-2.jpg', '/dest-wedding-1.jpg'],
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
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012345',
    reels: [
      {
        id: 'reel-alleppey-1',
        title: 'Houseboat Baraat & Sunset Mandap',
        location: 'Vembanad Lake, Alleppey',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-2.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
      {
        id: 'reel-alleppey-2',
        title: 'Backwater Candlelit Reception',
        location: 'Kumarakom Lagoon',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-1.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
      {
        id: 'reel-alleppey-3',
        title: 'Shikara Bridal Entry & Sadya',
        location: 'Punnamada Lake, Alleppey',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-3.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
  {
    id: 'kovalam-sunset',
    title: 'Kovalam Beachside Vows & Romance',
    tagline: 'Golden sands, Arabian sea horizon & cliffside panoramas',
    backdrop: 'Coast',
    location: 'Kovalam & Marari Coastline',
    startingPrice: 'Price on Demand',
    guestCapacity: '200 - 600 Guests',
    image: '/dest-wedding-3.jpg',
    images: ['/dest-wedding-3.jpg', '/dest-wedding-2.jpg'],
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
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012346',
    reels: [
      {
        id: 'reel-kovalam-1',
        title: 'Arabian Sea Shoreline Vows',
        location: 'Kovalam Beach',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-3.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
  {
    id: 'wayanad-mist',
    title: 'Munnar & Wayanad Misty Estate',
    tagline: 'High-altitude tea gardens, cool mountain breeze & stone chalets',
    backdrop: 'Hills',
    location: 'Vythiri, Wayanad & Munnar Heights',
    startingPrice: 'Price on Demand',
    guestCapacity: '100 - 300 Guests',
    image: '/dest-wedding-1.jpg',
    images: ['/dest-wedding-1.jpg', '/dest-wedding-3.jpg'],
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
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012347',
    reels: [
      {
        id: 'reel-wayanad-1',
        title: 'Misty Tea Garden Ceremony',
        location: 'Vythiri, Wayanad',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-1.jpg',
        aspectRatio: '9:16',
        size: 'sm',
      },
    ],
  },
  {
    id: 'kochi-royal',
    title: 'Fort Kochi Royal Nalukettu Heritage',
    tagline: 'Colonial opulence, antique carved wood & temple courtyards',
    backdrop: 'Heritage',
    location: 'Fort Kochi & Mattancherry Heritage Quarter',
    startingPrice: 'Price on Demand',
    guestCapacity: '300 - 1,200 Guests',
    image: '/dest-wedding-1.jpg',
    images: ['/dest-wedding-1.jpg', '/dest-wedding-2.jpg'],
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
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012348',
    reels: [
      {
        id: 'reel-kochi-1',
        title: 'Nalukettu Brass Lamp Procession',
        location: 'Fort Kochi',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-1.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
]

interface PackagesStoreState {
  packages: WeddingPackage[]
  past: WeddingPackage[][]
  future: WeddingPackage[][]
  savedDesktopAt: string | null
  savedMobileAt: string | null
  fetchGlobalPackages: () => Promise<void>
  saveDesktopEdits: () => void
  saveMobileEdits: () => void
  undo: () => void
  redo: () => void
  addPackage: (pkg: Omit<WeddingPackage, 'id' | 'reels'> & { reels?: PackageReel[] }) => void
  updatePackage: (id: string, updates: Partial<WeddingPackage>) => void
  deletePackage: (id: string) => void
  addPackageReel: (packageId: string, reel: Omit<PackageReel, 'id'>) => void
  updatePackageReel: (packageId: string, reelId: string, updates: Partial<PackageReel>) => void
  deletePackageReel: (packageId: string, reelId: string) => void
  reorderPackageReels: (packageId: string, fromIndex: number, toIndex: number) => void
  movePackageReel: (fromPackageId: string, toPackageId: string, reelId: string, toIndex?: number) => void
  applyLayoutToAllPackages: (sourcePackageId: string) => void
}

const pushHistory = (past: WeddingPackage[][], current: WeddingPackage[]) =>
  [...past.slice(-24), current]

// Background push to Supabase so added/edited packages go live globally across devices
async function pushPackagesToCloud(packages: WeddingPackage[]) {
  try {
    const payload = JSON.stringify(packages)
    await supabase
      .from('auditoriums')
      .update({ description: payload } as any)
      .eq('slug', 'mana_system_packages_config')
  } catch (err) {
    console.warn('Failed to sync packages to Supabase:', err)
  }
}

export const usePackagesStore = create<PackagesStoreState>()(
  persist(
    (set) => ({
      packages: DEFAULT_PACKAGES,
      past: [],
      future: [],
      savedDesktopAt: null,
      savedMobileAt: null,
      fetchGlobalPackages: async () => {
        try {
          const { data, error } = await supabase
            .from('auditoriums')
            .select('description')
            .eq('slug', 'mana_system_packages_config')
            .single()

          if (!error && data?.description) {
            const parsed = JSON.parse(data.description)
            if (Array.isArray(parsed) && parsed.length > 0) {
              set((state) => {
                // Merge custom cloud packages with local state, keeping all newly created vendor packages
                const cloudIds = new Set(parsed.map((p: WeddingPackage) => p.id))
                const localOnly = state.packages.filter((p) => !cloudIds.has(p.id))
                return {
                  packages: [...parsed, ...localOnly],
                }
              })
            }
          }
        } catch {
          // Keep local packages
        }
      },
      saveDesktopEdits: () =>
        set((state) => {
          pushPackagesToCloud(state.packages)
          return {
            savedDesktopAt: new Date().toISOString(),
          }
        }),
      saveMobileEdits: () =>
        set((state) => {
          pushPackagesToCloud(state.packages)
          return {
            savedMobileAt: new Date().toISOString(),
          }
        }),
      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state
          const previous = state.past[state.past.length - 1]
          return {
            packages: previous,
            past: state.past.slice(0, -1),
            future: [state.packages, ...state.future.slice(0, 24)],
          }
        }),
      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state
          const next = state.future[0]
          return {
            packages: next,
            past: pushHistory(state.past, state.packages),
            future: state.future.slice(1),
          }
        }),
      addPackage: (pkg) =>
        set((state) => {
          const slugBase = pkg.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
          const newId = `${slugBase || 'package'}-${Date.now().toString(36)}`
          const images = pkg.images?.length
            ? pkg.images
            : pkg.image
              ? [pkg.image]
              : ['/dest-wedding-1.jpg']
          const defaultReel: PackageReel = {
            id: `reel-${Date.now().toString(36)}`,
            title: `${pkg.title} Highlight`,
            location: pkg.location,
            videoUrl: 'dummy-5s',
            posterUrl: images[0],
            aspectRatio: '9:16',
            size: 'md',
          }
          const nextPackages = [
            {
              ...pkg,
              id: newId,
              image: images[0],
              images,
              reels: pkg.reels?.length ? pkg.reels : [defaultReel],
            },
            ...state.packages,
          ]
          pushPackagesToCloud(nextPackages)
          return {
            past: pushHistory(state.past, state.packages),
            future: [],
            packages: nextPackages,
          }
        }),
      updatePackage: (id, updates) =>
        set((state) => {
          const nextPackages = state.packages.map((p) => {
            if (p.id !== id) return p
            const nextImages = updates.images?.length
              ? updates.images
              : updates.image
                ? [updates.image, ...(p.images || []).filter((img) => img !== updates.image)]
                : p.images || [p.image]
            return {
              ...p,
              ...updates,
              images: nextImages,
              image: nextImages[0] || updates.image || p.image,
            }
          })
          pushPackagesToCloud(nextPackages)
          return {
            past: pushHistory(state.past, state.packages),
            future: [],
            packages: nextPackages,
          }
        }),
      deletePackage: (id) =>
        set((state) => {
          const nextPackages = state.packages.filter((p) => p.id !== id)
          pushPackagesToCloud(nextPackages)
          return {
            past: pushHistory(state.past, state.packages),
            future: [],
            packages: nextPackages,
          }
        }),
      addPackageReel: (packageId, reel) =>
        set((state) => ({
          past: pushHistory(state.past, state.packages),
          future: [],
          packages: state.packages.map((p) =>
            p.id !== packageId
              ? p
              : {
                  ...p,
                  reels: [
                    ...(p.reels || []),
                    {
                      ...reel,
                      id: `reel-${Date.now().toString(36)}`,
                    },
                  ],
                }
          ),
        })),
      updatePackageReel: (packageId, reelId, updates) =>
        set((state) => ({
          past: pushHistory(state.past, state.packages),
          future: [],
          packages: state.packages.map((p) =>
            p.id !== packageId
              ? p
              : {
                  ...p,
                  reels: (p.reels || []).map((r) =>
                    r.id === reelId ? { ...r, ...updates } : r
                  ),
                }
          ),
        })),
      deletePackageReel: (packageId, reelId) =>
        set((state) => ({
          past: pushHistory(state.past, state.packages),
          future: [],
          packages: state.packages.map((p) =>
            p.id !== packageId
              ? p
              : {
                  ...p,
                  reels: (p.reels || []).filter((r) => r.id !== reelId),
                }
          ),
        })),
      reorderPackageReels: (packageId, fromIndex, toIndex) =>
        set((state) => ({
          past: pushHistory(state.past, state.packages),
          future: [],
          packages: state.packages.map((p) => {
            if (p.id !== packageId || !p.reels) return p
            if (
              fromIndex < 0 ||
              toIndex < 0 ||
              fromIndex >= p.reels.length ||
              toIndex >= p.reels.length ||
              fromIndex === toIndex
            ) {
              return p
            }
            const next = [...p.reels]
            const [moved] = next.splice(fromIndex, 1)
            next.splice(toIndex, 0, moved)
            return { ...p, reels: next }
          }),
        })),
      movePackageReel: (fromPackageId, toPackageId, reelId, toIndex) =>
        set((state) => {
          if (fromPackageId === toPackageId) return state
          let movingReel: PackageReel | undefined
          const withoutSource = state.packages.map((p) => {
            if (p.id !== fromPackageId) return p
            movingReel = (p.reels || []).find((r) => r.id === reelId)
            return {
              ...p,
              reels: (p.reels || []).filter((r) => r.id !== reelId),
            }
          })
          if (!movingReel) return state
          return {
            past: pushHistory(state.past, state.packages),
            future: [],
            packages: withoutSource.map((p) => {
              if (p.id !== toPackageId) return p
              const next = [...(p.reels || [])]
              if (typeof toIndex === 'number' && toIndex >= 0 && toIndex <= next.length) {
                next.splice(toIndex, 0, movingReel!)
              } else {
                next.push(movingReel!)
              }
              return { ...p, reels: next }
            }),
          }
        }),
      applyLayoutToAllPackages: (sourcePackageId) =>
        set((state) => {
          const source = state.packages.find((p) => p.id === sourcePackageId)
          if (!source) return state
          const firstReel = source.reels?.[0]
          return {
            past: pushHistory(state.past, state.packages),
            future: [],
            packages: state.packages.map((p) => {
              if (p.id === sourcePackageId) return p
              return {
                ...p,
                textOrder: source.textOrder ? [...source.textOrder] : undefined,
                textOffsets: source.textOffsets ? { ...source.textOffsets } : undefined,
                reverseDesktopLayout: source.reverseDesktopLayout,
                reels: firstReel
                  ? (p.reels || []).map((r) => ({
                      ...r,
                      aspectRatio: firstReel.aspectRatio,
                      size: firstReel.size,
                      textPosition: firstReel.textPosition,
                      textAlign: firstReel.textAlign,
                      textPos: firstReel.textPos,
                    }))
                  : p.reels,
              }
            }),
          }
        }),
    }),
    {
      name: 'manavenues_packages_data',
      version: 5,
      partialize: (state) => ({
        packages: state.packages,
        savedDesktopAt: state.savedDesktopAt,
        savedMobileAt: state.savedMobileAt,
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { packages?: WeddingPackage[] } | undefined
        if (!state || !Array.isArray(state.packages)) {
          return { packages: DEFAULT_PACKAGES }
        }
        return {
          packages: state.packages.map((pkg) => {
            const fallback = DEFAULT_PACKAGES.find((d) => d.id === pkg.id)
            let reels =
              Array.isArray(pkg.reels) && pkg.reels.length > 0
                ? pkg.reels
                : fallback?.reels || [
                    {
                      id: `reel-${pkg.id}`,
                      title: `${pkg.title} Highlight`,
                      location: pkg.location,
                      videoUrl: 'dummy-5s',
                      posterUrl: pkg.image,
                      aspectRatio: '9:16' as ReelAspectRatio,
                      size: 'md' as ReelSize,
                    },
                  ]

            // Ensure the 3rd dummy 9:16 reel is added to the first package on upgrade to v3
            if (version < 3 && pkg.id === 'alleppey-serenade' && !reels.some((r) => r.id === 'reel-alleppey-3')) {
              const third = DEFAULT_PACKAGES[0].reels[2]
              if (third) reels = [...reels, third]
            }

            // Upgrade any dummy prices to Price on Demand
            const startingPrice =
              pkg.startingPrice && !pkg.startingPrice.toLowerCase().includes('demand') && (pkg.startingPrice.includes('₹') || fallback)
                ? 'Price on Demand'
                : (pkg.startingPrice || 'Price on Demand')

            return {
              ...pkg,
              startingPrice,
              reels,
              instagramUrl: pkg.instagramUrl || fallback?.instagramUrl || 'https://instagram.com/manaweddings',
              whatsappNumber: pkg.whatsappNumber || fallback?.whatsappNumber || '919847012345',
            }
          }),
        }
      },
    }
  )
)
