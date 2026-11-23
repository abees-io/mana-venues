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
  setHeroImage: (url: string) => void
  setVisionImage: (url: string) => void
  setVenueFeatureImage: (url: string) => void
  setCategoryImage: (categoryId: string, url: string) => void
  setSiteImage: (key: string, url: string) => void
  resetHeroImage: () => void
  resetVisionImage: () => void
  resetVenueFeatureImage: () => void
  resetCategoryImage: (categoryId: string) => void
  resetSiteImage: (key: string) => void
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

// Background push to Supabase so changes go live globally to all users & devices
async function pushMediaToCloud(snapshot: HomeMediaSnapshot) {
  try {
    const payload = JSON.stringify({
      heroImage: snapshot.heroImage,
      visionImage: snapshot.visionImage,
      venueFeatureImage: snapshot.venueFeatureImage,
      categoryImages: snapshot.categoryImages,
      siteImages: snapshot.siteImages,
    })
    await supabase
      .from('auditoriums')
      .update({ description: payload } as any)
      .eq('slug', 'mana_system_media_config')
  } catch (err) {
    console.warn('Failed to sync media to Supabase:', err)
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
            set((state) => ({
              heroImage: parsed.heroImage || state.heroImage,
              visionImage: parsed.visionImage || state.visionImage,
              venueFeatureImage: parsed.venueFeatureImage || state.venueFeatureImage,
              categoryImages: {
                ...state.categoryImages,
                ...(parsed.categoryImages || {}),
              },
              siteImages: {
                ...state.siteImages,
                ...(parsed.siteImages || {}),
              },
            }))
          }
        } catch {
          // Fall back gracefully to local store
        }
      },
      syncToSupabase: async () => {
        const state = get()
        await pushMediaToCloud(takeSnapshot(state))
      },
      setHeroImage: (url) => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            heroImage: url || DEFAULT_HERO_IMAGE,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      setVisionImage: (url) => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            visionImage: url || DEFAULT_VISION_IMAGE,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      resetVisionImage: () => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            visionImage: DEFAULT_VISION_IMAGE,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      setVenueFeatureImage: (url) => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            venueFeatureImage: url || DEFAULT_VENUE_FEATURE_IMAGE,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      resetVenueFeatureImage: () => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            venueFeatureImage: DEFAULT_VENUE_FEATURE_IMAGE,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      setSiteImage: (key, url) => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            siteImages: {
              ...state.siteImages,
              [key]: url,
            },
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      resetSiteImage: (key) => {
        set((state) => {
          const updated = { ...state.siteImages }
          delete updated[key]
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            siteImages: updated,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      setCategoryImage: (categoryId, url) => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            categoryImages: {
              ...state.categoryImages,
              [categoryId]: url || DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
            },
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      resetHeroImage: () => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            heroImage: DEFAULT_HERO_IMAGE,
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
      },
      resetCategoryImage: (categoryId) => {
        set((state) => {
          const next = {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            categoryImages: {
              ...state.categoryImages,
              [categoryId]: DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
            },
          }
          pushMediaToCloud(takeSnapshot({ ...state, ...next }))
          return next
        })
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
