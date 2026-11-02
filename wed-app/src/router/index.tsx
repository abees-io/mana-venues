import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CityPage from '../pages/CityPage'
import AuditoriumDetailPage from '../pages/AuditoriumDetailPage'
import BookingConfirmPage from '../pages/BookingConfirmPage'
import ProfilePage from '../pages/ProfilePage'
import AuthPage from '../pages/AuthPage'
import VendorDashboard from '../pages/vendor/VendorDashboard'
import VendorHallManager from '../pages/vendor/VendorHallManager'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminVerificationQueue from '../pages/admin/AdminVerificationQueue'
import { ProtectedRoute } from '../components/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/city/:slug',
    element: <CityPage />,
  },
  {
    path: '/auditorium/:slug',
    element: <AuditoriumDetailPage />,
  },
  {
    path: '/booking/confirm',
    element: (
      <ProtectedRoute>
        <BookingConfirmPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/auth/login',
    element: <AuthPage />,
  },
  {
    path: '/auth/register',
    element: <AuthPage />,
  },
  {
    path: '/vendor',
    element: (
      <ProtectedRoute requiredRole="vendor">
        <VendorDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/vendor/auditorium/:id',
    element: (
      <ProtectedRoute requiredRole="vendor">
        <VendorHallManager />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/verification',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminVerificationQueue />
      </ProtectedRoute>
    ),
  },
])
