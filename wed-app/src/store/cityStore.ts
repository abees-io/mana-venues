import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SelectedCity {
  id: string
  name: string
  slug: string
}

export interface CityStore {
  selectedCity: SelectedCity | null
  setCity: (city: SelectedCity) => void
  clearCity: () => void
}

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      selectedCity: null,
      setCity: (city) => set({ selectedCity: city }),
      clearCity: () => set({ selectedCity: null }),
    }),
    {
      name: 'manavenues_city',
    }
  )
)
