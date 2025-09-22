import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useSupplierQuotations } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { formatters } from '../../../utils/formatters'

export const SupplierQuotationsList: React.FC = () => {
  const { user } = useAuth()
  const { data: quotations, isLoading, error } = useSupplierQuotations(user?.id || 0)
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
        <h3 className="text-red-800 font-medium">Error Loading Quotations</h3>
        <p className="text-red-600 mt-2">Unable to load your quotations. Please try again later.</p>
      </div>
    )
  }

  const filteredQuotations = quotations?.filter(quotation => 
    statusFilter === 'all' || quotation.status === statusFilter
  ) || []

  const statusOptions = [
    { value: 'all', label: 'All Quotations' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Accepted', label: 'Accepted' },
    { value: 'Rejected', label: 'Rejected' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800'
      case 'Submitted': return 'bg-blue-100 text-blue-800'
      case 'Under Review': return 'bg-yellow-100 text-yellow-800'
      case 'Accepted': return 'bg-green-100 text-green-800'
      case 'Rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Quotations</h1>
          <p className="text-gray-600 mt-1">
            Track the status of your submitted quotations
          </p>
        </div>
        
        {/* Filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>      {/*
 Quotations List */}
      {filteredQuotations.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredQuotations.map(quotation => (
              <div key={quotation.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {quotation.quotationNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                        {quotation.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium text-gray-700">Total Amount:</span>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatters.currency(quotation.totalAmount)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Valid Until:</span>
                        <div className="text-gray-900">
                          {formatters.date(quotation.validUntil)}
                        </div>
                      </div>
                      
                      {quotation.submittedAt && (
                        <div>
                          <span className="font-medium text-gray-700">Submitted:</span>
                          <div className="text-gray-900">
                            {formatters.date(quotation.submittedAt)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Items Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">Items ({quotation.items.length})</h4>
                      <div className="space-y-2">
                        {quotation.items.slice(0, 3).map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.productName}</span>
                            <span className="font-medium">{formatters.currency(item.totalPrice)}</span>
                          </div>
                        ))}
                        {quotation.items.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{quotation.items.length - 3} more items
                          </div>
                        )}
                      </div>
                    </div>

                    {quotation.notes && (
                      <div className="mt-4">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-600 text-sm mt-1">{quotation.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Quotations Found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "You haven't submitted any quotations yet." 
              : `You don't have any quotations with ${statusFilter.toLowerCase()} status.`
            }
          </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View All Quotations
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredQuotations.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">
              Showing {filteredQuotations.length} quotation{filteredQuotations.length !== 1 ? 's' : ''}
            </span>
            <span className="text-green-600">
              Total value: {formatters.currency(filteredQuotations.reduce((sum, q) => sum + q.totalAmount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}