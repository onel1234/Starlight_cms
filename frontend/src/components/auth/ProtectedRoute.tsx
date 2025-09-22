import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { UserRole } from '../../types/auth'
import { hasAccessToRoute } from '../navigation/RoleBasedNavigation'

interface ProtectedRouteProps {
    children: React.ReactNode
    requiredRoles?: UserRole[]
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, user } = useAuth()
    const location = useLocation()

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
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
                        <p className="text-secondary-600">
                            You don't have permission to access this page.
                        </p>
                        <p className="text-sm text-secondary-500 mt-2">
                            Required roles: {requiredRoles.join(', ')}
                        </p>
                        <p className="text-sm text-secondary-500">
                            Your role: {user.role}
                        </p>
                    </div>
                </div>
            )
        }

        // Check if user has access to the current route based on navigation rules
        if (!hasAccessToRoute(location.pathname, user.role)) {
            return (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h1>
                        <p className="text-secondary-600">
                            You don't have permission to access this page.
                        </p>
                        <p className="text-sm text-secondary-500 mt-2">
                            Your role: {user.role}
                        </p>
                        <button
                            onClick={() => window.history.back()}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )
        }
    }

    return <>{children}</>
}