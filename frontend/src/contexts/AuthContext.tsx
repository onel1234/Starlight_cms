import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { User, AuthResponse, UserRole, AuthError, RecoveryAction } from '../types/auth'
import { findUserByEmail } from '../data/mockUsers'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionExpiry: number | null
  authError: AuthError | null
  lastValidation: number | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthResponse & { expiresIn?: number } }
  | { type: 'AUTH_FAILURE'; payload?: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SESSION_WARNING' }
  | { type: 'SESSION_EXPIRED' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_ERROR'; payload: AuthError }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  refreshToken: () => Promise<void>
  extendSession: () => void
  getRedirectPath: (role: UserRole) => string
  clearAuthError: () => void
  validateSession: () => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        authError: null,
      }
    case 'AUTH_SUCCESS':
      const expiresIn = action.payload.expiresIn || 3600 // Default 1 hour
      const sessionExpiry = Date.now() + (expiresIn * 1000)
      return {
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        isAuthenticated: true,
        sessionExpiry,
        authError: null,
        lastValidation: Date.now(),
      }
    case 'AUTH_FAILURE':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpiry: null,
        authError: action.payload || null,
        lastValidation: null,
      }
    case 'SESSION_EXPIRED':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpiry: null,
        authError: {
          type: 'session',
          message: 'Your session has expired',
          details: 'Please log in again to continue',
          recoveryActions: [
            { label: 'Log In Again', action: 'login' }
          ]
        },
        lastValidation: null,
      }
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpiry: null,
        authError: null,
        lastValidation: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      }
    case 'CLEAR_ERROR':
      return {
        ...state,
        authError: null,
      }
    case 'SET_ERROR':
      return {
        ...state,
        authError: action.payload,
      }
    default:
      return state
  }
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  sessionExpiry: null,
  authError: null,
  lastValidation: null,
}

// Session timeout constants
const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000 // Check every minute

