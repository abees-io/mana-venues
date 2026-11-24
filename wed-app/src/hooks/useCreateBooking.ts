import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

export interface CreateBookingPayload {
  auditoriumId: string
  auditoriumTitle: string
  date: Date
  totalAmount: number
  advanceAmount: number
}

interface RazorpayResponse {
  razorpay_payment_id: string
}

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  prefill: {
    name: string
    email: string
    contact: string
  }
  theme: {
    color: string
  }
  handler: (response: RazorpayResponse) => Promise<void> | void
  modal: {
    ondismiss: () => Promise<void> | void
  }
}

interface RazorpayConstructor {
  new (opts: RazorpayOptions): { open: () => void }
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { user, profile } = useAuth()

  const mutation = useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      if (!user || !profile) throw new Error('Not authenticated')

      const dateStr = format(payload.date, 'yyyy-MM-dd')

      // 1. First initiate date hold via API route (calls hold_booking_dates RPC)
      // or directly invoke hold_booking_dates RPC function
      const { data: holdSuccess, error: holdError } = await (supabase.rpc as any)('hold_booking_dates', {
        p_vendor_id: payload.auditoriumId,
        p_dates: [dateStr],
        p_booking_id: null,
      })

      if (holdError || holdSuccess === false) {
        throw new Error('This date was just locked or booked by another customer. Please choose another date.')
      }

      // 2. Insert pending booking
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_id: user.id,
          auditorium_id: payload.auditoriumId,
          date: dateStr,
          total_amount: payload.totalAmount,
          advance_paid: 0,
          booking_status: 'pending',
        })
        .select()
        .single()

      if (bookingError) throw bookingError
      if (!booking) throw new Error('Failed to create booking record')

      // 2. Open Razorpay
      return new Promise<string>((resolve, reject) => {
        const Razorpay = (window as unknown as { Razorpay?: RazorpayConstructor }).Razorpay
        if (!Razorpay) {
          // Cancel pending booking if SDK not available
          supabase
            .from('bookings')
            .update({ booking_status: 'cancelled' })
            .eq('id', booking.id)
            .then(
              () => {
                reject(new Error('Razorpay SDK failed to load. Please check your internet connection.'))
              },
              () => {
                reject(new Error('Razorpay SDK failed to load. Please check your internet connection.'))
              }
            )
          return
        }

        const rzpOptions: RazorpayOptions = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
          amount: Math.round(payload.advanceAmount * 100), // paise
          currency: 'INR',
          name: 'MANA Venues',
          description: `Booking: ${payload.auditoriumTitle}`,
          prefill: {
            name: profile.full_name || '',
            email: profile.email || '',
            contact: profile.phone || '',
          },
          theme: { color: '#8B1A4A' },
          handler: async (response: RazorpayResponse) => {
            try {
              // 3. Confirm booking
              const { error: updateError } = await supabase
                .from('bookings')
                .update({
                  payment_id: response.razorpay_payment_id,
                  booking_status: 'confirmed',
                  advance_paid: payload.advanceAmount,
                })
                .eq('id', booking.id)

              if (updateError) {
                reject(updateError)
                return
              }

              // 4. Mark pricing slot as booked and update availability_blocks to booked
              await Promise.all([
                supabase
                  .from('pricing_slots')
                  .upsert(
                    {
                      auditorium_id: payload.auditoriumId,
                      date: dateStr,
                      status: 'booked',
                    },
                    { onConflict: 'auditorium_id,date' }
                  ),
                (supabase
                  .from('availability_blocks' as any)
                  .upsert(
                    {
                      vendor_id: payload.auditoriumId,
                      event_date: dateStr,
                      status: 'booked',
                      booking_id: booking.id,
                      hold_expires_at: null,
                    } as any,
                    { onConflict: 'vendor_id,event_date' }
                  ) as any)
              ])

              // 5. Invalidate queries
              queryClient.invalidateQueries({ queryKey: ['pricing_slots', payload.auditoriumId] })
              queryClient.invalidateQueries({ queryKey: ['availability_blocks', payload.auditoriumId] })
              queryClient.invalidateQueries({ queryKey: ['auditoriums'] })
              queryClient.invalidateQueries({ queryKey: ['auditorium'] })

              resolve(booking.id)
            } catch (err) {
              reject(err instanceof Error ? err : new Error('Failed to complete booking confirmation'))
            }
          },
          modal: {
            ondismiss: async () => {
              // Cancel the pending booking and delete held availability block if user closes modal
              try {
                await Promise.all([
                  supabase
                    .from('bookings')
                    .update({ booking_status: 'cancelled' })
                    .eq('id', booking.id),
                  supabase
                    .from('availability_blocks' as any)
                    .delete()
                    .eq('vendor_id', payload.auditoriumId)
                    .eq('event_date', dateStr)
                    .eq('status', 'held')
                ])
              } catch (err) {
                console.warn('Failed to clean up hold after modal dismissal:', err)
              }
              reject(new Error('Payment cancelled'))
            },
          },
        }

        const rzp = new Razorpay(rzpOptions)
        rzp.open()
      })
    },
    onSuccess: (bookingId: string) => {
      navigate(`/booking/confirm?id=${bookingId}`)
    },
  })

  return mutation
}
