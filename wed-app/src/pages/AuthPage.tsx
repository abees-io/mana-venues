import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface AuthFormData {
  email: string
  password?: string
  fullName?: string
  phone?: string
  newPassword?: string
}

type AuthViewMode = 'login' | 'register' | 'forgot' | 'reset'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user, signIn, signUp } = useAuth()

  // Track whether we are in login, register, forgot-password, or set-new-password mode
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login'
  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode)
  
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>()

  // Check URL hash for recovery token (e.g. #type=recovery from Supabase reset password email)
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('type=recovery')) {
      setViewMode('reset')
      setSuccessMsg('You have been authenticated via reset link. Please choose a new password.')
    }
  }, [])

  // Also listen for Supabase auth state change: PASSWORD_RECOVERY
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setViewMode('reset')
        setSuccessMsg('Please enter your new password below.')
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  // If already logged in and NOT in reset mode, redirect home
  useEffect(() => {
    if (user && viewMode !== 'reset') {
      navigate('/')
    }
  }, [user, navigate, viewMode])

  const switchView = (mode: AuthViewMode) => {
    setViewMode(mode)
    setErrorMsg(null)
    setSuccessMsg(null)
  }

  // 1. Login / Register Submit
  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      if (viewMode === 'register') {
        await signUp(data.email, data.password || '', data.fullName || '', data.phone || '')
        setSuccessMsg('Registration successful! Please check your email to verify your account or sign in.')
      } else if (viewMode === 'login') {
        await signIn(data.email, data.password || '')
        navigate('/')
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 2. Forgot Password (Send Reset Email)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const emailInput = (document.querySelector('input[type="email"]') as HTMLInputElement)?.value
    if (!emailInput) {
      setErrorMsg('Please enter your email address')
      setIsSubmitting(false)
      return
    }

    try {
      const redirectUrl = `${window.location.origin}/auth/login`
      const { error } = await supabase.auth.resetPasswordForEmail(emailInput, {
        redirectTo: redirectUrl,
      })
      if (error) throw error
      setSuccessMsg(`A password reset link has been sent to ${emailInput}. Please check your inbox.`)
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Update Password (When in recovery / reset mode)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    const newPassInput = (document.querySelector('input[name="newPassword"]') as HTMLInputElement)?.value
    if (!newPassInput || newPassInput.length < 6) {
      setErrorMsg('Password must be at least 6 characters')
      setIsSubmitting(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassInput,
      })
      if (error) throw error
      setSuccessMsg('Password successfully updated! You can now sign in with your new password.')
      setTimeout(() => {
        switchView('login')
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
        <div className="bg-brand-dark/90 backdrop-blur-md rounded-2xl shadow-2xl border border-green-800/50 p-6 sm:p-8 text-white">
          
          {/* Header Title & Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">
              {viewMode === 'register' && 'Create an Account'}
              {viewMode === 'login' && 'Welcome Back'}
              {viewMode === 'forgot' && 'Reset Your Password'}
              {viewMode === 'reset' && 'Set New Password'}
            </h1>
            <p className="text-sm text-green-200/70 mt-1">
              {viewMode === 'register' && 'Join to book venues and save your favorites'}
              {viewMode === 'login' && 'Sign in to access your bookings and profile'}
              {viewMode === 'forgot' && "Enter your email to receive a password reset link"}
              {viewMode === 'reset' && 'Enter your new password below'}
            </p>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800/50 text-red-200 text-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-green-950/70 border border-green-700/50 text-brand-secondary text-sm flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-brand-secondary shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ── FORM 1: LOGIN & REGISTER ── */}
          {(viewMode === 'login' || viewMode === 'register') && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {viewMode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-3 py-2 bg-green-950/60 border border-green-800/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-white placeholder-green-400/40"
                      {...register('fullName', {
                        required: viewMode === 'register' ? 'Full name is required' : false,
                      })}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 bg-green-950/60 border border-green-800/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-white placeholder-green-400/40"
                      {...register('phone')}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-green-100 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-green-950/60 border border-green-800/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-white placeholder-green-400/40"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Enter a valid email address',
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-green-100">
                    Password
                  </label>
                  {viewMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => switchView('forgot')}
                      className="text-xs text-brand-secondary font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full pl-3 pr-11 py-2 bg-green-950/60 border border-green-800/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-white placeholder-green-400/40"
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
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-green-400 hover:text-white transition-colors z-10 cursor-pointer"
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
                  <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold py-2.5 px-4 rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
                <label className="block text-sm font-medium text-green-100 mb-1">
                  Enter your registered email
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-green-950/60 border border-green-800/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-white placeholder-green-400/40"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold py-2.5 px-4 rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isSubmitting ? 'Sending link...' : 'Send Reset Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => switchView('login')}
                className="w-full flex items-center justify-center gap-1.5 text-sm text-green-300 hover:text-white pt-2"
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
                <label className="block text-sm font-medium text-green-100 mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password (min 6 characters)"
                    className="w-full pl-3 pr-11 py-2 bg-green-950/60 border border-green-800/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-secondary text-white placeholder-green-400/40"
                    {...register('newPassword', {
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Minimum 6 characters' },
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-green-400 hover:text-white transition-colors z-10 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-brand-dark font-bold py-2.5 px-4 rounded-lg transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Update Password'}
              </button>
            </form>
          )}

          {/* Toggle between Login and Register */}
          {viewMode !== 'forgot' && viewMode !== 'reset' && (
            <div className="mt-6 text-center text-sm text-green-200/70">
              {viewMode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => switchView(viewMode === 'register' ? 'login' : 'register')}
                className="text-brand-secondary font-bold hover:underline"
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
