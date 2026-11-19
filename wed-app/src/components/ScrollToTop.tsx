import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'

/** Scrolls to top instantly on every route change. Use as a layout wrapper in createBrowserRouter. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return <Outlet />
}
