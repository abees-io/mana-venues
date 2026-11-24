import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, LayoutGrid, User, ShoppingCart, Sparkles, UtensilsCrossed, ChevronUp } from 'lucide-react'
import CoolCameraIcon from '../common/CoolCameraIcon'
import { useAuth } from '../../contexts/AuthContext'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)

  const pathname = location.pathname
  const isVendor = profile?.role === 'vendor'

  const isHomeActive = pathname === '/'
  const isCategoriesActive =
    pathname === '/categories' ||
    pathname.startsWith('/packages') ||
    pathname.startsWith('/photography') ||
    pathname.startsWith('/bridal-makeup') ||
    pathname.startsWith('/catering')
  const isAccountActive = pathname === '/profile' || pathname.startsWith('/vendor') || pathname.startsWith('/auth')
  const isCartActive = pathname === '/cart' || pathname === '/booking/confirm'

  // Close sheet on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
        setIsCategorySheetOpen(false)
      }
    }
    if (isCategorySheetOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isCategorySheetOpen])

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      isActive: isHomeActive,
      onClick: () => {
        setIsCategorySheetOpen(false)
        navigate('/')
      },
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: LayoutGrid,
      isActive: isCategoriesActive,
      onClick: () => {
        setIsCategorySheetOpen(false)
        navigate('/categories')
      },
    },
    {
      id: 'account',
      label: 'Account',
      icon: User,
      isActive: isAccountActive,
      onClick: () => {
        setIsCategorySheetOpen(false)
        navigate(user ? (isVendor ? '/vendor' : '/profile') : '/auth/login')
      },
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: ShoppingCart,
      isActive: isCartActive,
      onClick: () => {
        setIsCategorySheetOpen(false)
        navigate(user ? '/profile' : '/auth/login')
      },
    },
  ]

  return (
    <>
      {/* Category Bottom Sheet Popover (when tapping Categories in mobile nav) */}
      {isCategorySheetOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden animate-fade-in">
          <div
            ref={sheetRef}
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-3xl shadow-2xl border-t border-[#D8F0EC] p-5 space-y-3 animate-in slide-in-from-bottom-5 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                All Categories
              </span>
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <ChevronUp className="w-4 h-4 rotate-180" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsCategorySheetOpen(false)
                  navigate('/packages')
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  pathname.startsWith('/packages')
                    ? 'border-[#C83B68] bg-[#FFF2F6] text-[#C83B68]'
                    : 'border-gray-100 bg-gray-50/70 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <Sparkles className="w-5 h-5 text-[#C83B68]" />
                <span className="text-xs font-bold leading-tight">Event Management & Packages</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCategorySheetOpen(false)
                  navigate('/photography')
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  pathname.startsWith('/photography')
                    ? 'border-[#C83B68] bg-[#FFF2F6] text-[#C83B68]'
                    : 'border-gray-100 bg-gray-50/70 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <CoolCameraIcon className="w-5 h-5 text-[#C83B68]" />
                <span className="text-xs font-bold leading-tight">Photography & Videography</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCategorySheetOpen(false)
                  navigate('/bridal-makeup')
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  pathname.startsWith('/bridal-makeup')
                    ? 'border-[#C83B68] bg-[#FFF2F6] text-[#C83B68]'
                    : 'border-gray-100 bg-gray-50/70 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">💄</span>
                <span className="text-xs font-bold leading-tight">Bridal & Makeup</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsCategorySheetOpen(false)
                  navigate('/catering')
                }}
                className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                  pathname.startsWith('/catering')
                    ? 'border-[#C83B68] bg-[#FFF2F6] text-[#C83B68]'
                    : 'border-gray-100 bg-gray-50/70 text-gray-800 hover:bg-gray-100'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5 text-[#C83B68]" />
                <span className="text-xs font-bold leading-tight">Catering & Banquets</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar matching screenshot: Home, Categories, Account, Cart */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] z-50 md:hidden pb-safe"
        aria-label="Mobile Navigation"
      >
        <div className="flex items-center justify-around h-16 px-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={tab.onClick}
                aria-label={tab.label}
                className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                  tab.isActive
                    ? 'text-[#B8710B] font-bold'
                    : 'text-gray-400 hover:text-gray-600 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${tab.isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span className="text-[11px] leading-tight">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
