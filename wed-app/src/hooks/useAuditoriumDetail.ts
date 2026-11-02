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
      return data
    },
    enabled: !!slug,
  })
}
