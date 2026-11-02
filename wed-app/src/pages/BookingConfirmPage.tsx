import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle, ArrowLeft, User } from 'lucide-react'
import { format } from 'date-fns'
import Layout from '../components/layout/Layout'
import { supabase } from '../lib/supabase'
import { formatCurrency } from '../lib/utils'

interface BookingConfirmationDetails {
  id: string
  customer_id: string | null
  auditorium_id: string | null
  date: string
  total_amount: number
  advance_paid: number
  booking_status: string
  payment_id: string | null
  created_at: string
  auditoriums?: {
    title: string
    cities?: {
      name: string
    } | null
  } | null
  profiles?: {
    full_name: string
  } | null
}

export default function BookingConfirmPage() {
  const [searchParams] = useSearchParams()
  const bookingId = searchParams.get('id')

  const [booking, setBooking] = useState<BookingConfirmationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!bookingId) {
      setError('No booking ID provided.')
      setLoading(false)
      return
    }

    const currentBookingId = bookingId
    let isMounted = true

    async function fetchBooking() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*, auditoriums(title, cities(name)), profiles(full_name)')
          .eq('id', currentBookingId)
          .single()

        if (!isMounted) return

        if (fetchError) {
          setError(fetchError.message || 'Booking not found.')
        } else if (!data) {
          setError('Booking not found.')
        } else {
          setBooking(data as unknown as BookingConfirmationDetails)
        }
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load booking details.')
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchBooking()

    return () => {
      isMounted = false
    }
  }, [bookingId])

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary mb-3" />
          <p className="text-gray-600 font-medium">Loading booking confirmation...</p>
        </div>
      </Layout>
    )
  }

  if (error || !booking) {
    return (
      <Layout>
        <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-lg text-center border border-gray-100">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 text-sm mb-6">
            {error || "We couldn't find the booking you are looking for."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </Layout>
    )
  }

  const formattedDate = booking.date
    ? format(
        booking.date.includes('T') ? new Date(booking.date) : new Date(booking.date + 'T00:00:00'),
        'd MMM yyyy'
      )
    : 'N/A'

  const remainingBalance = booking.total_amount - booking.advance_paid

  return (
    <Layout>
      <div className="max-w-lg mx-auto my-12 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          {/* Green Checkmark */}
          <div className="flex justify-center mb-4">
            <CheckCircle2 size={64} className="text-green-500 animate-bounce-short" />
          </div>

          <h1 className="text-3xl font-bold text-brand-dark">Booking Confirmed!</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Your wedding venue is reserved!
          </p>

          {/* Details Grid */}
          <div className="bg-gray-50 rounded-xl p-5 my-6 text-left divide-y divide-gray-200/60 text-sm">
            <div className="flex justify-between py-2.5">
              <span className="text-gray-500">Booking ID</span>
              <span className="font-mono font-bold text-gray-900 tracking-wider">
                {booking.id.slice(0, 8).toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between py-2.5">
              <span className="text-gray-500">Venue</span>
              <span className="font-semibold text-gray-900 text-right">
                {booking.auditoriums?.title || 'Wedding Auditorium'}
              </span>
            </div>

            <div className="flex justify-between py-2.5">
              <span className="text-gray-500">City</span>
              <span className="font-medium text-gray-900">
                {booking.auditoriums?.cities?.name || 'Kerala'}
              </span>
            </div>

            <div className="flex justify-between py-2.5">
              <span className="text-gray-500">Date</span>
              <span className="font-semibold text-gray-900">{formattedDate}</span>
            </div>

            <div className="flex justify-between py-2.5">
              <span className="text-gray-500">Advance Paid</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(booking.advance_paid)}
              </span>
            </div>

            <div className="flex justify-between py-2.5">
              <span className="text-gray-500">Remaining Balance</span>
              <span className="font-medium text-gray-700">
                {formatCurrency(remainingBalance)}
              </span>
            </div>

            <div className="flex justify-between py-2.5 items-center">
              <span className="text-gray-500">Payment ID</span>
              <span className="font-mono text-xs text-gray-700 bg-gray-200/70 px-2 py-0.5 rounded max-w-[200px] truncate">
                {booking.payment_id || 'N/A'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/profile"
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-white bg-brand-primary hover:bg-brand-primary/95 transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              <span>View Profile</span>
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
