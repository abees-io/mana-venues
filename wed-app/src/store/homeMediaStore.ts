import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const useHomeMediaStore = create<HomeMediaState>()(
  persist(
    (set) => ({
      heroImage: DEFAULT_HERO_IMAGE,
      visionImage: DEFAULT_VISION_IMAGE,
      venueFeatureImage: DEFAULT_VENUE_FEATURE_IMAGE,
      categoryImages: DEFAULT_CATEGORY_IMAGES,
      siteImages: {},
      past: [],
      future: [],
      setHeroImage: (url) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          heroImage: url || DEFAULT_HERO_IMAGE,
        })),
      setVisionImage: (url) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          visionImage: url || DEFAULT_VISION_IMAGE,
        })),
      resetVisionImage: () =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          visionImage: DEFAULT_VISION_IMAGE,
        })),
      setVenueFeatureImage: (url) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          venueFeatureImage: url || DEFAULT_VENUE_FEATURE_IMAGE,
        })),
      resetVenueFeatureImage: () =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          venueFeatureImage: DEFAULT_VENUE_FEATURE_IMAGE,
        })),
      setSiteImage: (key, url) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          siteImages: {
            ...state.siteImages,
            [key]: url,
          },
        })),
      resetSiteImage: (key) =>
        set((state) => {
          const updated = { ...state.siteImages }
          delete updated[key]
          return {
            past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
            future: [],
            siteImages: updated,
          }
        }),
      setCategoryImage: (categoryId, url) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          categoryImages: {
            ...state.categoryImages,
            [categoryId]: url || DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
          },
        })),
      resetHeroImage: () =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          heroImage: DEFAULT_HERO_IMAGE,
        })),
      resetCategoryImage: (categoryId) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          categoryImages: {
            ...state.categoryImages,
            [categoryId]: DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
          },
        })),
      undo: () =>
        set((state) => {
          if (state.past.length === 0) return state
          const previous = state.past[state.past.length - 1]
          return {
            ...previous,
            past: state.past.slice(0, -1),
            future: [takeSnapshot(state), ...state.future].slice(0, MAX_HISTORY),
          }
        }),
      redo: () =>
        set((state) => {
          if (state.future.length === 0) return state
          const next = state.future[0]
          return {
            ...next,
            past: [...state.past, takeSnapshot(state)].slice(-MAX_HISTORY),
            future: state.future.slice(1),
          }
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
