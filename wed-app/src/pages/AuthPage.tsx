import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Layout from '../components/layout/Layout'

interface AuthFormData {
  email: string
  password?: string
  newPassword?: string
  fullName?: string
  phone?: string
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const isRegisterRoute = location.pathname.includes('/register')
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(
    isRegisterRoute ? 'register' : 'login'
  )

  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<AuthFormData>()

  // Detect Supabase recovery token in URL hash (#access_token=...&type=recovery)
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      setViewMode('reset')
    }
  }, [])

  const switchView = (mode: 'login' | 'register' | 'forgot' | 'reset') => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setViewMode(mode)
    reset()
  }

  // Handle standard login and registration
  const onSubmit = async (data: AuthFormData) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)
    try {
      if (viewMode === 'register') {
        const res = await signUp(data.email, data.password || '', data.fullName || '', data.phone || '')
        if (!res.session) {
          setSuccessMsg('Account created! Please check your email to verify your account or sign in below.')
          setViewMode('login')
          reset()
          return
        }
      } else {
        await signIn(data.email, data.password || '')
      }
      const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname
      navigate(fromLocation || '/', { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Send Password Reset Link
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = getValues('email')
    if (!email) {
      setErrorMsg('Please enter your email address')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const redirectUrl = `${window.location.origin}/auth/login`
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      })
      if (error) throw error
      setSuccessMsg(`Password reset link sent to ${email}! Check your inbox.`)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Update New Password (when opening from reset email link)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const newPassword = getValues('newPassword')
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })
      if (error) throw error
      setSuccessMsg('Your password has been successfully updated! You can now log in.')
      setTimeout(() => {
        window.location.hash = ''
        setViewMode('login')
      }, 2000)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          
          {/* Header Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-brand-dark">
              {viewMode === 'register' && 'Create an Account'}
              {viewMode === 'login' && 'Welcome Back'}
              {viewMode === 'forgot' && 'Reset Your Password'}
              {viewMode === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {viewMode === 'register' && 'Join to book venues and save your favorites'}
              {viewMode === 'login' && 'Sign in to access your bookings and profile'}
              {viewMode === 'forgot' && "Enter your email to receive a password reset link"}
              {viewMode === 'reset' && 'Enter your new password below'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── FORM 1: LOGIN & REGISTER ── */}
          {(viewMode === 'login' || viewMode === 'register') && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {viewMode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                      {...register('fullName', {
                        required: viewMode === 'register' ? 'Full name is required' : false,
                      })}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                      {...register('phone')}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-brand-dark">
                    Password
                  </label>
                  {viewMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-xs text-brand-primary font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-11 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters',
                      },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-gray-400 hover:text-brand-dark transition-colors z-10 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting
                  ? 'Please wait...'
                  : viewMode === 'register'
                  ? 'Create Account'
                  : 'Sign In'}
              </button>
            </form>
          )}

          {/* ── FORM 2: FORGOT PASSWORD ── */}
          {viewMode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  Enter your registered email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending link...' : 'Send Reset Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchView('login')}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-brand-dark pt-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </form>
          )}

          {/* ── FORM 3: SET NEW PASSWORD ── */}
          {viewMode === 'reset' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-3 pr-11 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-gray-400 hover:text-brand-dark transition-colors z-10 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          {viewMode !== 'forgot' && viewMode !== 'reset' && (
            <div className="mt-6 text-center text-sm text-brand-dark/70">
              {viewMode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => switchView(viewMode === 'register' ? 'login' : 'register')}
                className="text-brand-primary font-semibold hover:underline"
              >
                {viewMode === 'register' ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}
