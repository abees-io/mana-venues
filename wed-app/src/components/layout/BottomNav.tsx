import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Search, User } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCityStore } from '../../store/cityStore'

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const selectedCity = useCityStore((state) => state.selectedCity)

  const citySlug = selectedCity?.slug ?? 'kochi'
  const pathname = location.pathname

  const isHomeActive = pathname === '/'
  const isSearchActive = pathname.startsWith('/city')
  const isProfileActive = pathname === '/profile'

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
      label: 'Profile',
      icon: User,
      isActive: isProfileActive,
      onClick: () => navigate(user ? '/profile' : '/auth/login'),
    },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] z-50 md:hidden pb-safe"
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
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                tab.isActive
                  ? 'text-brand-primary font-bold'
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
  )
}
