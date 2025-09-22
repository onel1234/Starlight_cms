import { motion } from 'framer-motion'
import { LoadingSpinner } from './LoadingSpinner'
import { Skeleton } from './Skeleton'

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  spinnerSize?: 'sm' | 'md' | 'lg'
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  className = '', 
  spinnerSize = 'md' 
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10"
        >
          <LoadingSpinner size={spinnerSize} />
        </motion.div>
      )}
    </div>
  )
}

interface PageLoadingProps {
  message?: string
}

export function PageLoading({ message = 'Loading...' }: PageLoadingProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" className="mb-4" />
      <p className="text-secondary-600 text-sm">{message}</p>
    </div>
  )
}

interface ButtonLoadingProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export function ButtonLoading({ 
  isLoading, 
  children, 
  className = '', 
  disabled,
  onClick,
  type = 'button'
}: ButtonLoadingProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`relative ${className} ${isLoading ? 'cursor-not-allowed' : ''}`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" className="text-current" />
        </div>
      )}
      <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
        {children}
      </span>
    </button>
  )
}

interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
  className?: string
}

export function InlineLoading({ 
  size = 'sm', 
  message, 
  className = '' 
}: InlineLoadingProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LoadingSpinner size={size} />
      {message && (
        <span className="text-secondary-600 text-sm">{message}</span>
      )}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = '' 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && (
        <div className="mx-auto h-12 w-12 text-secondary-400 mb-4">
          <Icon className="h-full w-full" />
        </div>
      )}
      <h3 className="text-lg font-medium text-secondary-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-secondary-600 mb-6 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Loading state for data tables
export function TableLoading({ columns = 4, rows = 5 }: { columns?: number; rows?: number }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:p-6">
        <div className="animate-pulse">
          {/* Table header */}
          <div className="flex space-x-4 mb-4">
            {Array.from({ length: columns }).map((_, i) => (
              <div key={i} className="flex-1">
                <div className="h-4 bg-secondary-200 rounded"></div>
              </div>
            ))}
          </div>
          
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4 mb-3">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="flex-1">
                  <div className="h-4 bg-secondary-200 rounded"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Loading state for forms
export function FormLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
      <div className="flex space-x-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  )
}