// Helper functions for creating error objects
const createAuthError = (type: AuthError['type'], message: string, details?: string): AuthError => {
  const recoveryActions: RecoveryAction[] = []

  switch (type) {
    case 'credentials':
      recoveryActions.push(
        { label: 'Try Again', action: 'retry' },
        { label: 'Forgot Password?', action: 'navigate', target: '/forgot-password' },
        { label: 'Contact Support', action: 'contact' }
      )
      break
    case 'network':
      recoveryActions.push(
        { label: 'Retry', action: 'retry' },
        { label: 'Check Connection', action: 'contact' }
      )
      break
    case 'account':
      recoveryActions.push(
        { label: 'Contact Support', action: 'contact' },
        { label: 'Back to Login', action: 'login' }
      )
      break
    case 'session':
      recoveryActions.push(
        { label: 'Log In Again', action: 'login' }
      )
      break
    case 'permission':
      recoveryActions.push(
        { label: 'Contact Support', action: 'contact' },
        { label: 'Back to Login', action: 'login' }
      )
      break
  }

  return {
    type,
    message,
    details,
    recoveryActions
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const sessionTimeoutRef = useRef<NodeJS.Timeout>()
  const sessionWarningRef = useRef<NodeJS.Timeout>()
  const sessionCheckRef = useRef<NodeJS.Timeout>()

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
    if (sessionWarningRef.current) clearTimeout(sessionWarningRef.current)
    if (sessionCheckRef.current) clearTimeout(sessionCheckRef.current)
  }, [])

  // Setup session timers
  const setupSessionTimers = useCallback((expiryTime: number) => {
    clearTimers()

    const now = Date.now()
    const timeUntilExpiry = expiryTime - now
    const timeUntilWarning = timeUntilExpiry - SESSION_WARNING_TIME

    // Set warning timer
    if (timeUntilWarning > 0) {
      sessionWarningRef.current = setTimeout(() => {
        console.warn('Session will expire in 5 minutes')
      }, timeUntilWarning)
    }

    // Set expiry timer
    if (timeUntilExpiry > 0) {
      sessionTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SESSION_EXPIRED' })
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('session_expiry')
      }, timeUntilExpiry)
    }
  }, [clearTimers])

  // Check session validity periodically
  const checkSession = useCallback(() => {
    const expiryTime = localStorage.getItem('session_expiry')
    if (expiryTime && Date.now() > parseInt(expiryTime)) {
      dispatch({ type: 'SESSION_EXPIRED' })
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('session_expiry')
    }
  }, [])

  useEffect(() => {
    // Check for stored auth data on app load
    const token = localStorage.getItem('auth_token')
    const userData = localStorage.getItem('user_data')
    const sessionExpiry = localStorage.getItem('session_expiry')

    if (token && userData && sessionExpiry) {
      const expiryTime = parseInt(sessionExpiry)

      // Check if session is still valid
      if (Date.now() < expiryTime) {
        try {
          const user = JSON.parse(userData)
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user,
              token,
              refreshToken: '',
              expiresIn: Math.floor((expiryTime - Date.now()) / 1000)
            }
          })
          setupSessionTimers(expiryTime)
        } catch (error) {
          console.error('Error parsing stored user data:', error)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user_data')
          localStorage.removeItem('session_expiry')
          dispatch({ type: 'AUTH_FAILURE' })
        }
      } else {
        // Session expired
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('session_expiry')
        dispatch({ type: 'SESSION_EXPIRED' })
      }
    } else {
      dispatch({ type: 'AUTH_FAILURE' })
    }

    // Setup periodic session check
    sessionCheckRef.current = setInterval(checkSession, SESSION_CHECK_INTERVAL)

    return () => {
      clearTimers()
      if (sessionCheckRef.current) clearInterval(sessionCheckRef.current)
    }
  }, [setupSessionTimers, checkSession, clearTimers])

  const login = async (email: string, password: string) => {
    dispatch({ type: 'AUTH_START' })

    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock authentication - find user by email
      const user = findUserByEmail(email)

      if (!user) {
        const error = createAuthError(
          'credentials',
          'Invalid email or password',
          'The email address you entered is not registered in our system.'
        )
        dispatch({ type: 'AUTH_FAILURE', payload: error })
        throw error
      }

      // Simple password validation (in real app, this would be handled by backend)
      if (password !== 'password123') {
        const error = createAuthError(
          'credentials',
          'Invalid email or password',
          'The password you entered is incorrect.'
        )
        dispatch({ type: 'AUTH_FAILURE', payload: error })
        throw error
      }

      if (user.status !== 'Active') {
        const error = createAuthError(
          'account',
          'Account is not active',
          `Your account status is: ${user.status}. Please contact support for assistance.`
        )
        dispatch({ type: 'AUTH_FAILURE', payload: error })
        throw error
      }

      const expiresIn = 3600 // 1 hour
      const sessionExpiry = Date.now() + (expiresIn * 1000)

      const mockResponse: AuthResponse & { expiresIn: number } = {
        user,
        token: `mock-jwt-token-${user.id}`,
        refreshToken: `mock-refresh-token-${user.id}`,
        expiresIn
      }

      localStorage.setItem('auth_token', mockResponse.token)
      localStorage.setItem('user_data', JSON.stringify(mockResponse.user))
      localStorage.setItem('session_expiry', sessionExpiry.toString())

      dispatch({ type: 'AUTH_SUCCESS', payload: mockResponse })
      setupSessionTimers(sessionExpiry)
    } catch (error) {
      console.error('Login error:', error)
      
      // If it's not already an AuthError, create a generic network error
      if (!(error as AuthError).type) {
        const networkError = createAuthError(
          'network',
          'Connection failed',
          'Unable to connect to the authentication service. Please check your internet connection and try again.'
        )
        dispatch({ type: 'AUTH_FAILURE', payload: networkError })
        throw networkError
      }
      
      throw error
    }
  }

  const logout = useCallback(() => {
    clearTimers()
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('session_expiry')
    dispatch({ type: 'LOGOUT' })
  }, [clearTimers])

  const updateUser = (user: User) => {
    localStorage.setItem('user_data', JSON.stringify(user))
    dispatch({ type: 'UPDATE_USER', payload: user })
  }

  const refreshToken = async () => {
    try {
      // Mock token refresh
      const expiresIn = 3600 // 1 hour
      const sessionExpiry = Date.now() + (expiresIn * 1000)

      localStorage.setItem('session_expiry', sessionExpiry.toString())
      setupSessionTimers(sessionExpiry)
    } catch (error) {
      console.error('Token refresh failed:', error)
      const sessionError = createAuthError(
        'session',
        'Session refresh failed',
        'Unable to refresh your session. Please log in again.'
      )
      dispatch({ type: 'SET_ERROR', payload: sessionError })
      logout()
    }
  }

  const validateSession = async (): Promise<boolean> => {
    try {
      const expiryTime = localStorage.getItem('session_expiry')
      if (!expiryTime) return false

      const isValid = Date.now() < parseInt(expiryTime)
      if (!isValid) {
        dispatch({ type: 'SESSION_EXPIRED' })
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('session_expiry')
      }

      return isValid
    } catch (error) {
      console.error('Session validation failed:', error)
      return false
    }
  }

  const clearAuthError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const extendSession = () => {
    if (state.isAuthenticated && state.sessionExpiry) {
      const newExpiry = Date.now() + (3600 * 1000) // Extend by 1 hour
      localStorage.setItem('session_expiry', newExpiry.toString())
      setupSessionTimers(newExpiry)
    }
  }

  const getRedirectPath = useCallback((role: UserRole): string => {
    switch (role) {
      case 'Customer':
        return '/?customer'
      case 'Supplier':
        return '/?supplier'
      case 'Director':
      case 'Project Manager':
      case 'Quantity Surveyor':
      case 'Sales Manager':
      case 'Customer Success Manager':
      case 'Employee':
        return '/'
      default:
        return '/'
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    refreshToken,
    extendSession,
    getRedirectPath,
    clearAuthError,
    validateSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}