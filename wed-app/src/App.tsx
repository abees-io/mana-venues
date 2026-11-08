import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { queryClient } from './lib/queryClient'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './router'
import { ManaSplashTransition } from './components/common/ManaSplashTransition'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ManaSplashTransition />
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}
