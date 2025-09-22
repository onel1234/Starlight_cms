import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import { User, AuthResponse } from '../types/auth'
import { findUserByEmail } from '../data/mockUsers'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  sessionExpiry: number | null
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: AuthResponse & { expiresIn?: number } }
  | { type: 'AUTH_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SESSION_WARNING' }
  | { type: 'SESSION_EXPIRED' }

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
  refreshToken: () => Promise<void>
  extendSession: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
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
      }
    case 'AUTH_FAILURE':
    case 'SESSION_EXPIRED':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpiry: null,
      }
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
        sessionExpiry: null,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
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
}

// Session timeout constants
const SESSION_WARNING_TIME = 5 * 60 * 1000 // 5 minutes before expiry
const SESSION_CHECK_INTERVAL = 60 * 1000 // Check every minute

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
        // Show session warning notification
        console.warn('Session will expire in 5 minutes')
        // TODO: Show toast notification or modal
      }, timeUntilWarning)
    }

    // Set expiry timer
    if (timeUntilExpiry > 0) {
      sessionTimeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SESSION_EXPIRED' })
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('session_expiry')
        // TODO: Show session expired notification
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
      // Mock authentication - find user by email
      const user = findUserByEmail(email)
      
      if (!user) {
        throw new Error('User not found')
      }

      // Simple password validation (in real app, this would be handled by backend)
      if (password !== 'password123') {
        throw new Error('Invalid password')
      }

      if (user.status !== 'Active') {
        throw new Error('Account is not active')
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
      dispatch({ type: 'AUTH_FAILURE' })
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
      // TODO: Implement actual token refresh API call
      // const response = await authService.refreshToken()
      
      // Mock token refresh
      const expiresIn = 3600 // 1 hour
      const sessionExpiry = Date.now() + (expiresIn * 1000)
      
      localStorage.setItem('session_expiry', sessionExpiry.toString())
      setupSessionTimers(sessionExpiry)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
    }
  }

  const extendSession = () => {
    if (state.isAuthenticated && state.sessionExpiry) {
      const newExpiry = Date.now() + (3600 * 1000) // Extend by 1 hour
      localStorage.setItem('session_expiry', newExpiry.toString())
      setupSessionTimers(newExpiry)
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    refreshToken,
    extendSession,
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