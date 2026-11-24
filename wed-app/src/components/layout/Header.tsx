import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, ChevronDown, User, LogOut, ShieldAlert, LayoutDashboard, Undo2, Redo2, UtensilsCrossed, Store, LayoutGrid, Sparkles } from 'lucide-react'
import CoolCameraIcon from '../common/CoolCameraIcon'
import { useAuth } from '../../contexts/AuthContext'
import { useCityStore } from '../../store/cityStore'
import { usePackagesStore } from '../../store/packagesStore'
import { useHomeMediaStore } from '../../store/homeMediaStore'

export default function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const selectedCity = useCityStore((state) => state.selectedCity)

  const pkgPast = usePackagesStore((s) => s.past)
  const pkgFuture = usePackagesStore((s) => s.future)
  const pkgUndo = usePackagesStore((s) => s.undo)
  const pkgRedo = usePackagesStore((s) => s.redo)

  const homePast = useHomeMediaStore((s) => s.past)
  const homeFuture = useHomeMediaStore((s) => s.future)
  const homeUndo = useHomeMediaStore((s) => s.undo)
  const homeRedo = useHomeMediaStore((s) => s.redo)

  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const categoriesMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
      if (categoriesMenuRef.current && !categoriesMenuRef.current.contains(event.target as Node)) {
        setIsCategoriesMenuOpen(false)
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

  const isPackagesRoute = location.pathname.startsWith('/packages')
  const canUndo = pkgPast.length > 0 || homePast.length > 0
  const canRedo = pkgFuture.length > 0 || homeFuture.length > 0

  const handleGlobalUndo = () => {
    if (isPackagesRoute) {
      if (pkgPast.length > 0) pkgUndo()
      else if (homePast.length > 0) homeUndo()
    } else {
      if (homePast.length > 0) homeUndo()
      else if (pkgPast.length > 0) pkgUndo()
    }
  }

  const handleGlobalRedo = () => {
    if (isPackagesRoute) {
      if (pkgFuture.length > 0) pkgRedo()
      else if (homeFuture.length > 0) homeRedo()
    } else {
      if (homeFuture.length > 0) homeRedo()
      else if (pkgFuture.length > 0) pkgRedo()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-[#F0F9F8]/95 backdrop-blur-sm w-full">
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
              className="text-base sm:text-lg font-bold tracking-widest text-black leading-tight hidden md:block"
              style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.15em' }}
            >
              MANA <span className="text-[#C83B68]">VENUES</span>
            </span>
          </Link>
        </div>

        {/* Center: Search Bar (Desktop / Tablet) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search venues, cities..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#D8F0EC] rounded-full focus:outline-none focus:ring-2 focus:ring-[#C83B68]/30 focus:border-[#C83B68]/50 transition-all text-black placeholder-black/50"
            />
            <Search className="w-4 h-4 text-black/50 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </form>
        </div>

        {/* Right: Auth Buttons or User Avatar Dropdown */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Consolidated Categories Button / Dropdown Menu */}
          <div className="relative" ref={categoriesMenuRef}>
            <Link
              to="/categories"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                location.pathname === '/categories' ||
                location.pathname.startsWith('/packages') ||
                location.pathname.startsWith('/photography') ||
                location.pathname.startsWith('/bridal-makeup') ||
                location.pathname.startsWith('/catering')
                  ? 'bg-[#C83B68] text-white shadow-xs font-bold'
                  : 'text-black bg-white/80 border border-[#D8F0EC] hover:bg-white active:bg-[#D8F0EC]/40'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Categories</span>
            </Link>

            {isCategoriesMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#D8F0EC] py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-3.5 py-2 border-b border-[#D8F0EC]/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Explore Categories
                  </span>
                </div>
                <Link
                  to="/packages"
                  onClick={() => setIsCategoriesMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium hover:bg-[#F0F9F8] transition-colors ${
                    location.pathname === '/packages' ? 'text-[#C83B68] font-bold bg-[#F0F9F8]' : 'text-gray-700'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#C83B68]" />
                  <span>Destination Wedding Packages</span>
                </Link>
                <Link
                  to="/photography"
                  onClick={() => setIsCategoriesMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium hover:bg-[#F0F9F8] transition-colors ${
                    location.pathname === '/photography' ? 'text-[#C83B68] font-bold bg-[#F0F9F8]' : 'text-gray-700'
                  }`}
                >
                  <CoolCameraIcon className="w-4 h-4 text-[#C83B68]" />
                  <span>Photography & Video</span>
                </Link>
                <Link
                  to="/bridal-makeup"
                  onClick={() => setIsCategoriesMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium hover:bg-[#F0F9F8] transition-colors ${
                    location.pathname === '/bridal-makeup' ? 'text-[#C83B68] font-bold bg-[#F0F9F8]' : 'text-gray-700'
                  }`}
                >
                  <span className="text-sm">💄</span>
                  <span>Bridal & Makeup</span>
                </Link>
                <Link
                  to="/catering"
                  onClick={() => setIsCategoriesMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-medium hover:bg-[#F0F9F8] transition-colors ${
                    location.pathname === '/catering' ? 'text-[#C83B68] font-bold bg-[#F0F9F8]' : 'text-gray-700'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4 text-[#C83B68]" />
                  <span>Catering & Banquets</span>
                </Link>
              </div>
            )}
          </div>

          {/* Admin-only Global Undo / Redo Buttons */}
          {user && isAdmin && (
            <div className="inline-flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={!canUndo}
                onClick={handleGlobalUndo}
                title="Undo last admin edit"
                aria-label="Undo"
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-black bg-white/90 hover:bg-white border border-[#D8F0EC] shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Undo2 className="w-3.5 h-3.5 text-[#C83B68]" />
                <span className="hidden lg:inline">Undo</span>
              </button>
              <button
                type="button"
                disabled={!canRedo}
                onClick={handleGlobalRedo}
                title="Redo last admin edit"
                aria-label="Redo"
                className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold text-black bg-white/90 hover:bg-white border border-[#D8F0EC] shadow-2xs disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                <Redo2 className="w-3.5 h-3.5 text-[#C83B68]" />
                <span className="hidden lg:inline">Redo</span>
              </button>
            </div>
          )}

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
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-white/60 transition-colors focus:outline-none"
                aria-expanded={isUserMenuOpen}
                aria-label="User menu"
              >
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#C83B68] text-white font-semibold text-xs sm:text-sm flex items-center justify-center shadow-sm">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-black/70 hidden sm:block" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 sm:w-56 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-[#D8F0EC] py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-[#D8F0EC]">
                    <p className="text-xs text-black/60 font-medium">Signed in as</p>
                    <p className="text-sm font-semibold text-black truncate">
                      {displayName}
                    </p>
                    {isAdmin && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#C83B68]/15 text-[#C83B68] uppercase">
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
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-[#C83B68] hover:bg-[#F0F9F8] transition-colors"
                      >
                        <ShieldAlert className="w-4 h-4 text-[#C83B68]" />
                        <span>Admin Dashboard</span>
                      </Link>

                      <Link
                        to="/admin/verification"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-black hover:bg-[#F0F9F8] hover:text-[#C83B68] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Verification Queue</span>
                      </Link>
                      <div className="border-t border-[#D8F0EC] my-1" />
                    </>
                  )}

                  {isVendor && (
                    <>
                      <Link
                        to="/vendor"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-[#C83B68] hover:bg-[#F0F9F8] transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Vendor Dashboard</span>
                      </Link>
                      <div className="border-t border-[#D8F0EC] my-1" />
                    </>
                  )}

                  {!isVendor && !isAdmin && (
                    <>
                      <Link
                        to="/vendor/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#7E1F3E] font-medium hover:bg-[#F0F9F8] transition-colors"
                      >
                        <Store className="w-4 h-4 text-[#7E1F3E]" />
                        <span>Vendor Register / Portal</span>
                      </Link>
                      <div className="border-t border-[#D8F0EC] my-1" />
                    </>
                  )}

                  <Link
                    to="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-black hover:bg-[#F0F9F8] hover:text-[#C83B68] transition-colors"
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
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                to="/auth/login"
                className="px-2.5 sm:px-3.5 py-1.5 text-xs sm:text-sm font-medium text-black bg-white/80 border border-[#D8F0EC] rounded-lg hover:bg-white active:bg-[#D8F0EC]/40 transition-colors shrink-0"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
