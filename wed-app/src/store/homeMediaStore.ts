import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_HERO_IMAGE = '/dest-wedding-1.jpg'

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  heritage: '/dest-wedding-1.jpg',
  lakeside: '/category-lakeside.jpg',
  beach: '/dest-wedding-2.jpg',
  highland: '/dest-wedding-3.jpg',
}

interface HomeMediaSnapshot {
  heroImage: string
  categoryImages: Record<string, string>
}

interface HomeMediaState {
  heroImage: string
  categoryImages: Record<string, string>
  past: HomeMediaSnapshot[]
  future: HomeMediaSnapshot[]
  setHeroImage: (url: string) => void
  setCategoryImage: (categoryId: string, url: string) => void
  resetHeroImage: () => void
  resetCategoryImage: (categoryId: string) => void
  undo: () => void
  redo: () => void
}

const MAX_HISTORY = 25

function takeSnapshot(state: HomeMediaState): HomeMediaSnapshot {
  return {
    heroImage: state.heroImage,
    categoryImages: { ...state.categoryImages },
  }
}

export const useHomeMediaStore = create<HomeMediaState>()(
  persist(
    (set) => ({
      heroImage: DEFAULT_HERO_IMAGE,
      categoryImages: DEFAULT_CATEGORY_IMAGES,
      past: [],
      future: [],
      setHeroImage: (url) =>
        set((state) => ({
          past: [...state.past.slice(-(MAX_HISTORY - 1)), takeSnapshot(state)],
          future: [],
          heroImage: url || DEFAULT_HERO_IMAGE,
        })),
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
        categoryImages: state.categoryImages,
      }),
    }
  )
)
