import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import CityPage from '../pages/CityPage'
import AuditoriumDetailPage from '../pages/AuditoriumDetailPage'
import BookingConfirmPage from '../pages/BookingConfirmPage'
import ProfilePage from '../pages/ProfilePage'
import AuthPage from '../pages/AuthPage'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { ScrollToTop } from '../components/ScrollToTop'

const PackagesPage = lazy(() => import('../pages/PackagesPage'))
const PhotographyPage = lazy(() => import('../pages/PhotographyPage'))
const BridalMakeupPage = lazy(() => import('../pages/BridalMakeupPage'))
const CateringPage = lazy(() => import('../pages/CateringPage'))
const VendorDashboard = lazy(() => import('../pages/vendor/VendorDashboard'))
const VendorHallManager = lazy(() => import('../pages/vendor/VendorHallManager'))
const VendorAuthPage = lazy(() => import('../pages/vendor/VendorAuthPage'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const AdminVerificationQueue = lazy(() => import('../pages/admin/AdminVerificationQueue'))

const LoadingFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-8 h-8 rounded-full border-3 border-[#7E1F3E] border-t-transparent animate-spin" />
  </div>
)

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
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PackagesPage />
          </Suspense>
        ),
      },
      {
        path: '/photography',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <PhotographyPage />
          </Suspense>
        ),
      },
      {
        path: '/bridal-makeup',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <BridalMakeupPage />
          </Suspense>
        ),
      },
      {
        path: '/catering',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <CateringPage />
          </Suspense>
        ),
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
        path: '/vendor/login',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <VendorAuthPage />
          </Suspense>
        ),
      },
      {
        path: '/vendor/register',
        element: (
          <Suspense fallback={<LoadingFallback />}>
            <VendorAuthPage />
          </Suspense>
        ),
      },
      {
        path: '/vendor',
        element: (
          <ProtectedRoute requiredRole="vendor">
            <Suspense fallback={<LoadingFallback />}>
              <VendorDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/vendor/auditorium/:id',
        element: (
          <ProtectedRoute requiredRole="vendor">
            <Suspense fallback={<LoadingFallback />}>
              <VendorHallManager />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingFallback />}>
              <AdminDashboard />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/verification',
        element: (
          <ProtectedRoute requiredRole="admin">
            <Suspense fallback={<LoadingFallback />}>
              <AdminVerificationQueue />
            </Suspense>
          </ProtectedRoute>
        ),
      },
    ],
  },
])
