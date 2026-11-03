import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, CalendarDays, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCityStore } from '../../store/cityStore'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const selectedCity = useCityStore((state) => state.selectedCity)

  const citySlug = selectedCity?.slug ?? 'kochi'
  const pathname = location.pathname
  const searchParams = location.search

  const isHomeActive = pathname === '/'
  const isSearchActive = pathname.startsWith('/city')
  const isBookingsActive = pathname === '/profile' && searchParams.includes('tab=bookings')
  const isProfileActive = pathname === '/profile' && !searchParams.includes('tab=bookings')

  const tabs = [
    {
      label: 'Home',
      icon: Home,
      isActive: isHomeActive,
      onClick: () => navigate('/'),
    },
    {
      label: 'Search',
      icon: Search,
      isActive: isSearchActive,
      onClick: () => navigate(`/city/${citySlug}`),
    },
    {
      label: 'Bookings',
      icon: CalendarDays,
      isActive: isBookingsActive,
      onClick: () => navigate(user ? '/profile?tab=bookings' : '/auth/login'),
    },
    {
      label: 'Profile',
      icon: User,
      isActive: isProfileActive,
      onClick: () => navigate(user ? '/profile' : '/auth/login'),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-brand-dark/95 backdrop-blur-md border-t border-green-900/50 z-50 md:hidden pb-safe"
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.label}
              type="button"
              onClick={tab.onClick}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors ${
                tab.isActive
                  ? 'text-brand-secondary font-semibold'
                  : 'text-green-300/60 hover:text-green-100'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-[11px] leading-tight">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
