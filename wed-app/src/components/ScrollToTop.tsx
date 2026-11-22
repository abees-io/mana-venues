import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { LoginGateModal } from './common/LoginGateModal'

/** Scrolls to top instantly on every route change and mounts global modals. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <>
      <Outlet />
      <LoginGateModal />
    </>
  )
}
