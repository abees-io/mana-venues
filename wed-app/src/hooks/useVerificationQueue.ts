import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Auditorium } from '../lib/types'

export interface AuditoriumWithVendor extends Auditorium {
  cities?: {
    name: string
  } | null
  profiles?: {
    full_name: string
    email: string
    phone: string | null
  } | null
}

export function useVerificationQueue() {
  const queryClient = useQueryClient()

  const queueQuery = useQuery<AuditoriumWithVendor[]>({
    queryKey: ['verification_queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('auditoriums')
        .select(`
          *,
          cities (
            name
          ),
          profiles (
            full_name,
            email,
            phone
          )
        `)
        .eq('verified', false)
        .order('created_at', { ascending: true })

      if (error) throw error
      return (data as unknown as AuditoriumWithVendor[]) || []
    },
    staleTime: 30 * 1000,
  })

  const approveMutation = useMutation({
    mutationFn: async ({ id, vendorPhone, title }: { id: string; vendorPhone?: string | null; title: string }) => {
      const { error } = await supabase
        .from('auditoriums')
        .update({ verified: true })
        .eq('id', id)

      if (error) throw error

      // WhatsApp / SMS placeholder trigger
      console.log(
        `[WhatsApp/SMS Gateway] Venue Verified! Sent confirmation to ${
          vendorPhone || 'vendor'
        }: "Congratulations! Your venue '${title}' is now approved and live on WedBook."`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification_queue'] })
      queryClient.invalidateQueries({ queryKey: ['auditoriums'] })
      queryClient.invalidateQueries({ queryKey: ['admin_metrics'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({
      id,
      vendorPhone,
      title,
      reason,
    }: {
      id: string
      vendorPhone?: string | null
      title: string
      reason: string
    }) => {
      const { error } = await supabase
        .from('auditoriums')
        .update({ verified: false })
        .eq('id', id)

      if (error) throw error

      // WhatsApp / SMS placeholder trigger
      console.log(
        `[WhatsApp/SMS Gateway] Venue Needs Revision. Sent notification to ${
          vendorPhone || 'vendor'
        }: "WedBook update on '${title}': Action required - ${reason}"`
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification_queue'] })
      queryClient.invalidateQueries({ queryKey: ['auditoriums'] })
    },
  })

  return {
    auditoriums: queueQuery.data || [],
    isLoading: queueQuery.isLoading,
    isRefetching: queueQuery.isRefetching,
    refetch: queueQuery.refetch,
    approveAuditorium: approveMutation.mutateAsync,
    isApproving: approveMutation.isPending,
    rejectAuditorium: rejectMutation.mutateAsync,
    isRejecting: rejectMutation.isPending,
  }
}

export default useVerificationQueue
