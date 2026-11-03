import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState(false)
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
        setErrorMsg('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-brand-dark">
              {isRegister ? 'Create an Account' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isRegister
                ? 'Join to book venues and save your favorites'
                : 'Sign in to access your bookings and profile'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMsg}
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
                    placeholder="John Doe"
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
              <label className="block text-sm font-medium text-brand-dark mb-1">
                Password
              </label>
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
                  className="absolute right-0 top-0 bottom-0 px-3.5 flex items-center justify-center text-gray-500 hover:text-brand-dark transition-colors z-10 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-600" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-600" />
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
