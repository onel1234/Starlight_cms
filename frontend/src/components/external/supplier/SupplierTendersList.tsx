import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { useAvailableTenders } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { TenderCard } from './TenderCard'
import { formatters } from '../../../utils/formatters'

export const SupplierTendersList: React.FC = () => {
  const { user } = useAuth()
  const { data: tenders, isLoading, error } = useAvailableTenders(user?.id || 0)
  const [statusFilter, setStatusFilter] = useState<string>('Open')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Tenders</h3>
        <p className="text-red-600 mt-2">Unable to load available tenders. Please try again later.</p>
      </div>
    )
  }

  const filteredTenders = tenders?.filter(tender => {
    const statusMatch = statusFilter === 'all' || tender.status === statusFilter
    const categoryMatch = categoryFilter === 'all' || tender.category === categoryFilter
    return statusMatch && categoryMatch
  }) || []

  const categories = [...new Set(tenders?.map(t => t.category) || [])]
  const statusOptions = [
    { value: 'Open', label: 'Open Tenders' },
    { value: 'Closed', label: 'Closed Tenders' },
    { value: 'Awarded', label: 'Awarded Tenders' },
    { value: 'all', label: 'All Tenders' }
  ]

  const getUrgencyLevel = (deadline: Date) => {
    const now = new Date()
    const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDeadline < 0) return { level: 'expired', color: 'text-red-600', label: 'Expired' }
    if (daysUntilDeadline <= 3) return { level: 'urgent', color: 'text-red-600', label: 'Urgent' }
    if (daysUntilDeadline <= 7) return { level: 'soon', color: 'text-yellow-600', label: 'Due Soon' }
    return { level: 'normal', color: 'text-green-600', label: 'Open' }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Available Tenders</h1>
        <p className="text-gray-600 mt-1">
          Browse and submit quotations for available construction tenders
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tenders Grid */}
      {filteredTenders.length > 0 ? (
        <div className="space-y-4">
          {filteredTenders.map(tender => {
            const urgency = getUrgencyLevel(tender.submissionDeadline)
            
            return (
              <div key={tender.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {tender.title}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tender.category}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgency.color} bg-opacity-10`}>
                        {urgency.label}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {tender.description}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Deadline:</span>
                        <div className={urgency.color}>
                          {formatters.date(tender.submissionDeadline)}
                        </div>
                      </div>
                      
                      {tender.estimatedValue && (
                        <div>
                          <span className="font-medium text-gray-700">Est. Value:</span>
                          <div className="text-gray-900">
                            {formatters.currency(tender.estimatedValue)}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <span className="font-medium text-gray-700">Contact:</span>
                        <div className="text-gray-900">
                          {tender.contactPerson}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    <Link
                      to={`/supplier/tenders/${tender.id}`}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      View Details
                    </Link>
                    
                    {tender.status === 'Open' && urgency.level !== 'expired' && (
                      <Link
                        to={`/supplier/tenders/${tender.id}/quote`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        Submit Quote
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tenders Found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'No tenders match your current filters.'
              : 'No tenders are currently available.'
            }
          </p>
          {(statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('Open')
                setCategoryFilter('all')
              }}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredTenders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">
              Showing {filteredTenders.length} tender{filteredTenders.length !== 1 ? 's' : ''}
            </span>
            <span className="text-green-600">
              {filteredTenders.filter(t => t.status === 'Open' && getUrgencyLevel(t.submissionDeadline).level !== 'expired').length} available for submission
            </span>
          </div>
        </div>
      )}
    </div>
  )
}