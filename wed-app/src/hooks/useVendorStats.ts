import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface VendorStats {
  inquiries: number
  upcomingBookings: number
  totalRevenue: number
  auditoriumIds: string[]
}

export function useVendorStats(vendorId?: string) {
  return useQuery({
    queryKey: ['vendor_stats', vendorId],
    queryFn: async (): Promise<VendorStats> => {
      if (!vendorId) {
        return { inquiries: 0, upcomingBookings: 0, totalRevenue: 0, auditoriumIds: [] }
      }

      // Step 1: get vendor's auditorium IDs
      const { data: auds, error: audsError } = await supabase
        .from('auditoriums')
        .select('id, base_price_per_day')
        .eq('owner_id', vendorId)

      if (audsError) throw audsError

      const auditoriumIds = (auds ?? []).map((a) => a.id)

      if (auditoriumIds.length === 0) {
        return { inquiries: 0, upcomingBookings: 0, totalRevenue: 0, auditoriumIds: [] }
      }

      // Step 2: parallel queries
      const [pendingRes, upcomingRes, revenueRes] = await Promise.all([
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('booking_status', 'pending')
          .in('auditorium_id', auditoriumIds),
        supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('booking_status', 'confirmed')
          .gte('date', new Date().toISOString().split('T')[0])
          .in('auditorium_id', auditoriumIds),
        supabase
          .from('bookings')
          .select('advance_paid')
          .eq('booking_status', 'confirmed')
          .in('auditorium_id', auditoriumIds),
      ])

      if (pendingRes.error) throw pendingRes.error
      if (upcomingRes.error) throw upcomingRes.error
      if (revenueRes.error) throw revenueRes.error

      const totalRevenue = (revenueRes.data ?? []).reduce(
        (sum, b) => sum + (Number(b.advance_paid) || 0),
        0
      )

      return {
        inquiries: pendingRes.count ?? 0,
        upcomingBookings: upcomingRes.count ?? 0,
        totalRevenue,
        auditoriumIds,
      }
    },
    enabled: !!vendorId,
    staleTime: 2 * 60 * 1000,
  })
}
