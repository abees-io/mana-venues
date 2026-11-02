import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { City } from '../lib/types'

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (error) throw error
      return (data ?? []) as City[]
    },
    staleTime: Infinity,
  })
}
