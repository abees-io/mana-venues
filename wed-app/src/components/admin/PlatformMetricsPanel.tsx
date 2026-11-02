import {
  CalendarCheck,
  Clock,
  XCircle,
  Layers,
  TrendingUp,
  Percent,
  Banknote,
  MapPin,
  Calendar,
} from 'lucide-react'
import { formatCurrency, formatDate } from '../../lib/utils'
import type { AdminMetrics } from '../../hooks/useAdminMetrics'
import { cn } from '../../lib/utils'

interface PlatformMetricsPanelProps {
  metrics: AdminMetrics
}

export function PlatformMetricsPanel({ metrics }: PlatformMetricsPanelProps) {
  return (
    <div className="space-y-8">
      {/* 1. Booking Status Counters */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Booking Volume
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalBookings}</p>
              <p className="text-xs text-gray-500 font-medium">Total Bookings</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.confirmedBookings}</p>
              <p className="text-xs text-gray-500 font-medium">Confirmed</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.pendingBookings}</p>
              <p className="text-xs text-gray-500 font-medium">Pending Inquiries</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{metrics.cancelledBookings}</p>
              <p className="text-xs text-gray-500 font-medium">Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Financials */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Financial & Commission Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-brand-accent text-brand-primary flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Total Volume (Advance Paid)
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(metrics.totalRevenue)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Gross advance collection via Razorpay</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-brand-secondary/30 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-amber-50/30">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
              <Percent className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-amber-900">
              Platform Commission (10%)
            </p>
            <p className="text-2xl font-bold text-brand-primary mt-1">
              {formatCurrency(metrics.platformCommission)}
            </p>
            <p className="text-xs text-amber-700/80 mt-1">Net revenue retained by WedBook</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Banknote className="w-6 h-6" />
            </div>
            <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Vendor Payouts (90%)
            </p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(metrics.vendorPayouts)}
            </p>
            <p className="text-xs text-gray-400 mt-1">Disbursable to venue hall owners</p>
          </div>
        </div>
      </div>

      {/* 3. City Breakdown & Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* City Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-brand-primary" />
            Performance by City
          </h4>

          {metrics.bookingsByCity.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center">No city data available</p>
          ) : (
            <div className="space-y-4">
              {metrics.bookingsByCity.map((item) => (
                <div
                  key={item.city}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{item.city}</p>
                    <p className="text-xs text-gray-500">{item.count} confirmed booking(s)</p>
                  </div>
                  <p className="text-sm font-bold text-brand-primary">
                    {formatCurrency(item.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Platform Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-brand-primary" />
            Recent Bookings Stream
          </h4>

          {metrics.recentBookings.length === 0 ? (
            <p className="text-sm text-gray-500 py-8 text-center">No bookings recorded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Auditorium</th>
                    <th className="pb-3">Event Date</th>
                    <th className="pb-3">Advance</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {metrics.recentBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/50">
                      <td className="py-3">
                        <p className="font-medium text-gray-800">
                          {b.profiles?.full_name || 'Customer'}
                        </p>
                        <p className="text-xs text-gray-400">{b.profiles?.phone || b.profiles?.email}</p>
                      </td>
                      <td className="py-3">
                        <p className="font-medium text-gray-800">
                          {b.auditoriums?.title || 'Hall'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {b.auditoriums?.cities?.name || 'Kerala'}
                        </p>
                      </td>
                      <td className="py-3 text-xs text-gray-600">
                        {formatDate(b.date)}
                      </td>
                      <td className="py-3 font-semibold text-brand-primary">
                        {formatCurrency(b.advance_paid)}
                      </td>
                      <td className="py-3">
                        <span
                          className={cn(
                            'px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider',
                            b.booking_status === 'confirmed'
                              ? 'bg-green-100 text-green-700'
                              : b.booking_status === 'pending'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-red-100 text-red-700'
                          )}
                        >
                          {b.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlatformMetricsPanel
