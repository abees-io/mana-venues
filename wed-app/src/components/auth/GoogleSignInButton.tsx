import { useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

interface GoogleSignInButtonProps {
  role?: 'customer' | 'vendor'
  label?: string
  className?: string
  onSuccess?: () => void
  onError?: (err: Error) => void
}

export default function GoogleSignInButton({
  role = 'customer',
  label = 'Continue with Google',
  className = '',
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleGoogleClick = async () => {
    setLoading(true)
    setErrorMsg(null)

    try {
      await signInWithGoogle({ role })
      if (onSuccess) onSuccess()
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err)
      const message =
        err instanceof Error ? err.message : 'Google sign-in could not be completed.'
      setErrorMsg(message)
      if (onError && err instanceof Error) onError(err)
    } finally {
      setLoading(false)
    }
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        disabled={loading}
        onClick={handleGoogleClick}
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 font-semibold text-sm shadow-xs transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin text-[#7E1F3E]" />
        ) : (
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.25 21.36 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.05.01 12s.45 3.8 1.26 5.42l4.01-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
        )}
        <span>{loading ? 'Connecting to Google...' : label}</span>
      </button>

      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  )
}
