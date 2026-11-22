import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { LoginGateProvider } from './contexts/LoginGateContext'
import { router } from './router'
import { ManaSplashTransition } from './components/common/ManaSplashTransition'

export default function App() {
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
