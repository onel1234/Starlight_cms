import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { UserRole, AuthError } from '../../types/auth'
import { hasAccessToRoute } from '../navigation/RoleBasedNavigation'

interface AccessError {
    type: 'authentication' | 'authorization' | 'network' | 'data'
    code: string
    message: string
    userMessage: string
    recoveryActions: RecoveryAction[]
    timestamp: Date
}

interface RecoveryAction {
    label: string
    action: 'retry' | 'login' | 'contact' | 'navigate'
    target?: string
}

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles?: UserRole[]
    fallbackComponent?: React.ComponentType<{ error: AccessError }>
}

export function ProtectedRoute({ children, requiredRoles, fallbackComponent: FallbackComponent }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user, getRedirectPath } = useAuth()
    const location = useLocation()

    const handleRecoveryAction = (action: string, target?: string) => {
        switch (action) {
            case 'retry':
                window.location.reload()
                break
            case 'login':
                window.location.href = '/login'
                break
            case 'navigate':
                if (target) {
                    window.location.href = target
                } else if (user) {
                    window.location.href = getRedirectPath(user.role)
                }
                break
            case 'contact':
                alert('Please contact support at support@starlightconstructions.com or call +1-555-SUPPORT')
                break
        }
    }

    const createAccessError = (type: 'authorization', message: string, userMessage: string): AccessError => {
        const recoveryActions: RecoveryAction[] = []

        if (type === 'authorization') {
            recoveryActions.push(
                { label: 'Go to My Portal', action: 'navigate' },
                { label: 'Contact Support', action: 'contact' },
                { label: 'Log Out', action: 'login' }
            )
        }

        return {
            type,
            code: 'ACCESS_DENIED',
            message,
            userMessage,
            recoveryActions,
            timestamp: new Date()
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role-based access
    if (user) {
        // If specific roles are required, check against them
        if (requiredRoles && !requiredRoles.includes(user.role)) {
            const error = createAccessError(
                'authorization',
                'Insufficient permissions',
                `This page requires one of the following roles: ${requiredRoles.join(', ')}. Your current role is: ${user.role}.`
            )

            if (FallbackComponent) {
                return <FallbackComponent error={error} />
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                    <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h1 className="text-xl font-bold text-secondary-900 mb-2">Access Denied</h1>
                            <p className="text-secondary-600 mb-4">
                                {error.userMessage}
                            </p>
                            <div className="space-y-2">
                                {error.recoveryActions.map((action, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleRecoveryAction(action.action, action.target)}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                    >
                                        {action.label}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-secondary-200">
                                <p className="text-xs text-secondary-500">
                                    Need help? Contact support at support@starlightconstructions.com
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }

        // Only check general route access if no specific roles are required
        // This prevents double-checking when ProtectedRoute is used with specific roles
        if (!requiredRoles) {
            // Check if user has access to the current route based on navigation rules
            // Include query parameters for proper external portal access checking
            const fullRoute = location.pathname + location.search
            if (!hasAccessToRoute(fullRoute, user.role)) {
                const error = createAccessError(
                    'authorization',
                    'Route access denied',
                    `You don't have permission to access this page with your current role: ${user.role}.`
                )

                if (FallbackComponent) {
                    return <FallbackComponent error={error} />
                }

                return (
                    <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                    <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h1 className="text-xl font-bold text-secondary-900 mb-2">Access Denied</h1>
                                <p className="text-secondary-600 mb-4">
                                    {error.userMessage}
                                </p>
                                <div className="space-y-2">
                                    {error.recoveryActions.map((action, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleRecoveryAction(action.action, action.target)}
                                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-4 pt-4 border-t border-secondary-200">
                                    <p className="text-xs text-secondary-500">
                                        Need help? Contact support at support@starlightconstructions.com
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        }
    }

    return <>{children}</>
}