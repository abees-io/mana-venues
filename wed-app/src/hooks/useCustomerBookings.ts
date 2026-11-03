import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type { Booking } from '../lib/types'

export interface CustomerBookingWithAuditorium extends Booking {
  auditoriums?: {
    id: string
    title: string
    address: string | null
    photos: string[] | null
    cities?: {
      name: string
    } | null
  } | null
}

export function useCustomerBookings() {
  const { user } = useAuth()

  return useQuery<CustomerBookingWithAuditorium[]>({
    queryKey: ['customer_bookings', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          auditoriums (
            id,
            title,
            address,
            photos,
            cities (
              name
            )
          )
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      return (data as unknown as CustomerBookingWithAuditorium[]) || []
    },
    enabled: !!user?.id,
  })
}
