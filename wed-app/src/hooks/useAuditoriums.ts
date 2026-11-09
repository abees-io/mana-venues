import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Auditorium } from '../lib/types'
import type { FilterState } from '../store/filterStore'

export type UnifiedAuditorium = Auditorium & {
  phone_number?: string | null
  starting_price?: number
  capacity?: number
  district?: string
  city?: string | null
  cities?: {
    id: string
    name: string
    slug: string
    state: string
  } | null
}

export function useAuditoriums(citySlug?: string | null, filters?: Partial<FilterState>) {
  return useQuery({
    queryKey: ['auditoriums', citySlug, filters],
    queryFn: async (): Promise<UnifiedAuditorium[]> => {
      let query = (supabase.from('auditoriums') as any)
        .select('*')
        .order('starting_price', { ascending: true })

      if (citySlug && citySlug !== 'all-kerala') {
        const raw = citySlug.trim().toLowerCase()
        // Map common aliases (e.g. 'ernakulam' -> also 'kochi', 'palakkad' -> 'palakkad')
        const aliases = [raw]
        if (raw === 'kochi' || raw === 'ernakulam') aliases.push('kochi', 'ernakulam')
        if (raw === 'trivandrum' || raw === 'thiruvananthapuram') aliases.push('trivandrum', 'thiruvananthapuram')
        if (raw === 'calicut' || raw === 'kozhikode') aliases.push('calicut', 'kozhikode')
        if (raw === 'alleppey' || raw === 'alappuzha') aliases.push('alleppey', 'alappuzha')

        const orClauses = aliases
          .map((a) => `district.ilike.%${a}%,city.ilike.%${a}%,address.ilike.%${a}%,slug.ilike.%${a}%`)
          .join(',')

        query = query.or(orClauses)
      }

      if (filters?.capacityMin) {
        query = query.or(`capacity.gte.${filters.capacityMin},seating_capacity.gte.${filters.capacityMin}`)
      }
      if (filters?.capacityMax && filters.capacityMax < 5000) {
        query = query.or(`capacity.lte.${filters.capacityMax},seating_capacity.lte.${filters.capacityMax}`)
      }
      if (filters?.priceMin) {
        query = query.or(`starting_price.gte.${filters.priceMin},base_price_per_day.gte.${filters.priceMin}`)
      }
      if (filters?.priceMax && filters.priceMax < 500000) {
        query = query.or(`starting_price.lte.${filters.priceMax},base_price_per_day.lte.${filters.priceMax}`)
      }

      const { data, error } = await query
      if (error) {
        throw new Error(error.message)
      }

      // Filter out dummy/archived venues
      const activeRows = ((data ?? []) as any[]).filter((v) => {
        const title = (v.name || v.title || '').trim().toLowerCase()
        const district = (v.district || '').trim().toLowerCase()
        if (district === 'archived' || district === 'dummy') return false
        if (title.includes('deleted') || title.includes('dummy') || title.includes('sample')) return false
        if (v.id && typeof v.id === 'string' && v.id.startsWith('a1000000-0000-0000-0000')) return false
        return true
      })

      return activeRows.map((v) => {
        let rawPhotos: string[] = []
        if (Array.isArray(v.photos) && v.photos.length > 0) {
          rawPhotos = v.photos
        } else if (typeof v.photos === 'string' && v.photos.startsWith('[')) {
          try {
            rawPhotos = JSON.parse(v.photos)
          } catch {
            rawPhotos = []
          }
        } else if (typeof v.photos === 'string' && v.photos.startsWith('http')) {
          rawPhotos = [v.photos]
        } else if (v.image_url) {
          rawPhotos = [v.image_url]
        }

        // Filter to ONLY real Google Maps venue photos (strip unsplash or AI stock)
        const photosArray = rawPhotos.filter(
          (url) =>
            typeof url === 'string' &&
            url.startsWith('http') &&
            !url.includes('unsplash.com') &&
            !url.includes('placeholder') &&
            !url.includes('w36-h36')
        )

        const title = v.name || v.title || 'Auditorium'
        const startingPrice = Number(v.starting_price || v.base_price_per_day || 40000)
        const capacity = Number(v.capacity || v.seating_capacity || 500)
        const district = v.district || 'Kerala'
        const city = v.city || v.district || 'Kerala'

        return {
          ...v,
          id: v.id || v.slug,
          owner_id: v.owner_id || null,
          city_id: v.city_id || null,
          title,
          name: title,
          slug: v.slug || title.toLowerCase().replace(/\s+/g, '-'),
          district,
          city,
          address: v.address || `${city}, ${district}, Kerala`,
          phone_number: v.phone_number || v.phone || null,
          starting_price: startingPrice,
          base_price_per_day: startingPrice,
          capacity,
          seating_capacity: capacity,
          floating_capacity: v.floating_capacity || null,
          latitude: v.latitude ? Number(v.latitude) : null,
          longitude: v.longitude ? Number(v.longitude) : null,
          photos: photosArray,
          description: v.description || `Premier wedding auditorium located at ${v.address || city}.`,
          amenities: Array.isArray(v.amenities) ? v.amenities : [],
          verified: v.verified ?? v.is_verified ?? false,
          is_verified: v.is_verified ?? v.verified ?? false,
          is_claimed: v.is_claimed ?? false,
          created_at: v.created_at || new Date().toISOString(),
          cities: {
            id: district.toLowerCase(),
            name: city !== district ? `${city}, ${district}` : district,
            slug: district.toLowerCase(),
            state: 'Kerala',
          },
        }
      })
    },
    staleTime: 5 * 60 * 1000,
  })
}
