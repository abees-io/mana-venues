import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  CalendarDays,
  Edit2,
  Check,
  X,
  MapPin,
  IndianRupee,
  LogOut,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/layout/Layout'
import { useCustomerBookings } from '../hooks/useCustomerBookings'
import { formatCurrency, formatDate } from '../lib/utils'

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, profile, loading: authLoading, signOut, updateProfile } = useAuth()
  const { data: bookings, isLoading: bookingsLoading } = useCustomerBookings()

  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings'>(
    tabParam === 'bookings' ? 'bookings' : 'profile'
  )

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Sync state when profile loads or changes
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '')
      setPhone(profile.phone || '')
    } else if (user) {
      const meta = (user.user_metadata || {}) as Record<string, unknown>
      setFullName((meta.full_name as string) || (meta.name as string) || '')
      setPhone((meta.phone as string) || '')
    }
  }, [profile, user])

  // Sync tab with URL
  useEffect(() => {
    if (tabParam === 'bookings') {
      setActiveTab('bookings')
    } else {
      setActiveTab('profile')
    }
  }, [tabParam])

  const handleTabChange = (tab: 'profile' | 'bookings') => {
    setActiveTab(tab)
    setSearchParams(tab === 'bookings' ? { tab: 'bookings' } : {})
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      await updateProfile({
        full_name: fullName.trim(),
        phone: phone.trim() || undefined,
      })
      setSaveSuccess(true)
      setIsEditing(false)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSaveError(err.message)
      } else {
        setSaveError('Failed to save profile changes.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary" />
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">Sign In Required</h1>
          <p className="text-sm text-gray-600">
            Please log in or register to view your profile and manage your bookings.
          </p>
          <div className="pt-2">
            <Link
              to="/auth/login"
              className="inline-block bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-6 py-2.5 rounded-xl shadow transition-colors"
            >
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const meta = (user.user_metadata || {}) as Record<string, unknown>
  const displayName =
    profile?.full_name ||
    (meta.full_name as string) ||
    (meta.name as string) ||
    'Valued Guest'
  const displayPhone = profile?.phone || (meta.phone as string) || 'Not provided'
  const displayEmail = user.email || profile?.email || ''
  const displayRole = profile?.role || (meta.role as string) || 'customer'
  const userInitial = (displayName[0] || 'U').toUpperCase()

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Profile Header Banner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-primary to-rose-900 text-white flex items-center justify-center font-bold text-3xl shadow-md border-2 border-brand-secondary/30">
              {userInitial}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold text-brand-dark tracking-tight">
                  {displayName}
                </h1>
                <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-accent text-brand-primary border border-brand-primary/20">
                  {displayRole}
                </span>
              </div>
              <p className="text-sm text-gray-500">{displayEmail}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Success / Error Banners */}
        {saveSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl text-sm flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600 shrink-0" />
            <span>Profile updated successfully!</span>
          </div>
        )}

        {saveError && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2">
            <X className="w-5 h-5 text-red-500 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('bookings')}
            className={`flex items-center gap-2 py-3 px-6 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'bookings'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>My Bookings</span>
            {bookings && bookings.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-accent text-brand-primary text-xs font-bold flex items-center justify-center">
                {bookings.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-brand-dark">Personal Information</h2>
                <p className="text-xs text-gray-500">Manage your saved details and contact preferences</p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-brand-primary bg-brand-accent hover:bg-pink-100 rounded-lg transition-colors border border-brand-primary/20"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-5 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Used for booking updates and WhatsApp confirmations.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={displayEmail}
                    disabled
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Email address is tied to your login account.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-semibold py-2 px-5 rounded-xl transition-colors shadow disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      setFullName(profile?.full_name || '')
                      setPhone(profile?.phone || '')
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-brand-primary flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Full Name
                    </p>
                    <p className="text-base font-semibold text-brand-dark mt-0.5">
                      {displayName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Email Address
                    </p>
                    <p className="text-base font-semibold text-brand-dark mt-0.5">
                      {displayEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Phone Number
                    </p>
                    <p className="text-base font-semibold text-brand-dark mt-0.5">
                      {displayPhone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 p-4 rounded-xl bg-gray-50/70 border border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Account Type
                    </p>
                    <p className="text-base font-semibold text-brand-dark capitalize mt-0.5">
                      {displayRole} Account
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: My Bookings */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookingsLoading ? (
              <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto" />
                <p className="text-sm text-gray-500">Loading your venue bookings...</p>
              </div>
            ) : bookings && bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const auditorium = booking.auditoriums
                  const firstPhoto =
                    auditorium?.photos && auditorium.photos.length > 0
                      ? auditorium.photos[0]
                      : null

                  const statusConfig = {
                    confirmed: {
                      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      label: 'Confirmed',
                    },
                    pending: {
                      bg: 'bg-amber-50 text-amber-700 border-amber-200',
                      label: 'Payment Pending',
                    },
                    cancelled: {
                      bg: 'bg-red-50 text-red-700 border-red-200',
                      label: 'Cancelled',
                    },
                  }[booking.booking_status || 'pending']

                  return (
                    <div
                      key={booking.id}
                      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col md:flex-row"
                    >
                      {/* Photo Thumbnail */}
                      <div className="md:w-56 h-40 md:h-auto bg-gray-100 shrink-0 relative overflow-hidden">
                        {firstPhoto ? (
                          <img
                            src={firstPhoto}
                            alt={auditorium?.title || 'Auditorium'}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 bg-brand-accent/40">
                            <Calendar className="w-8 h-8 text-brand-primary/40" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
                            >
                              {statusConfig.label}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              Ref: {booking.id.slice(0, 8).toUpperCase()}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-brand-dark">
                            {auditorium?.title || 'Wedding Auditorium'}
                          </h3>

                          {auditorium?.address && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                              <span>{auditorium.address}</span>
                              {auditorium.cities?.name && (
                                <span className="font-medium text-brand-dark">
                                  ({auditorium.cities.name})
                                </span>
                              )}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-xs">
                          <div>
                            <p className="text-gray-400 font-medium">Event Date</p>
                            <p className="font-bold text-brand-dark mt-0.5">
                              {formatDate(booking.date)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium">Total Amount</p>
                            <p className="font-bold text-brand-dark mt-0.5">
                              {formatCurrency(booking.total_amount)}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 font-medium">Advance Paid</p>
                            <p className="font-bold text-emerald-600 mt-0.5">
                              {formatCurrency(booking.advance_paid || 0)}
                            </p>
                          </div>
                        </div>

                        {auditorium?.id && (
                          <div className="pt-2 flex justify-end">
                            <Link
                              to={`/venue/${auditorium.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline"
                            >
                              <span>View Venue Details</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-10 border border-gray-100 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center mx-auto">
                  <CalendarDays className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-dark">No Bookings Yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
                    When you reserve a wedding hall or auditorium on MANA Venues, your booking details and receipts will appear here.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold rounded-xl shadow transition-colors"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>Explore Wedding Venues</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
