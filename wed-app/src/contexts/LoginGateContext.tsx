import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface LoginGateContextType {
  isOpen: boolean
  reason: string
  openLoginGate: (reason?: string, onAuthenticated?: () => void) => void
  closeLoginGate: () => void
  requireAuth: (reason: string, action?: () => void) => boolean
  onSuccessCallback: (() => void) | null
}

const LoginGateContext = createContext<LoginGateContextType | undefined>(undefined)

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null)

  const openLoginGate = useCallback((customReason?: string, onAuthenticated?: () => void) => {
    setReason(customReason || 'to access exclusive venue details and packages')
    if (onAuthenticated) {
      setOnSuccessCallback(() => onAuthenticated)
    } else {
      setOnSuccessCallback(null)
    }
    setIsOpen(true)
  }, [])

  const closeLoginGate = useCallback(() => {
    setIsOpen(false)
    setOnSuccessCallback(null)
  }, [])

  /**
   * Helper that checks if user is logged in.
   * If logged in, immediately calls `action()` and returns true.
   * If not logged in, opens the login gate modal with the specified reason and saves `action` to run after login. Returns false.
   */
  const requireAuth = useCallback(
    (customReason: string, action?: () => void): boolean => {
      if (user) {
        if (action) action()
        return true
      }
      openLoginGate(customReason, action)
      return false
    },
    [user, openLoginGate]
  )

  return (
    <LoginGateContext.Provider
      value={{
        isOpen,
        reason,
        openLoginGate,
        closeLoginGate,
        requireAuth,
        onSuccessCallback,
      }}
    >
      {children}
    </LoginGateContext.Provider>
  )
}

export function useLoginGate(): LoginGateContextType {
  const context = useContext(LoginGateContext)
  if (!context) {
    throw new Error('useLoginGate must be used within a LoginGateProvider')
  }
  return context
}
