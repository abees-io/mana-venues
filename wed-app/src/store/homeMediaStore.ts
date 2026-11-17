import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const DEFAULT_HERO_IMAGE = '/dest-wedding-1.jpg'

export const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  heritage: '/dest-wedding-1.jpg',
  lakeside: '/category-lakeside.jpg',
  beach: '/dest-wedding-2.jpg',
  highland: '/dest-wedding-3.jpg',
}

interface HomeMediaState {
  heroImage: string
  categoryImages: Record<string, string>
  setHeroImage: (url: string) => void
  setCategoryImage: (categoryId: string, url: string) => void
  resetHeroImage: () => void
  resetCategoryImage: (categoryId: string) => void
}

export const useHomeMediaStore = create<HomeMediaState>()(
  persist(
    (set) => ({
      heroImage: DEFAULT_HERO_IMAGE,
      categoryImages: DEFAULT_CATEGORY_IMAGES,
      setHeroImage: (url) => set({ heroImage: url || DEFAULT_HERO_IMAGE }),
      setCategoryImage: (categoryId, url) =>
        set((state) => ({
          categoryImages: {
            ...state.categoryImages,
            [categoryId]: url || DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
          },
        })),
      resetHeroImage: () => set({ heroImage: DEFAULT_HERO_IMAGE }),
      resetCategoryImage: (categoryId) =>
        set((state) => ({
          categoryImages: {
            ...state.categoryImages,
            [categoryId]: DEFAULT_CATEGORY_IMAGES[categoryId] || DEFAULT_HERO_IMAGE,
          },
        })),
    }),
    {
      name: 'manavenues_home_media',
    }
  )
)
