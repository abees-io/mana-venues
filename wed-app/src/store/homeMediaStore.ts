import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export const DEFAULT_HERO_IMAGE = '/dest-wedding-1.jpg'
export const DEFAULT_VISION_IMAGE = '/photo-prewedding.jpg'
export const DEFAULT_VENUE_FEATURE_IMAGE = '/venue-ai-dummy.jpg'

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  destination_wedding: '/category-destination.jpg',
  photography: '/category-photography.jpg',
  catering: '/category-catering.jpg',
  makeup_artist: '/category-makeup.jpg',
  // Backward compatibility
  heritage: '/dest-wedding-1.jpg',
  lakeside: '/category-lakeside.jpg',
  beach: '/dest-wedding-2.jpg',
  highland: '/dest-wedding-3.jpg',
}

interface HomeMediaSnapshot {
  heroImage: string
  visionImage: string
  venueFeatureImage: string
  categoryImages: Record<string, string>
  siteImages: Record<string, string>
}

interface HomeMediaState {
  heroImage: string
  visionImage: string
  venueFeatureImage: string
  categoryImages: Record<string, string>
  siteImages: Record<string, string>
  past: HomeMediaSnapshot[]
  future: HomeMediaSnapshot[]
  fetchGlobalMedia: () => Promise<void>
  syncToSupabase: () => Promise<void>
  setHeroImage: (url: string) => Promise<void>
  setVisionImage: (url: string) => Promise<void>
  setVenueFeatureImage: (url: string) => Promise<void>
  setCategoryImage: (categoryId: string, url: string) => Promise<void>
  setSiteImage: (key: string, url: string) => Promise<void>
  resetHeroImage: () => Promise<void>
  resetVisionImage: () => Promise<void>
  resetVenueFeatureImage: () => Promise<void>
  resetCategoryImage: (categoryId: string) => Promise<void>
  resetSiteImage: (key: string) => Promise<void>
  undo: () => void
  redo: () => void
}

const MAX_HISTORY = 25

function takeSnapshot(state: HomeMediaState): HomeMediaSnapshot {
  return {
    heroImage: state.heroImage,
    visionImage: state.visionImage,
    venueFeatureImage: state.venueFeatureImage,
    categoryImages: { ...state.categoryImages },
    siteImages: { ...state.siteImages },
  }
}

// Push to Supabase with verification so changes immediately publish live globally
async function pushMediaToCloud(snapshot: HomeMediaSnapshot) {
  try {
    const payload = JSON.stringify({
      heroImage: snapshot.heroImage,
      visionImage: snapshot.visionImage,
      venueFeatureImage: snapshot.venueFeatureImage,
      categoryImages: snapshot.categoryImages,
      siteImages: snapshot.siteImages,
    })
    const { error } = await supabase
      .from('auditoriums')
      .update({ description: payload } as any)
      .eq('slug', 'mana_system_media_config')

    if (error) {
      console.error('Failed to sync media to Supabase:', error.message)
    }
  } catch (err) {
    console.error('Failed to sync media to Supabase:', err)
  }
}

