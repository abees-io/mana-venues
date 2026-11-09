import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export function useAuditoriumDetail(slug: string) {
  return useQuery({
    queryKey: ['auditorium', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditoriums')
        .select('*, cities(*), profiles(full_name, phone, email)')
        .eq('slug', slug)
        .single()
      if (error) throw error

      if (data) {
        let photosArray: string[] = []
        if (Array.isArray((data as any).photos) && (data as any).photos.length > 0) {
          photosArray = (data as any).photos
        } else if (typeof (data as any).photos === 'string' && (data as any).photos.startsWith('[')) {
          try {
            photosArray = JSON.parse((data as any).photos)
          } catch {
            photosArray = []
          }
        } else if (typeof (data as any).photos === 'string' && (data as any).photos.startsWith('http')) {
          photosArray = [(data as any).photos]
        }

        const title = (data as any).name || (data as any).title || 'Auditorium'
        const capacity = Number((data as any).capacity || (data as any).seating_capacity || 500)
        const startingPrice = Number((data as any).starting_price || (data as any).base_price_per_day || 40000)

        return {
          ...data,
          title,
          name: title,
          capacity,
          seating_capacity: capacity,
          starting_price: startingPrice,
          base_price_per_day: startingPrice,
          photos: photosArray,
        }
      }

      return data
    },
    enabled: !!slug,
  })
}
