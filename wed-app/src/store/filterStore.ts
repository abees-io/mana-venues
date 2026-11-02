import { create } from 'zustand'

export interface FilterState {
  capacityMin: number
  capacityMax: number
  priceMin: number
  priceMax: number
  amenities: string[]
}

export interface FilterStore extends FilterState {
  setCapacityRange: (min: number, max: number) => void
  setPriceRange: (min: number, max: number) => void
  toggleAmenity: (amenity: string) => void
  resetFilters: () => void
}

const DEFAULT_FILTERS: FilterState = {
  capacityMin: 0,
  capacityMax: 5000,
  priceMin: 0,
  priceMax: 500000,
  amenities: [],
}

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULT_FILTERS,
  setCapacityRange: (min, max) => set({ capacityMin: min, capacityMax: max }),
  setPriceRange: (min, max) => set({ priceMin: min, priceMax: max }),
  toggleAmenity: (amenity) =>
    set((state) => ({
      amenities: state.amenities.includes(amenity)
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    })),
  resetFilters: () => set(DEFAULT_FILTERS),
}))
