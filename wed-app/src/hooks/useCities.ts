import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { City } from '../lib/types'

// All 14 Districts of Kerala (No "All Kerala" dummy entry)
export const KERALA_DISTRICTS_CITIES: City[] = [
  { id: 'palakkad', name: 'Palakkad', slug: 'palakkad', state: 'Kerala', is_active: true },
  { id: 'kochi', name: 'Kochi (Ernakulam)', slug: 'kochi', state: 'Kerala', is_active: true },
  { id: 'thrissur', name: 'Thrissur', slug: 'thrissur', state: 'Kerala', is_active: true },
  { id: 'kozhikode', name: 'Kozhikode', slug: 'kozhikode', state: 'Kerala', is_active: true },
  { id: 'thiruvananthapuram', name: 'Thiruvananthapuram', slug: 'thiruvananthapuram', state: 'Kerala', is_active: true },
  { id: 'malappuram', name: 'Malappuram', slug: 'malappuram', state: 'Kerala', is_active: true },
  { id: 'alappuzha', name: 'Alappuzha', slug: 'alappuzha', state: 'Kerala', is_active: true },
  { id: 'kottayam', name: 'Kottayam', slug: 'kottayam', state: 'Kerala', is_active: true },
  { id: 'kollam', name: 'Kollam', slug: 'kollam', state: 'Kerala', is_active: true },
  { id: 'kannur', name: 'Kannur', slug: 'kannur', state: 'Kerala', is_active: true },
  { id: 'wayanad', name: 'Wayanad', slug: 'wayanad', state: 'Kerala', is_active: true },
  { id: 'idukki', name: 'Idukki', slug: 'idukki', state: 'Kerala', is_active: true },
  { id: 'kasaragod', name: 'Kasaragod', slug: 'kasaragod', state: 'Kerala', is_active: true },
  { id: 'pathanamthitta', name: 'Pathanamthitta', slug: 'pathanamthitta', state: 'Kerala', is_active: true },
]

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error || !data || data.length === 0) {
          return KERALA_DISTRICTS_CITIES
        }

        const dbCities = (data as City[]).filter(
          (c) => c.slug.toLowerCase() !== 'all-kerala' && c.name.toLowerCase() !== 'all kerala'
        )

        const combined = [...dbCities]
        for (const dist of KERALA_DISTRICTS_CITIES) {
          if (
            !combined.some(
              (c) =>
                c.slug.toLowerCase() === dist.slug.toLowerCase() ||
                c.name.toLowerCase().includes(dist.slug.toLowerCase())
            )
          ) {
            combined.push(dist)
          }
        }
        return combined
      } catch {
        return KERALA_DISTRICTS_CITIES
      }
    },
    staleTime: Infinity,
  })
}
