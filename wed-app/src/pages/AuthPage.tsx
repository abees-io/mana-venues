import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Layout from '../components/layout/Layout'

interface AuthFormData {
  email: string
  password: string
  fullName?: string
  phone?: string
}

export default function AuthPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()

  const isRegisterRoute = location.pathname.includes('/register')
  const [isRegister, setIsRegister] = useState(isRegisterRoute)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>()

  const toggleMode = () => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsRegister((prev) => !prev)
    reset()
  }

  const onSubmit = async (data: AuthFormData) => {
    setErrorMsg(null)
    setSuccessMsg(null)
    setIsSubmitting(true)
    try {
      if (isRegister) {
        const res = await signUp(data.email, data.password, data.fullName || '', data.phone || '')
        if (!res.session) {
          setSuccessMsg('Account created! Please check your email to verify your account or sign in below.')
          setIsRegister(false)
          reset()
          return
        }
      } else {
        await signIn(data.email, data.password)
      }
      const fromLocation = (location.state as { from?: { pathname: string } })?.from?.pathname
      navigate(fromLocation || '/', { replace: true })
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('An unexpected authentication error occurred.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-brand-primary/10">
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="MANA Venues"
            className="h-16 w-auto object-contain mx-auto mb-3"
          />
          <h1
            className="text-2xl font-bold text-brand-primary tracking-widest"
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: '0.18em' }}
          >
            MANA <span className="text-brand-secondary">VENUES</span>
          </h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 flex-wrap">
            <span
              className="text-xs uppercase tracking-[0.14em] text-brand-dark/70 font-semibold"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Grand venues for your
            </span>
            <span
              className="text-2xl text-brand-secondary font-normal drop-shadow-xs"
              style={{ fontFamily: "'Great Vibes', cursive" }}
            >
              Big Days
            </span>
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mt-3">
            {isRegister ? 'Create your account to get started' : 'Welcome back — sign in to continue'}
          </p>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg flex items-center gap-2">
            <span>✓</span>
            <p>{successMsg}</p>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isRegister && (
            <>
              <div>
                <label className="block text-sm font-medium text-brand-dark mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Nair"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
                  {...register('fullName', {
                    required: isRegister ? 'Full name is required' : false,
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
                  placeholder="e.g. +91 98765 43210"
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
            <label className="block text-sm font-medium text-brand-dark mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary text-brand-dark"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
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
              : isRegister
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-brand-dark/70">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-brand-primary font-semibold hover:underline"
          >
            {isRegister ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
      </div>
    </Layout>
  )
}
