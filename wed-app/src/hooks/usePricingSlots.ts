import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { PricingSlot } from '../lib/types'

export function usePricingSlots(
  auditoriumId: string,
  monthStart: Date,
  monthEnd: Date
) {
  return useQuery({
    queryKey: ['pricing_slots', auditoriumId, format(monthStart, 'yyyy-MM')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pricing_slots')
        .select('*')
        .eq('auditorium_id', auditoriumId)
        .gte('date', format(monthStart, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'))
      if (error) throw error
      return (data ?? []) as PricingSlot[]
    },
    enabled: !!auditoriumId,
    staleTime: 2 * 60 * 1000,
  })
}
