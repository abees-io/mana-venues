import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ClipboardList,
  CalendarCheck,
  IndianRupee,
  Building2,
  PlusCircle,
  Loader2,
  Settings,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import VendorStatsCard from '../../components/vendor/VendorStatsCard'
import VendorBookingsList from '../../components/vendor/VendorBookingsList'
import { useVendorStats } from '../../hooks/useVendorStats'
import { useVendorBookings } from '../../hooks/useVendorBookings'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../lib/utils'

export default function VendorDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)

  const statsQuery = useVendorStats(profile?.id)
  const auditoriumIds = statsQuery.data?.auditoriumIds ?? []
  const bookingsQuery = useVendorBookings(auditoriumIds, showAll)

  const todayStr = format(new Date(), 'd MMM yyyy')
  const firstAuditoriumId = auditoriumIds[0]

  if (authLoading || (statsQuery.isLoading && !statsQuery.data)) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
          <p className="mt-3 text-sm text-gray-500 font-medium">Loading vendor dashboard...</p>
        </div>
      </Layout>
    )
  }

  const hasAuditoriums = auditoriumIds.length > 0
  const stats = statsQuery.data ?? {
    inquiries: 0,
    upcomingBookings: 0,
    totalRevenue: 0,
    auditoriumIds: [],
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
              Welcome back, {profile?.full_name || 'Vendor'} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">Here is what is happening with your halls today, {todayStr}</p>
          </div>
          {hasAuditoriums && firstAuditoriumId && (
            <button
              onClick={() => navigate(`/vendor/auditorium/${firstAuditoriumId}`)}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-brand-primary bg-white border border-brand-primary/20 hover:bg-brand-accent px-4 py-2 rounded-xl transition shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Venue Settings
            </button>
          )}
        </div>

        {/* If no auditoriums listed yet: onboarding card */}
        {!hasAuditoriums ? (
          <div className="bg-white rounded-2xl p-10 sm:p-12 border border-gray-100 shadow-sm text-center max-w-2xl mx-auto my-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">You haven't listed a hall yet</h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              List your auditorium to get discovered by couples across Kerala, manage real-time availability, and receive advance payments securely.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                to="/vendor/auditorium/new"
                className="inline-flex items-center gap-2 bg-brand-primary text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-primary/95 transition shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                List Your Hall
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <VendorStatsCard
                icon={<ClipboardList className="w-6 h-6" />}
                label="Inquiries"
                value={stats.inquiries}
                color="bg-blue-100 text-blue-600"
              />
              <VendorStatsCard
                icon={<CalendarCheck className="w-6 h-6" />}
                label="Upcoming Bookings"
                value={stats.upcomingBookings}
                color="bg-green-100 text-green-600"
              />
              <VendorStatsCard
                icon={<IndianRupee className="w-6 h-6" />}
                label="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                color="bg-brand-accent text-brand-primary"
              />
            </div>

            {/* Quick Actions Row */}
            <div className="flex flex-wrap items-center gap-3">
              {firstAuditoriumId && (
                <button
                  type="button"
                  onClick={() => navigate(`/vendor/auditorium/${firstAuditoriumId}`)}
                  className="inline-flex items-center gap-2 bg-brand-primary text-white font-medium px-4 py-2.5 rounded-xl hover:bg-brand-primary/90 transition shadow-sm text-sm"
                >
                  <Building2 className="w-4 h-4" />
                  Manage My Hall
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowAll((prev) => !prev)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                  showAll
                    ? 'bg-brand-dark text-white border-brand-dark'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {showAll ? 'Showing All Bookings' : 'View All Bookings'}
              </button>
            </div>

            {/* Bookings Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-brand-dark">
                    {showAll ? 'All Bookings' : 'Upcoming Bookings'}
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {showAll
                      ? 'All past and upcoming bookings for your venues'
                      : 'Confirmed reservations scheduled for future dates'}
                  </p>
                </div>
                {bookingsQuery.isFetching && (
                  <span className="text-xs text-gray-400 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Updating...
                  </span>
                )}
              </div>

              {bookingsQuery.isLoading ? (
                <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-primary mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading bookings...</p>
                </div>
              ) : (
                <VendorBookingsList bookings={bookingsQuery.data ?? []} />
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
