import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircleIcon, XCircleIcon, MailIcon } from 'lucide-react'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'

type VerificationStatus = 'loading' | 'success' | 'error' | 'expired'

export function EmailVerificationPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading')
  const [message, setMessage] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('Invalid verification link')
      return
    }

    const verifyEmail = async () => {
      try {
        // TODO: Implement actual email verification API call
        console.log('Verifying email with token:', token)
        // await authService.verifyEmail(token)
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        setStatus('success')
        setMessage('Your email has been successfully verified!')
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Email verified successfully. You can now sign in.' }
          })
        }, 3000)
      } catch (error) {
        setStatus('error')
        setMessage('Failed to verify email. The link may have expired.')
      }
    }

    verifyEmail()
  }, [token, navigate])

  const resendVerification = async () => {
    if (!email) return
    
    try {
      // TODO: Implement resend verification API call
      console.log('Resending verification to:', email)
      // await authService.resendVerification(email)
      setMessage('Verification email sent successfully!')
    } catch (error) {
      setMessage('Failed to resend verification email.')
    }
  }

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-3xl font-bold tracking-tight text-secondary-900">
              Verifying your email
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              Please wait while we verify your email address...
            </p>
          </div>
        )

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-secondary-900">
              Email verified!
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              {message}
            </p>
            <p className="mt-4 text-sm text-secondary-500">
              You will be redirected to the login page shortly.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Go to sign in
              </Link>
            </div>
          </div>
        )

      case 'error':
      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircleIcon className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-secondary-900">
              Verification failed
            </h2>
            <p className="mt-2 text-sm text-secondary-600">
              {message}
            </p>
            
            {email && (
              <div className="mt-6 space-y-3">
                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <MailIcon className="h-5 w-5 text-yellow-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Need a new verification link?
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        We can send a new verification email to {email}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={resendVerification}
                  className="inline-flex justify-center py-2 px-4 border border-primary-300 rounded-md shadow-sm text-sm font-medium text-primary-700 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Resend verification email
                </button>
              </div>
            )}
            
            <div className="mt-4">
              <Link
                to="/register"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Create a new account
              </Link>
              <span className="mx-2 text-secondary-400">|</span>
              <Link
                to="/login"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8"
      >
        {renderContent()}
      </motion.div>
    </div>
  )
}