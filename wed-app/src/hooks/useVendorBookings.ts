import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Booking } from '../lib/types'

export interface VendorBookingCustomer {
  full_name: string | null
  phone: string | null
  email: string | null
}

export interface VendorBookingAuditorium {
  title: string
}

export interface VendorBooking extends Booking {
  auditoriums: VendorBookingAuditorium | null
  profiles: VendorBookingCustomer | null
}

export function useVendorBookings(auditoriumIds: string[], showAll: boolean = false) {
  return useQuery({
    queryKey: ['vendor_bookings', auditoriumIds, showAll],
    queryFn: async (): Promise<VendorBooking[]> => {
      if (auditoriumIds.length === 0) return []
      const today = new Date().toISOString().split('T')[0]
      let query = supabase
        .from('bookings')
        .select('*, auditoriums(title), profiles(full_name, phone, email)')
        .in('auditorium_id', auditoriumIds)

      if (!showAll) {
        query = query
          .eq('booking_status', 'confirmed')
          .gte('date', today)
          .order('date', { ascending: true })
          .limit(20)
      } else {
        query = query.order('date', { ascending: false }).limit(50)
      }

      const { data, error } = await query
      if (error) throw error
      return (data ?? []) as unknown as VendorBooking[]
    },
    enabled: auditoriumIds.length > 0,
    staleTime: 2 * 60 * 1000,
  })
}
