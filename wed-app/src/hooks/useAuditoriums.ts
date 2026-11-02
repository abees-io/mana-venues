import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Auditorium } from '../lib/types'
import type { FilterState } from '../store/filterStore'

export function useAuditoriums(citySlug?: string | null, filters?: Partial<FilterState>) {
  return useQuery({
    queryKey: ['auditoriums', citySlug, filters],
    queryFn: async () => {
      let query = supabase
        .from('auditoriums')
        .select('*, cities(id, name, slug, state)')
        .eq('verified', true)

      if (citySlug) {
        // Filter by city slug via join
        query = query.eq('cities.slug', citySlug)
      }
      if (filters?.capacityMin) {
        query = query.gte('seating_capacity', filters.capacityMin)
      }
      if (filters?.capacityMax && filters.capacityMax < 5000) {
        query = query.lte('seating_capacity', filters.capacityMax)
      }
      if (filters?.priceMin) {
        query = query.gte('base_price_per_day', filters.priceMin)
      }
      if (filters?.priceMax && filters.priceMax < 500000) {
        query = query.lte('base_price_per_day', filters.priceMax)
      }
      if (filters?.amenities && filters.amenities.length > 0) {
        query = query.contains('amenities', JSON.stringify(filters.amenities))
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as (Auditorium & { cities: { id: string; name: string; slug: string; state: string } | null })[]
    },
    staleTime: 5 * 60 * 1000,
  })
}
