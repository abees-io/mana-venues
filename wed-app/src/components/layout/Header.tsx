import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Search, ChevronDown, User, LogOut } from 'lucide-react'
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

  const userInitial = (profile?.full_name?.[0] || user?.email?.[0] || 'U').toUpperCase()

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo + City Selector */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="MANA Venues"
              className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
            />
            <span
              className="text-lg font-bold tracking-widest text-brand-primary leading-tight hidden sm:block"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}
            >
              MANA <span className="text-brand-secondary">VENUES</span>
            </span>
          </Link>

          {/* City Badge Button */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-accent hover:bg-pink-100 text-brand-dark transition-colors text-xs sm:text-sm font-medium border border-pink-200/60"
            aria-label="Select City"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary shrink-0" />
            <span className="max-w-[100px] sm:max-w-none truncate">
              {selectedCity?.name ?? 'Select City'}
            </span>
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
          </button>
        </div>

        {/* Center: Search Bar (Desktop / Tablet) */}
        <div className="hidden sm:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues, cities..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all text-brand-dark placeholder-gray-400"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Right: Auth Buttons or User Avatar Dropdown */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <div className="w-9 h-9 rounded-full bg-brand-primary text-white font-semibold text-sm flex items-center justify-center shadow-sm">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-brand-dark truncate">
                      {profile?.full_name || user.email}
                    </p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-accent hover:text-brand-primary transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile & Bookings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-brand-primary border border-brand-primary/40 rounded-lg hover:bg-brand-accent transition-colors"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="px-3.5 py-1.5 text-xs sm:text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors shadow-sm"
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
