import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export interface BookingWithDetails {
  id: string
  date: string
  total_amount: number
  advance_paid: number
  booking_status: 'pending' | 'confirmed' | 'cancelled'
  payment_id: string | null
  created_at: string
  profiles?: {
    full_name: string
    email: string
    phone: string | null
  } | null
  auditoriums?: {
    title: string
    cities?: {
      name: string
    } | null
  } | null
}

export interface CityMetric {
  city: string
  count: number
  revenue: number
}

export interface AdminMetrics {
  totalBookings: number
  confirmedBookings: number
  pendingBookings: number
  cancelledBookings: number
  totalRevenue: number
  platformCommission: number
  vendorPayouts: number
  bookingsByCity: CityMetric[]
  recentBookings: BookingWithDetails[]
}

export function useAdminMetrics() {
  return useQuery<AdminMetrics>({
    queryKey: ['admin_metrics'],
    queryFn: async () => {
      // 1. Fetch all bookings for status and city aggregations
      const { data: allBookings, error: bookingsErr } = await supabase
        .from('bookings')
        .select(`
          id,
          date,
          total_amount,
          advance_paid,
          booking_status,
          payment_id,
          created_at,
          auditoriums (
            title,
            city_id,
            cities (
              name
            )
          )
        `)

      if (bookingsErr) throw bookingsErr

      const list = allBookings || []

      let confirmedCount = 0
      let pendingCount = 0
      let cancelledCount = 0
      let totalRevenue = 0
      const cityMap = new Map<string, { count: number; revenue: number }>()

      list.forEach((b) => {
        if (b.booking_status === 'confirmed') {
          confirmedCount++
          const adv = Number(b.advance_paid) || 0
          totalRevenue += adv

          // City aggregation
          const aud = b.auditoriums as { cities?: { name: string } | null } | null
          const cityName = aud?.cities?.name || 'Unknown'
          const current = cityMap.get(cityName) || { count: 0, revenue: 0 }
          cityMap.set(cityName, {
            count: current.count + 1,
            revenue: current.revenue + adv,
          })
        } else if (b.booking_status === 'pending') {
          pendingCount++
        } else if (b.booking_status === 'cancelled') {
          cancelledCount++
        }
      })

      const bookingsByCity: CityMetric[] = Array.from(cityMap.entries()).map(
        ([city, data]) => ({
          city,
          count: data.count,
          revenue: data.revenue,
        })
      )

      // 2. Fetch last 10 bookings with user and auditorium details
      const { data: recent, error: recentErr } = await supabase
        .from('bookings')
        .select(`
          id,
          date,
          total_amount,
          advance_paid,
          booking_status,
          payment_id,
          created_at,
          profiles (
            full_name,
            email,
            phone
          ),
          auditoriums (
            title,
            cities (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (recentErr) throw recentErr

      return {
        totalBookings: list.length,
        confirmedBookings: confirmedCount,
        pendingBookings: pendingCount,
        cancelledBookings: cancelledCount,
        totalRevenue,
        platformCommission: totalRevenue * 0.1,
        vendorPayouts: totalRevenue * 0.9,
        bookingsByCity,
        recentBookings: (recent as unknown as BookingWithDetails[]) || [],
      }
    },
    staleTime: 60 * 1000,
  })
}

export default useAdminMetrics