export const useHomeMediaStore = create<HomeMediaState>()(
  persist(
    (set, get) => ({
      heroImage: DEFAULT_HERO_IMAGE,
      visionImage: DEFAULT_VISION_IMAGE,
      venueFeatureImage: DEFAULT_VENUE_FEATURE_IMAGE,
      categoryImages: DEFAULT_CATEGORY_IMAGES,
      siteImages: {},
      past: [],
      future: [],
      fetchGlobalMedia: async () => {
        try {
          const { data, error } = await supabase
            .from('auditoriums')
            .select('description')
            .eq('slug', 'mana_system_media_config')
            .single()

          if (!error && data?.description) {
            const parsed = JSON.parse(data.description)
            const cleanUrl = (val: any, fallback: string) =>
              typeof val === 'string' && val.length > 0 && val.length < 50000 ? val : fallback

            const cleanCategoryMap: Record<string, string> = {}
            if (parsed.categoryImages && typeof parsed.categoryImages === 'object') {
              for (const [k, v] of Object.entries(parsed.categoryImages)) {
                if (typeof v === 'string' && v.length < 50000) {
                  cleanCategoryMap[k] = v
                }
              }
            }

            const cleanSiteMap: Record<string, string> = {}
            if (parsed.siteImages && typeof parsed.siteImages === 'object') {
              for (const [k, v] of Object.entries(parsed.siteImages)) {
                if (typeof v === 'string' && v.length < 50000) {
                  cleanSiteMap[k] = v
                }
              }
            }

            set((state) => ({
              heroImage: cleanUrl(parsed.heroImage, state.heroImage),
              visionImage: cleanUrl(parsed.visionImage, state.visionImage),
              venueFeatureImage: cleanUrl(parsed.venueFeatureImage, state.venueFeatureImage),
              categoryImages: {
                ...state.categoryImages,
                ...cleanCategoryMap,
              },
              siteImages: {
                ...state.siteImages,
                ...cleanSiteMap,
              },
            }))
          }
        } catch (err) {
          console.warn('Failed to fetch global media config:', err)
        }
      },
      syncToSupabase: async () => {
        const state = get()
        await pushMediaToCloud(takeSnapshot(state))
      },
      setHeroImage: async (url) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            heroImage: url || DEFAULT_HERO_IMAGE,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      setVisionImage: async (url) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            visionImage: url || DEFAULT_VISION_IMAGE,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      resetVisionImage: async () => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            visionImage: DEFAULT_VISION_IMAGE,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      setVenueFeatureImage: async (url) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            venueFeatureImage: url || DEFAULT_VENUE_FEATURE_IMAGE,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      resetVenueFeatureImage: async () => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            venueFeatureImage: DEFAULT_VENUE_FEATURE_IMAGE,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      setSiteImage: async (key, url) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            siteImages: {
              ...state.siteImages,
              [key]: url,
            },
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      resetSiteImage: async (key) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const updated = { ...state.siteImages }
          delete updated[key]
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            siteImages: updated,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      setCategoryImage: async (categoryId, url) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            categoryImages: {
              ...state.categoryImages,
              [categoryId]: url || DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
            },
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      resetHeroImage: async () => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            heroImage: DEFAULT_HERO_IMAGE,
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      resetCategoryImage: async (categoryId) => {
        let snapshot: HomeMediaSnapshot | null = null
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            categoryImages: {
              ...state.categoryImages,
              [categoryId]: DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
            },
          }
          snapshot = takeSnapshot({ ...state, ...next })
          return next
        })
        if (snapshot) await pushMediaToCloud(snapshot)
      },
      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state
          const previous = state.past[state.past.length - 1]
          const next = {
            ...previous,
            past: state.past.slice(0, -1),
            future: [takeSnapshot(state), ...state.future].slice(0, MAX_HISTORY),
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        }),
      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state
          const nextItem = state.future[0]
          const next = {
            ...nextItem,
            past: [...state.past, takeSnapshot(state)].slice(-MAX_HISTORY),
            future: state.future.slice(1),
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        }),
    }),
    {
      name: 'manavenues_home_media',
      partialize: (state) => ({
        heroImage: state.heroImage,
        visionImage: state.visionImage,
        venueFeatureImage: state.venueFeatureImage,
        categoryImages: state.categoryImages,
        siteImages: state.siteImages,
      }),
      merge: (persistedState, currentState) => {
        const persisted = (persistedState as Partial<HomeMediaState>) || {}
        return {
          ...currentState,
          ...persisted,
          venueFeatureImage: persisted.venueFeatureImage || DEFAULT_VENUE_FEATURE_IMAGE,
          categoryImages: {
            ...DEFAULT_CATEGORY_IMAGES,
            ...(persisted.categoryImages || {}),
          },
          siteImages: persisted.siteImages || {},
        }
      },
    }
  )
)
