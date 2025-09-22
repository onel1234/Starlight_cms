import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  const baseClasses = 'bg-secondary-200 rounded'
  
  if (animate) {
    return (
      <motion.div
        className={`${baseClasses} ${className}`}
        animate={{
          opacity: [0.5, 1, 0.5]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    )
  }

  return <div className={`${baseClasses} ${className}`} />
}

// Pre-built skeleton components for common use cases
export function SkeletonText({ lines = 1, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-secondary-200 p-6 ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="mt-4 flex space-x-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }: { 
  rows?: number; 
  columns?: number; 
  className?: string 
}) {
  return (
    <div className={`bg-white rounded-lg border border-secondary-200 overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="bg-secondary-50 px-6 py-3 border-b border-secondary-200">
        <div className="flex space-x-4">
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4 w-24" />
          ))}
        </div>
      </div>
      
      {/* Table Rows */}
      <div className="divide-y divide-secondary-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="px-6 py-4">
            <div className="flex space-x-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton 
                  key={`cell-${rowIndex}-${colIndex}`} 
                  className={`h-4 ${colIndex === 0 ? 'w-32' : colIndex === columns - 1 ? 'w-16' : 'w-24'}`} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-secondary-200">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonDashboard({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-secondary-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="bg-white rounded-lg border border-secondary-200 p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>

      {/* Table */}
      <SkeletonTable rows={8} columns={5} />
    </div>
  )
}