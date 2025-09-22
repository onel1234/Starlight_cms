import { useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { EyeIcon, EyeOffIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { RegisterData, UserRole } from '../../types/auth'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { PasswordStrengthIndicator } from '../../components/auth/PasswordStrengthIndicator'

interface RegisterFormData extends RegisterData {
  confirmPassword: string
}

const USER_ROLES: { value: UserRole; label: string; description: string }[] = [
  { value: 'Director', label: 'Director', description: 'Full system access and oversight' },
  { value: 'Project Manager', label: 'Project Manager', description: 'Manage projects and teams' },
  { value: 'Quantity Surveyor', label: 'Quantity Surveyor', description: 'Handle quotations and measurements' },
  { value: 'Sales Manager', label: 'Sales Manager', description: 'Manage sales and tenders' },
  { value: 'Customer Success Manager', label: 'Customer Success Manager', description: 'Handle customer relationships' },
  { value: 'Employee', label: 'Employee', description: 'General employee access' },
  { value: 'Customer', label: 'Customer', description: 'External customer access' },
  { value: 'Supplier', label: 'Supplier', description: 'External supplier access' },
]

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { isAuthenticated } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError
  } = useForm<RegisterFormData>()

  const password = watch('password', '')

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // TODO: Implement actual registration API call
      console.log('Registration data:', data)
      // await authService.register(data)
    } catch (error) {
      setError('root', {
        message: 'Registration failed. Please try again.'
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-secondary-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-secondary-600">
            Join Star Light Construction Management System
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-900">Personal Information</h3>
              
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-secondary-700">
                  First Name *
                </label>
                <input
                  {...register('profile.firstName', {
                    required: 'First name is required',
                    minLength: { value: 2, message: 'First name must be at least 2 characters' }
                  })}
                  type="text"
                  className="mt-1 input-field"
                  placeholder="Enter your first name"
                />
                {errors.profile?.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile.firstName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-secondary-700">
                  Last Name *
                </label>
                <input
                  {...register('profile.lastName', {
                    required: 'Last name is required',
                    minLength: { value: 2, message: 'Last name must be at least 2 characters' }
                  })}
                  type="text"
                  className="mt-1 input-field"
                  placeholder="Enter your last name"
                />
                {errors.profile?.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile.lastName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-secondary-700">
                  Phone Number
                </label>
                <input
                  {...register('profile.phone', {
                    pattern: {
                      value: /^[\+]?[1-9][\d]{0,15}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  type="tel"
                  className="mt-1 input-field"
                  placeholder="Enter your phone number"
                />
                {errors.profile?.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.profile.phone.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-secondary-700">
                  Position
                </label>
                <input
                  {...register('profile.position')}
                  type="text"
                  className="mt-1 input-field"
                  placeholder="Enter your position"
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-900">Account Information</h3>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                  Email Address *
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
                <label htmlFor="role" className="block text-sm font-medium text-secondary-700">
                  Role *
                </label>
                <select
                  {...register('role', { required: 'Role is required' })}
                  className="mt-1 input-field"
                >
                  <option value="">Select your role</option>
                  {USER_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                  Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters'
                      }
                    })}
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input-field pr-10"
                    placeholder="Create a password"
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
                {password && <PasswordStrengthIndicator password={password} />}
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                  Confirm Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) => value === password || 'Passwords do not match'
                    })}
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    className="input-field pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon className="h-5 w-5 text-secondary-400" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-secondary-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">Company Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-secondary-700">
                  Company Name
                </label>
                <input
                  {...register('profile.companyName')}
                  type="text"
                  className="mt-1 input-field"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-secondary-700">
                  Address
                </label>
                <textarea
                  {...register('profile.address')}
                  rows={3}
                  className="mt-1 input-field"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {errors.root && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.root.message}</p>
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
                'Create Account'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-secondary-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  )
}