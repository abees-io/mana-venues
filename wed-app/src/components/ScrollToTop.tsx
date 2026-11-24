import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { LoginGateModal } from './common/LoginGateModal'
import { CitySelectGateModal } from './common/CitySelectGateModal'

/** Scrolls to top instantly on every route change, mounts global modals (City selection gate & Auth gate on demand). */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <Outlet />
      <CitySelectGateModal />
      <LoginGateModal />
    </>
  )
}

