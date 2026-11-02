import { useMutation, useQueryClient } from '@tanstack/react-query'
import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import type { PricingSlotStatus } from '../lib/types'

export function useManagePricingSlots(auditoriumId: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['pricing_slots', auditoriumId] })
    queryClient.invalidateQueries({ queryKey: ['auditorium'] })
  }

  const upsertSlotMutation = useMutation({
    mutationFn: async ({
      date,
      customPrice,
      status,
    }: {
      date: string
      customPrice: number | null
      status: PricingSlotStatus
    }) => {
      const { data, error } = await supabase
        .from('pricing_slots')
        .upsert(
          {
            auditorium_id: auditoriumId,
            date,
            custom_price: customPrice,
            status,
          },
          { onConflict: 'auditorium_id,date' }
        )
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })

  const deleteSlotMutation = useMutation({
    mutationFn: async (date: string) => {
      const { error } = await supabase
        .from('pricing_slots')
        .delete()
        .eq('auditorium_id', auditoriumId)
        .eq('date', date)

      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const blockDateRangeMutation = useMutation({
    mutationFn: async ({
      startDate,
      endDate,
    }: {
      startDate: string
      endDate: string
    }) => {
      const start = parseISO(startDate)
      const end = parseISO(endDate)
      const days = eachDayOfInterval({ start, end })

      const records = days.map((day) => ({
        auditorium_id: auditoriumId,
        date: format(day, 'yyyy-MM-dd'),
        custom_price: null,
        status: 'blocked' as PricingSlotStatus,
      }))

      const { data, error } = await supabase
        .from('pricing_slots')
        .upsert(records, { onConflict: 'auditorium_id,date' })
        .select()

      if (error) throw error
      return data
    },
    onSuccess: invalidate,
  })

  return {
    upsertSlot: upsertSlotMutation.mutateAsync,
    deleteSlot: deleteSlotMutation.mutateAsync,
    blockDateRange: blockDateRangeMutation.mutateAsync,
    isPending:
      upsertSlotMutation.isPending ||
      deleteSlotMutation.isPending ||
      blockDateRangeMutation.isPending,
  }
}
