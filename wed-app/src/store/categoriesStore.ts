import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CategoryOffer {
  id: string
  title: string
  subtitle: string
  badge: string
  route: string
  imageUrl: string
}

export const DEFAULT_CATEGORIES: CategoryOffer[] = [
  {
    id: 'destination-weddings',
    title: 'Destination Wedding',
    subtitle: 'Bespoke palace, backwater, beach & misty hill resort packages',
    badge: 'Packages',
    route: '/packages',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'photography',
    title: 'Photography',
    subtitle: 'Candid wedding photography, cinematic 4K films & drone coverage',
    badge: 'Films & Video',
    route: '/photography',
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'catering',
    title: 'Catering',
    subtitle: 'Traditional Kerala Sadya, royal Mughal banquets & gourmet catering',
    badge: 'Banquets & Feasts',
    route: '/catering',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'bridal-makeup',
    title: 'Bridal & Makeups',
    subtitle: 'Celebrity makeup artists, traditional bridal styling & mehandi design',
    badge: 'Styling & Beauty',
    route: '/bridal-makeup',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
  },
]

interface CategoriesState {
  categories: CategoryOffer[]
  updateCategory: (id: string, updates: Partial<CategoryOffer>) => void
  resetCategories: () => void
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: DEFAULT_CATEGORIES,
      updateCategory: (id, updates) =>
        set((state) => ({
          categories: state.categories.map((cat) =>
            cat.id === id ? { ...cat, ...updates } : cat
          ),
        })),
      resetCategories: () => set({ categories: DEFAULT_CATEGORIES }),
    }),
    {
      name: 'mana_categories_store',
    }
  )
)
