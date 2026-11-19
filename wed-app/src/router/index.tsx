import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CityPage from '../pages/CityPage'
import AuditoriumDetailPage from '../pages/AuditoriumDetailPage'
import BookingConfirmPage from '../pages/BookingConfirmPage'
import ProfilePage from '../pages/ProfilePage'
import AuthPage from '../pages/AuthPage'
import PackagesPage from '../pages/PackagesPage'
import PhotographyPage from '../pages/PhotographyPage'
import BridalMakeupPage from '../pages/BridalMakeupPage'
import CateringPage from '../pages/CateringPage'
import VendorDashboard from '../pages/vendor/VendorDashboard'
import VendorHallManager from '../pages/vendor/VendorHallManager'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminVerificationQueue from '../pages/admin/AdminVerificationQueue'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { ScrollToTop } from '../components/ScrollToTop'

export const router = createBrowserRouter([
  {
    // Root layout wrapper — scrolls to top on every route change
    element: <ScrollToTop />,
    children: [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/packages',
    element: <PackagesPage />,
  },
  {
    path: '/photography',
    element: <PhotographyPage />,
  },
  {
    path: '/bridal-makeup',
    element: <BridalMakeupPage />,
  },
  {
    path: '/catering',
    element: <CateringPage />,
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
    ], // end children
  },   // end ScrollToTop wrapper
])
