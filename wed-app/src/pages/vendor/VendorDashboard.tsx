import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import {
  ClipboardList,
  CalendarCheck,
  IndianRupee,
  Building2,
  PlusCircle,
  Plus,
  Loader2,
  Settings,
  Camera,
  UtensilsCrossed,
  Sparkles,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import VendorStatsCard from '../../components/vendor/VendorStatsCard'
import VendorBookingsList from '../../components/vendor/VendorBookingsList'
import VendorCalendarSync from '../../components/vendor/VendorCalendarSync'
import AddVenueModal from '../../components/modals/AddVenueModal'
import PackageFormModal from '../../components/modals/PackageFormModal'
import { useVendorStats } from '../../hooks/useVendorStats'
import { useVendorBookings } from '../../hooks/useVendorBookings'
import { useAuth } from '../../contexts/AuthContext'
import { formatCurrency } from '../../lib/utils'
import { usePackagesStore } from '../../store/packagesStore'
import { useCateringStore } from '../../store/cateringStore'
import { usePhotographyStore } from '../../store/photographyStore'
import { useMakeupStore } from '../../store/makeupStore'

const getVendorCategoryTitle = (type?: string | null) => {
  switch (type) {
    case 'wedding_planner':
    case 'destination_wedding':
      return 'Wedding Event Planner'
    case 'catering':
      return 'Catering & Feasts Partner'
    case 'photographer':
      return 'Wedding Photography & Cinema'
    case 'bridal_makeup':
      return 'Bridal & Makeup Artist'
    default:
      return 'Verified Wedding Vendor'
  }
}

export default function VendorDashboard() {
  const { profile, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const [isAddVenueOpen, setIsAddVenueOpen] = useState(false)
  const [isPkgModalOpen, setIsPkgModalOpen] = useState(false)

  const statsQuery = useVendorStats(profile?.id)
  const auditoriumIds = statsQuery.data?.auditoriumIds ?? []
  const bookingsQuery = useVendorBookings(auditoriumIds, showAll)

  // Category-specific store data for non-hall vendors
  const weddingPackages = usePackagesStore((s) => s.packages)
  const cateringPackages = useCateringStore((s) => s.packages)
  const photoPackages = usePhotographyStore((s) => s.packages)
  const makeupPackages = useMakeupStore((s) => s.packages)

  const vendorType = profile?.vendor_type
  const isServiceVendor = Boolean(
    vendorType === 'wedding_planner' ||
    vendorType === 'destination_wedding' ||
    vendorType === 'catering' ||
    vendorType === 'photographer' ||
    vendorType === 'bridal_makeup'
  )

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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-200/80 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-dark">
                Welcome back, {profile?.business_name || profile?.full_name || 'Vendor'} 👋
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#7E1F3E]/10 text-[#7E1F3E] border border-[#7E1F3E]/20">
                {getVendorCategoryTitle(profile?.vendor_type)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.business_name && profile?.full_name ? `${profile.full_name} • ` : ''}
              Here is what is happening with your wedding business today, {todayStr}
            </p>
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

        {/* If service vendor (non-hall): show their category's package manager */}
        {isServiceVendor && !hasAuditoriums ? (
          <div className="space-y-6">
            {/* Service Category Package Manager Card */}
            {(vendorType === 'wedding_planner' || vendorType === 'destination_wedding') && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7E1F3E]/10 flex items-center justify-center text-[#7E1F3E]">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-dark">Destination Wedding Packages</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {weddingPackages.filter((p) => p.vendorId === profile?.id).length} packages added by you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsPkgModalOpen(true)}
                      className="inline-flex items-center gap-2 bg-[#C83B68] text-white font-medium px-4 py-2 rounded-xl hover:bg-[#A82B54] transition shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Package
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/packages')}
                      className="inline-flex items-center gap-2 bg-white text-brand-dark border border-gray-200 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View All
                    </button>
                  </div>
                </div>
                {weddingPackages.filter((p) => p.vendorId === profile?.id).length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-medium">No destination packages added yet.</p>
                    <p className="text-xs mt-1">Click "Add Package" to publish your first Kerala destination wedding experience.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {weddingPackages.filter((p) => p.vendorId === profile?.id).slice(0, 5).map((pkg) => (
                      <li key={pkg.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">{pkg.title}</p>
                          <p className="text-xs text-gray-500">{pkg.location} • {pkg.startingPrice}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D8F0EC] text-[#2D6B62] font-semibold capitalize">{pkg.backdrop}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {vendorType === 'catering' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7E1F3E]/10 flex items-center justify-center text-[#7E1F3E]">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-dark">Catering & Feasts</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {cateringPackages.filter((p) => p.vendorId === profile?.id).length} packages added by you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/catering')}
                      className="inline-flex items-center gap-2 bg-[#C83B68] text-white font-medium px-4 py-2 rounded-xl hover:bg-[#A82B54] transition shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Feast
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/catering')}
                      className="inline-flex items-center gap-2 bg-white text-brand-dark border border-gray-200 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View All
                    </button>
                  </div>
                </div>
                {cateringPackages.filter((p) => p.vendorId === profile?.id).length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <UtensilsCrossed className="w-10 h-10 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-medium">No catering packages added yet.</p>
                    <p className="text-xs mt-1">Go to the Catering page to add your first Sadya, Buffet or Live Counter menu.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {cateringPackages.filter((p) => p.vendorId === profile?.id).slice(0, 5).map((pkg) => (
                      <li key={pkg.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">{pkg.title}</p>
                          <p className="text-xs text-gray-500">{pkg.price} • {pkg.guestCount}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D8F0EC] text-[#2D6B62] font-semibold capitalize">{pkg.category}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {vendorType === 'photographer' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7E1F3E]/10 flex items-center justify-center text-[#7E1F3E]">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-dark">Photography Packages</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {photoPackages.filter((p) => p.vendorId === profile?.id).length} packages added by you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/photography')}
                      className="inline-flex items-center gap-2 bg-[#C83B68] text-white font-medium px-4 py-2 rounded-xl hover:bg-[#A82B54] transition shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Package
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/photography')}
                      className="inline-flex items-center gap-2 bg-white text-brand-dark border border-gray-200 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View All
                    </button>
                  </div>
                </div>
                {photoPackages.filter((p) => p.vendorId === profile?.id).length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Camera className="w-10 h-10 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-medium">No photography packages added yet.</p>
                    <p className="text-xs mt-1">Go to the Photography page to add your first package.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {photoPackages.filter((p) => p.vendorId === profile?.id).slice(0, 5).map((pkg) => (
                      <li key={pkg.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">{pkg.title}</p>
                          <p className="text-xs text-gray-500">{pkg.price} • {pkg.duration}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D8F0EC] text-[#2D6B62] font-semibold capitalize">{pkg.category}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {vendorType === 'bridal_makeup' && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#7E1F3E]/10 flex items-center justify-center text-[#7E1F3E]">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-brand-dark">Bridal Makeup Packages</h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {makeupPackages.filter((p) => p.vendorId === profile?.id).length} packages added by you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate('/bridal-makeup')}
                      className="inline-flex items-center gap-2 bg-[#C83B68] text-white font-medium px-4 py-2 rounded-xl hover:bg-[#A82B54] transition shadow-sm text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Package
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/bridal-makeup')}
                      className="inline-flex items-center gap-2 bg-white text-brand-dark border border-gray-200 font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View All
                    </button>
                  </div>
                </div>
                {makeupPackages.filter((p) => p.vendorId === profile?.id).length === 0 ? (
                  <div className="p-10 text-center text-gray-400">
                    <Sparkles className="w-10 h-10 mx-auto opacity-30 mb-3" />
                    <p className="text-sm font-medium">No bridal makeup packages added yet.</p>
                    <p className="text-xs mt-1">Go to the Bridal Makeup page to add your first glam package.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-50">
                    {makeupPackages.filter((p) => p.vendorId === profile?.id).slice(0, 5).map((pkg) => (
                      <li key={pkg.id} className="px-6 py-3 flex items-center justify-between gap-4 hover:bg-gray-50 transition">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">{pkg.title}</p>
                          <p className="text-xs text-gray-500">{pkg.price} • {pkg.duration}</p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D8F0EC] text-[#2D6B62] font-semibold capitalize">{pkg.category.replace('_', ' ')}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        ) : !hasAuditoriums ? (
          <div className="bg-white rounded-2xl p-10 sm:p-12 border border-gray-100 shadow-sm text-center max-w-2xl mx-auto my-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-brand-dark">You haven't listed a hall yet</h2>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              List your auditorium to get discovered by couples across Kerala, manage real-time availability, and receive advance payments securely.
            </p>
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setIsAddVenueOpen(true)}
                className="inline-flex items-center gap-2 bg-brand-primary text-white font-medium px-6 py-3 rounded-xl hover:bg-brand-primary/95 transition shadow-sm"
              >
                <PlusCircle className="w-5 h-5" />
                List Your Hall
              </button>
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
              <button
                type="button"
                onClick={() => setIsAddVenueOpen(true)}
                className="inline-flex items-center gap-2 bg-brand-primary text-white font-medium px-4 py-2.5 rounded-xl hover:bg-brand-primary/90 transition shadow-sm text-sm"
              >
                <Plus className="w-4 h-4" />
                Add New Venue
              </button>
              {firstAuditoriumId && (
                <button
                  type="button"
                  onClick={() => navigate(`/vendor/auditorium/${firstAuditoriumId}`)}
                  className="inline-flex items-center gap-2 bg-white text-brand-dark border border-gray-300 font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition shadow-sm text-sm"
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

            {/* Vendor Calendar & Two-Way iCal Sync Component */}
            {firstAuditoriumId && (
              <div className="pt-4">
                <VendorCalendarSync
                  vendorId={firstAuditoriumId}
                  venueTitle={profile?.business_name || 'My Venue'}
                />
              </div>
            )}
          </>
        )}
      </div>

      <AddVenueModal
        isOpen={isAddVenueOpen}
        onClose={() => setIsAddVenueOpen(false)}
        onSuccess={() => {
          statsQuery.refetch()
        }}
      />

      {/* Wedding Planner Package Form Modal */}
      <PackageFormModal
        isOpen={isPkgModalOpen}
        onClose={() => setIsPkgModalOpen(false)}
      />
    </Layout>
  )
}
