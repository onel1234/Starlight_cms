import { useState } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { LoginCredentials } from '../../types/auth'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { QuickLoginHelper } from '../../components/auth/QuickLoginHelper'
import { LoginCredentialsCard } from '../../components/auth/LoginCredentialsCard'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showCredentialsCard, setShowCredentialsCard] = useState(false)
  const { login, isAuthenticated, isLoading, user, getRedirectPath, authError, clearAuthError } = useAuth()
  const location = useLocation()

  // Determine redirect path based on user role with query parameters
  const determineRedirectPath = () => {
    if (location.state?.from?.pathname) {
      return location.state.from.pathname
    }

    // Get user data from context or localStorage
    const userData = user || (() => {
      try {
        const storedUser = localStorage.getItem('user_data')
        return storedUser ? JSON.parse(storedUser) : null
      } catch {
        return null
      }
    })()

    if (userData?.role) {
      return getRedirectPath(userData.role)
    }

    return '/'
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue
  } = useForm<LoginCredentials>()

  const handleCredentialSelect = (email: string, password: string) => {
    setValue('email', email)
    setValue('password', password)
    setShowCredentialsCard(false)
  }

  if (isAuthenticated) {
    return <Navigate to={determineRedirectPath()} replace />
  }

  const onSubmit = async (data: LoginCredentials) => {
    try {
      clearAuthError() // Clear any previous errors
      await login(data.email, data.password)
      // The redirect will happen automatically via the Navigate component
      // when isAuthenticated becomes true
    } catch (error) {
      // Error is now handled by AuthContext and available via authError
      console.error('Login failed:', error)
    }
  }

  const handleRecoveryAction = (action: string, target?: string) => {
    switch (action) {
      case 'retry':
        clearAuthError()
        break
      case 'login':
        clearAuthError()
        break
      case 'navigate':
        if (target) {
          window.location.href = target
        }
        break
      case 'contact':
        // In a real app, this would open a support modal or redirect to support
        alert('Please contact support at support@starlightconstructions.com or call +1-555-SUPPORT')
        break
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full mx-auto space-y-8"
          >
            <div>
              <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-secondary-900">
                Sign in to Star Light CMS
              </h2>
              <p className="mt-2 text-center text-sm text-secondary-600">
                Construction Management System
              </p>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                    Email address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    type="email"
                    autoComplete="email"
                    className="mt-1 input-field"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters'
                        }
                      })}
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="input-field pr-10"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOffIcon className="h-5 w-5 text-secondary-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-secondary-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>

              {(errors.root || authError) && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-red-800">
                        {authError?.message || errors.root?.message}
                      </h3>
                      {authError?.details && (
                        <p className="mt-1 text-sm text-red-700">{authError.details}</p>
                      )}
                      {authError?.recoveryActions && authError.recoveryActions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {authError.recoveryActions.map((action, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleRecoveryAction(action.action, action.target)}
                              className="inline-flex items-center px-3 py-1 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" className="text-white" />
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-secondary-600">
                  <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot your password?
                  </Link>
                </p>
                <p className="text-sm text-secondary-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                    Sign up
                  </Link>
                </p>
                <div className="pt-2 border-t border-secondary-200">
                  <button
                    type="button"
                    onClick={() => setShowCredentialsCard(!showCredentialsCard)}
                    className="text-xs text-primary-600 hover:text-primary-500 font-medium"
                  >
                    {showCredentialsCard ? 'Hide' : 'Show'} Demo Credentials
                  </button>
                </div>
              </div>
            </form>

            {/* Quick Login Helper for Demo */}
            {!showCredentialsCard && <QuickLoginHelper />}
          </motion.div>

          {/* Credentials Card */}
          {showCredentialsCard && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <LoginCredentialsCard onCredentialSelect={handleCredentialSelect} />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}