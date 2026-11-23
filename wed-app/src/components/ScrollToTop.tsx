import { useEffect } from 'react'
import { useLocation, Outlet } from 'react-router-dom'
import { LoginGateModal } from './common/LoginGateModal'
import { useAuth } from '../contexts/AuthContext'
import { useLoginGate } from '../contexts/LoginGateContext'

/** Scrolls to top instantly on every route change, mounts global modals, and prompts login every 7s if not signed in. */
export function ScrollToTop() {
  const { pathname } = useLocation()
  const { user, loading } = useAuth()
  const { isOpen, openLoginGate } = useLoginGate()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  // Automatically open the login gate every 7s on the website if not signed in
  // DO NOT prompt if user is already signed in, if the popup is already open,
  // or if the user is on any auth/registration routes (/auth, /vendor/login, /vendor/register)
  useEffect(() => {
    if (user || loading || isOpen) return
    const isAuthRoute =
      pathname.startsWith('/auth') ||
      pathname.startsWith('/vendor/auth') ||
      pathname.startsWith('/vendor/login') ||
      pathname.startsWith('/vendor/register')
    if (isAuthRoute) return

    // Also check if user dismissed the prompt in this session
    if (sessionStorage.getItem('mana_login_gate_dismissed') === 'true') return

    const timer = setTimeout(() => {
      openLoginGate('to access exclusive wedding packages and venue details')
    }, 7000)

    return () => clearTimeout(timer)
  }, [user, loading, isOpen, pathname, openLoginGate])

  return (
    <>
      <Outlet />
      <LoginGateModal />
    </>
  )
}
