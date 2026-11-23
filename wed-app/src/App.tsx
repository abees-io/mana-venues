import { useEffect } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { LoginGateProvider } from './contexts/LoginGateContext'
import { router } from './router'
import { ManaSplashTransition } from './components/common/ManaSplashTransition'
import { useHomeMediaStore } from './store/homeMediaStore'
import { usePackagesStore } from './store/packagesStore'

export default function App() {
  const fetchGlobalMedia = useHomeMediaStore((s) => s.fetchGlobalMedia)
  const fetchGlobalPackages = usePackagesStore((s) => s.fetchGlobalPackages)

  // Fetch central live media and packages config from Supabase so all visitors/customers see live updates
  useEffect(() => {
    fetchGlobalMedia()
    fetchGlobalPackages()
  }, [fetchGlobalMedia, fetchGlobalPackages])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LoginGateProvider>
          <ManaSplashTransition />
          <RouterProvider router={router} />
        </LoginGateProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}
