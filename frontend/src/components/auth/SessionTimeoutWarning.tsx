import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ClockIcon, XIcon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface SessionTimeoutWarningProps {
  show: boolean
  onExtend: () => void
  onLogout: () => void
  onDismiss: () => void
  timeRemaining: number
}

export function SessionTimeoutWarning({ 
  show, 
  onExtend, 
  onLogout, 
  onDismiss, 
  timeRemaining 
}: SessionTimeoutWarningProps) {
  const [countdown, setCountdown] = useState(timeRemaining)

  useEffect(() => {
    if (!show) return

    setCountdown(timeRemaining)
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [show, timeRemaining, onLogout])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={onDismiss}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-medium text-secondary-900">
                      Session Expiring Soon
                    </h3>
                  </div>
                </div>
                <button
                  onClick={onDismiss}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-secondary-600 mb-3">
                  Your session will expire in:
                </p>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">
                    {formatTime(countdown)}
                  </div>
                  <p className="text-sm text-secondary-500">
                    You will be automatically logged out when the timer reaches zero.
                  </p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={onExtend}
                  className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Extend Session
                </button>
                <button
                  onClick={onLogout}
                  className="flex-1 inline-flex justify-center py-2 px-4 border border-secondary-300 shadow-sm text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Logout Now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Hook to manage session timeout warning
export function useSessionTimeoutWarning() {
  const { sessionExpiry, extendSession, logout } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)

  useEffect(() => {
    if (!sessionExpiry) return

    const checkSession = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((sessionExpiry - now) / 1000))
      
      // Show warning when 5 minutes or less remaining
      if (remaining <= 300 && remaining > 0) {
        setTimeRemaining(remaining)
        setShowWarning(true)
      } else {
        setShowWarning(false)
      }
    }

    // Check immediately
    checkSession()

    // Check every 30 seconds
    const interval = setInterval(checkSession, 30000)

    return () => clearInterval(interval)
  }, [sessionExpiry])

  const handleExtend = () => {
    extendSession()
    setShowWarning(false)
  }

  const handleLogout = () => {
    logout()
    setShowWarning(false)
  }

  const handleDismiss = () => {
    setShowWarning(false)
  }

  return {
    showWarning,
    timeRemaining,
    handleExtend,
    handleLogout,
    handleDismiss
  }
}