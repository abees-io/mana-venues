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

  const displayName =
    profile?.full_name ||
    (user?.user_metadata?.full_name as string) ||
    (user?.user_metadata?.name as string) ||
    user?.email
  const userInitial = (displayName?.[0] || 'U').toUpperCase()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-100 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

        {/* Left: Logo + City */}
        <div className="flex items-center gap-4 shrink min-w-0">
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <img
              src="/logo.png"
              alt="MANA Venues"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span
              className="text-sm sm:text-base font-semibold tracking-[0.2em] text-brand-dark hidden md:block"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              MANA <span className="text-brand-secondary">VENUES</span>
            </span>
          </Link>

          {/* City selector — hairline pill */}
          <button
            type="button"
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 hover:border-brand-secondary hover:text-brand-secondary transition-colors rounded-sm shrink min-w-0"
            aria-label="Select City"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="max-w-[80px] sm:max-w-none truncate">
              {selectedCity?.name ?? 'Select City'}
            </span>
            <ChevronDown className="w-3 h-3 shrink-0 opacity-50" />
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-sm mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues, cities..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-neutral-50 border border-neutral-200 focus:outline-none focus:border-brand-secondary focus:bg-white transition-all text-brand-dark placeholder-neutral-400 rounded-sm"
            />
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-1 rounded-sm hover:bg-neutral-50 transition-colors focus:outline-none"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-sm bg-brand-dark text-white font-semibold text-xs flex items-center justify-center">
                  {userInitial}
                </div>
                <ChevronDown className="w-3 h-3 text-neutral-400 hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-100 shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">Signed in as</p>
                    <p className="text-sm font-medium text-brand-dark truncate mt-0.5">{displayName}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-600 hover:text-brand-dark hover:bg-neutral-50 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Profile & Bookings</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/auth/login"
                className="px-3 py-1.5 text-xs font-medium text-brand-dark border border-neutral-200 hover:border-brand-secondary hover:text-brand-secondary transition-colors rounded-sm"
              >
                Login
              </Link>
              <Link
                to="/auth/register"
                className="px-3 py-1.5 text-xs font-medium text-white bg-brand-dark hover:bg-brand-secondary transition-colors rounded-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </header>
  )
}
