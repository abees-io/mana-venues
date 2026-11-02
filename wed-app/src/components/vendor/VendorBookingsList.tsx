import { CalendarDays, Phone } from 'lucide-react'
import type { VendorBooking } from '../../hooks/useVendorBookings'
import { formatCurrency, formatDate } from '../../lib/utils'

export interface VendorBookingsListProps {
  bookings: VendorBooking[]
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 capitalize">
          Confirmed
        </span>
      )
    case 'pending':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200 capitalize">
          Pending
        </span>
      )
    case 'cancelled':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 capitalize">
          Cancelled
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 capitalize">
          {status}
        </span>
      )
  }
}

export function VendorBookingsList({ bookings }: VendorBookingsListProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mb-3">
          <CalendarDays className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-brand-dark">No upcoming bookings</h3>
        <p className="text-sm text-gray-500 mt-1">Bookings for your venues will appear here as they are confirmed.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50/75 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <tr>
              <th scope="col" className="px-6 py-3.5">Date</th>
              <th scope="col" className="px-6 py-3.5">Venue</th>
              <th scope="col" className="px-6 py-3.5">Customer</th>
              <th scope="col" className="px-6 py-3.5">Phone</th>
              <th scope="col" className="px-6 py-3.5">Amount</th>
              <th scope="col" className="px-6 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {bookings.map((booking) => (
              <tr key={booking.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 font-medium text-brand-dark">
                  {formatDate(booking.date)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                  {booking.auditoriums?.title || '—'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-900 font-medium">
                  {booking.profiles?.full_name || 'Customer'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                  {booking.profiles?.phone ? (
                    <span className="inline-flex items-center gap-1.5 text-gray-700">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {booking.profiles.phone}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 font-semibold text-brand-dark">
                  {formatCurrency(booking.advance_paid)}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(booking.booking_status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VendorBookingsList
