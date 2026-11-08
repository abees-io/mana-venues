import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Search, ChevronDown, User, LogOut, ShieldAlert, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCityStore } from '../../store/cityStore'
import LocationModal from '../modals/LocationModal'

export default function Header() {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const selectedCity = useCityStore((state) => state.selectedCity)

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = searchQuery.trim()
    const citySlug = selectedCity?.slug ?? 'kochi'
    if (trimmed) {
      navigate(`/city/${citySlug}?q=${encodeURIComponent(trimmed)}`)
    } else {
      navigate(`/city/${citySlug}`)
    }
  }

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      console.error('Failed to sign out:', err)
    }
  }

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string) || (user?.user_metadata?.name as string) || user?.email
  const userInitial = (displayName?.[0] || 'U').toUpperCase()
  const isAdmin = profile?.role === 'admin' || user?.user_metadata?.role === 'admin'
  const isVendor = profile?.role === 'vendor' || user?.user_metadata?.role === 'vendor'

  return (
    <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-sm border-b border-green-900/40 shadow-lg w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Logo + City Selector */}
        <div className="flex items-center gap-2 sm:gap-4 shrink min-w-0">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src="/logo.svg"
              alt="MANA Venues"
              className="h-8 sm:h-9 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span
              className="text-base sm:text-lg font-bold tracking-widest text-white leading-tight hidden md:block"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}
            >
              MANA <span className="text-brand-secondary">VENUES</span>
            </span>
          </Link>

          {/* City Badge Button */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-green-900/40 hover:bg-green-900/60 text-green-100 transition-colors text-xs sm:text-sm font-medium border border-green-700/40 shrink min-w-0"
            aria-label="Select City"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-secondary shrink-0" />
            <span className="max-w-[75px] xs:max-w-[100px] sm:max-w-none truncate">
              {selectedCity?.name ?? 'Select City'}
            </span>
            <ChevronDown className="w-3 h-3 text-green-400/60 shrink-0" />
          </button>
        </div>

        {/* Center: Search Bar (Desktop / Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues, cities..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-green-900/30 border border-green-700/30 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 focus:border-brand-secondary/50 transition-all text-green-50 placeholder-green-400/50"
            />
            <Search className="w-4 h-4 text-green-400/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Right: Auth Buttons or User Avatar Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Admin Dashboard Link for Admin Users */}
          {user && isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-secondary text-brand-dark hover:bg-brand-secondary/90 shadow-xs transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-brand-dark" />
              <span>Admin Panel</span>
            </Link>
          )}

          {user && isVendor && !isAdmin && (
            <Link
              to="/vendor"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-secondary text-brand-dark hover:bg-brand-secondary/90 shadow-xs transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Vendor Dashboard</span>
            </Link>
          )}

          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-green-900/40 transition-colors focus:outline-none"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-secondary text-brand-dark font-semibold text-xs sm:text-sm flex items-center justify-center shadow-sm">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-green-400/60 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 sm:w-56 max-w-[calc(100vw-1.5rem)] bg-brand-dark rounded-xl shadow-xl border border-green-800/50 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-green-800/40">
                    <p className="text-xs text-green-400/60 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-green-50 truncate">
                      {displayName}
                    </p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-brand-secondary/20 text-brand-secondary uppercase">
                        Super Admin
                      </span>
                    )}
                  </div>

                  {/* Direct Admin Links in Dropdown */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-brand-secondary hover:bg-green-900/40 transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-brand-secondary" />
                        <span>Admin Dashboard</span>
                      </Link>

                      <Link
                        to="/admin/verification"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-green-200 hover:bg-green-900/40 hover:text-brand-secondary transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Verification Queue</span>
                      </Link>
                      <div className="border-t border-green-800/40 my-1" />
                    </>
                  )}

                  {isVendor && (
                    <>
                      <Link
                        to="/vendor"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-brand-secondary hover:bg-green-900/40 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Vendor Dashboard</span>
                      </Link>
                      <div className="border-t border-green-800/40 my-1" />
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-green-200 hover:bg-green-900/40 hover:text-brand-secondary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile & Bookings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/auth/login"
                className="px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-green-100 border border-green-700/40 rounded-lg hover:bg-green-900/40 transition-colors shrink-0"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-brand-dark bg-brand-secondary rounded-lg hover:bg-brand-secondary/90 transition-colors shadow-sm shrink-0"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </header>
  )
}
