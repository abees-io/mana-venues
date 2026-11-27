import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'

export default function AuthCallbackPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('Completing Google Sign-In...')

  useEffect(() => {
    let isMounted = true

    async function handleAuth() {
      try {
        // 1. Check for authorization code in URL query (PKCE flow)
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const errorParam = params.get('error')
        const errorDesc = params.get('error_description')

        if (errorParam || errorDesc) {
          throw new Error(errorDesc || errorParam || 'Authentication failed from provider.')
        }

        if (code) {
          setStatus('Exchanging authorization token...')
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) throw exchangeError
        }

        // 2. Check for active session
        setStatus('Verifying user session...')
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (session?.user) {
          await finalizeUser(session.user)
          return
        }

        // 3. Fallback: Listen for onAuthStateChange in case session is being processed from hash
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
          if (currentSession?.user && isMounted) {
            subscription.unsubscribe()
            await finalizeUser(currentSession.user)
          }
        })

        // Safety timeout if no auth event arrives
        setTimeout(() => {
          if (isMounted && !session?.user) {
            subscription.unsubscribe()
            setErrorMsg('Sign-in verification timed out. Please try signing in again.')
          }
        }, 8000)
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Google Auth Callback Error:', err)
          setErrorMsg(err instanceof Error ? err.message : 'An error occurred during sign-in.')
        }
      }
    }

    async function finalizeUser(authUser: any) {
      if (!isMounted) return
      setStatus('Loading your profile...')

      try {
        await refreshProfile()
      } catch (profErr) {
        console.warn('Profile refresh notice in callback:', profErr)
      }

      // Check role intent saved before OAuth redirect
      const savedRole =
        typeof window !== 'undefined'
          ? sessionStorage.getItem('mana_auth_intent_role')
          : null
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('mana_auth_intent_role')
      }

      // If user had a saved role intent (e.g. vendor signup), ensure metadata reflects it
      if (savedRole && !authUser.user_metadata?.role) {
        try {
          await supabase.auth.updateUser({
            data: { role: savedRole },
          })
        } catch {
          // Continue anyway
        }
      }

      const effectiveRole = authUser.user_metadata?.role || savedRole || 'customer'

      if (effectiveRole === 'vendor') {
        navigate('/vendor', { replace: true })
      } else if (effectiveRole === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }

    handleAuth()

    return () => {
      isMounted = false
    }
  }, [navigate, refreshProfile])

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-[#7E1F3E]/10 shadow-xl text-center space-y-6">
        {errorMsg ? (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Sign-In Failed</h1>
              <p className="text-sm text-gray-600 mt-2">{errorMsg}</p>
            </div>
            <div className="pt-2">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#7E1F3E] text-white font-medium text-sm hover:bg-[#60142E] transition shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#7E1F3E]/10 text-[#7E1F3E] flex items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Authenticating</h1>
              <p className="text-sm text-gray-500 mt-1">{status}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
