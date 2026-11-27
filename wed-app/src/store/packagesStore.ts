import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { matchesPackageCities } from '../lib/cityMatch'

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
  cities?: string[]
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

/**
 * Checks whether a package is available in the specified city.
 * Matches against package.cities array, package.location text,
 * and known Kerala city aliases (e.g. Kochi <-> Ernakulam, Trivandrum <-> Thiruvananthapuram).
 */
export function packageMatchesCity(
  pkg: WeddingPackage,
  city: { name: string; slug: string } | string | null | undefined
): boolean {
  return matchesPackageCities(pkg.cities, city, pkg.location, false)
}

export const DEFAULT_PACKAGES: WeddingPackage[] = [
  {
    id: 'meliora-signature',
    title: 'Meliora Signature Wedding Experience',
    tagline: 'Elegant event design, stage décor & full-service management',
    backdrop: 'Coast',
    location: 'Kochi, Kottayam & Ernakulam',
    cities: ['kochi', 'ernakulam', 'kottayam', 'thiruvananthapuram', 'alappuzha', 'kollam', 'pathanamthitta'],
    startingPrice: 'Price on Request',
    guestCapacity: '200 - 800 Guests',
    image: '/dest-wedding-2.jpg',
    images: ['/dest-wedding-2.jpg', '/dest-wedding-1.jpg', '/dest-wedding-3.jpg'],
    description:
      'Create unforgettable memories with the Meliora Signature Wedding Experience. From elegant event design and stunning stage décor to premium catering, photography, entertainment, luxury transportation, and honeymoon planning.',
    inclusions: [
      'Event Designing & Planning',
      'Premium Stage Decoration',
      'Catering Service Management',
      'Photography & Videography Coverage',
      'Entertainment Programmes & Performances',
      'Premium Wedding Vehicles',
      'Professional Light & Sound Setup',
      'Honeymoon Package Planning & Assistance',
    ],
    partnerPlanner: 'Meliora Events',
    verified: true,
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012345',
    reels: [
      {
        id: 'reel-meliora-1',
        title: 'Meliora Grand Stage & Light Setup',
        location: 'Kochi, Kottayam',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-2.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
  {
    id: 'heyday-grand-wedding',
    title: 'Grand Wedding Custom Package',
    tagline: 'Bespoke marquees, floral canopies & complete celebration curation',
    backdrop: 'Heritage',
    location: 'Kochi, Thrissur & Calicut',
    cities: ['kochi', 'thrissur', 'kozhikode', 'malappuram', 'palakkad', 'kannur', 'kasaragod'],
    startingPrice: 'Price on Request',
    guestCapacity: '250 - 1,000 Guests',
    image: '/dest-wedding-3.jpg',
    images: ['/dest-wedding-3.jpg', '/dest-wedding-2.jpg'],
    description:
      'Complete personalized wedding planning package with luxury marquee setup, custom floral aisles, designer stage pavilions, authentic multi-cuisine feasts, and end-to-end guest logistics.',
    inclusions: [
      'Custom Outdoor & Indoor Tent Architecture',
      'Designer Mandap & Stage Styling',
      'Artisanal Floral Installations',
      'Multi-cuisine Feast Management',
      'Live Orchestra & Cultural Performers',
      'VIP Concierge & Guest Transportation',
    ],
    partnerPlanner: 'Heyday Event Planners',
    verified: true,
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012346',
    reels: [
      {
        id: 'reel-heyday-1',
        title: 'Marquee Tent & Open Aisle Celebration',
        location: 'Kochi, Thrissur',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-3.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
  {
    id: 'regal-castle-custom',
    title: 'Custom Wedding Package by Regal Castle',
    tagline: 'Grand royal banquet halls, chandelier illumination & imperial feasts',
    backdrop: 'Backwaters',
    location: 'Ernakulam & Alappuzha',
    cities: ['ernakulam', 'kochi', 'alappuzha', 'kollam', 'idukki', 'wayanad', 'kottayam'],
    startingPrice: 'Price on Request',
    guestCapacity: '300 - 1,500 Guests',
    image: '/dest-wedding-1.jpg',
    images: ['/dest-wedding-1.jpg', '/dest-wedding-2.jpg'],
    description:
      'Experience royal grandeur with Regal Castle custom packages. Designed for majestic indoor celebrations featuring gold-accented mandaps, crystal chandeliers, live acoustic instrumentation, and lavish banquet banqueting.',
    inclusions: [
      'Grand Royal Hall & Courtyard Setup',
      'Imperial Chandelier & Floral Backdrop',
      'Traditional 32-Course Kerala Sadya / Global Buffet',
      'Cinematic 4K Photography & Drone Coverage',
      'Bridal Suite & Groom Lounge Services',
      'Valet Parking & Executive Security Team',
    ],
    partnerPlanner: 'Regal Castle',
    verified: true,
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012348',
    reels: [
      {
        id: 'reel-regal-1',
        title: 'Regal Banquet Hall & Golden Mandap',
        location: 'Ernakulam, Alappuzha',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-1.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
  {
    id: 'wayanad-hills-celebration',
    title: 'Misty Hills & Tea Estate Celebration',
    tagline: 'Open-air amphitheatre, pine canopy mandap & mountain breeze wedding',
    backdrop: 'Hills',
    location: 'Wayanad, Idukki & Munnar',
    cities: ['wayanad', 'idukki', 'palakkad', 'kozhikode', 'kannur'],
    startingPrice: 'Price on Request',
    guestCapacity: '150 - 600 Guests',
    image: '/dest-wedding-3.jpg',
    images: ['/dest-wedding-3.jpg', '/dest-wedding-1.jpg'],
    description:
      'Celebrate your special day nestled amidst misty mountain heights, lush spice gardens, and serene tea estates. Includes panoramic hill ceremony, eco-luxe floral styling, and artisanal mountain banquet.',
    inclusions: [
      'Hilltop Tea Estate Ceremony Deck',
      'Eco-luxe Floral Arch & Pine Mandap',
      'Gourmet Mountain Buffet & Live Barbecue',
      'Cinematic Drone & Candid Photography',
      'Mountain Resort Suite Accommodation for Couple',
      'Acoustic Live Strings & Evening Bonfire',
    ],
    partnerPlanner: 'Meliora Events',
    verified: true,
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012345',
    reels: [
      {
        id: 'reel-hills-1',
        title: 'Hillside Tea Garden Wedding',
        location: 'Wayanad, Munnar',
        videoUrl: 'dummy-5s',
        posterUrl: '/dest-wedding-3.jpg',
        aspectRatio: '9:16',
        size: 'md',
      },
    ],
  },
  {
    id: 'travancore-royal-heritage',
    title: 'Travancore Royal Heritage Package',
    tagline: 'Authentic temple architecture, traditional nadaswaram & royal court feasts',
    backdrop: 'Heritage',
    location: 'Thiruvananthapuram, Kollam & Pathanamthitta',
    cities: ['thiruvananthapuram', 'kollam', 'pathanamthitta', 'alappuzha', 'kottayam'],
    startingPrice: 'Price on Request',
    guestCapacity: '350 - 1,200 Guests',
    image: '/dest-wedding-1.jpg',
    images: ['/dest-wedding-1.jpg', '/dest-wedding-2.jpg'],
    description:
      'Immerse in the timeless splendour of Travancore heritage. Featuring authentic teakwood mandap carving, traditional brass oil lamp lighting, classical Kerala musical ensembles, and an authentic royal feast.',
    inclusions: [
      'Heritage Palace & Courtyard Architecture',
      'Carved Teakwood Mandap Styling',
      'Traditional 36-dish Travancore Royal Sadya',
      'Classical Nadaswaram & Panchavadyam Performance',
      'Royal Elephant Welcome & VIP Escort Service',
      'Ultra-HD Cinematic Traditional Video & Album',
    ],
    partnerPlanner: 'Regal Castle',
    verified: true,
    instagramUrl: 'https://instagram.com/manaweddings',
    whatsappNumber: '919847012348',
    reels: [
      {
        id: 'reel-travancore-1',
        title: 'Royal Travancore Heritage Celebration',
        location: 'Thiruvananthapuram, Kollam',
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
  deletedPackageIds?: string[]
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

// Background push to Supabase so added/edited/deleted packages go live globally across devices
async function pushPackagesToCloud(packages: WeddingPackage[]) {
  try {
    const payload = JSON.stringify(packages)
    const { data: existing } = await supabase
      .from('auditoriums')
      .select('id')
      .eq('slug', 'mana_system_packages_config')
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('auditoriums')
        .update({ description: payload } as any)
        .eq('slug', 'mana_system_packages_config')
      if (error) {
        console.warn('Failed to sync packages to Supabase:', error.message)
      }
    } else {
      const { error } = await supabase
        .from('auditoriums')
        .insert({
          name: 'System Packages Config',
          slug: 'mana_system_packages_config',
          description: payload,
          is_active: false,
        } as any)
      if (error) {
        console.warn('Failed to insert packages config to Supabase:', error.message)
      }
    }
  } catch (err) {
    console.warn('Failed to sync packages to Supabase:', err)
  }
}

export const usePackagesStore = create<PackagesStoreState>()(
  persist(
    (set) => ({
      packages: DEFAULT_PACKAGES,
      deletedPackageIds: [],
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
                const deletedSet = new Set(state.deletedPackageIds || [])
                const cloudFiltered = parsed.filter((p: WeddingPackage) => !deletedSet.has(p.id))
                // Retain local-only packages that have not been explicitly deleted
                const cloudIds = new Set(cloudFiltered.map((p: WeddingPackage) => p.id))
                const localOnly = state.packages.filter(
                  (p) => !cloudIds.has(p.id) && !deletedSet.has(p.id)
                )
                return {
                  packages: [...cloudFiltered, ...localOnly],
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
          const nextDeleted = Array.from(new Set([...(state.deletedPackageIds || []), id]))
          pushPackagesToCloud(nextPackages)
          return {
            past: pushHistory(state.past, state.packages),
            future: [],
            packages: nextPackages,
            deletedPackageIds: nextDeleted,
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
        deletedPackageIds: state.deletedPackageIds || [],
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
