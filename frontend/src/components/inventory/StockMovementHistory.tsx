import { useState } from 'react'
import { useStockMovements } from '../../hooks/useInventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

interface StockMovementHistoryProps {
  productId?: number
}

export function StockMovementHistory({ productId }: StockMovementHistoryProps) {
  const [filters, setFilters] = useState({
    search: '',
    movementType: undefined as 'IN' | 'OUT' | 'ADJUSTMENT' | undefined,
    dateFrom: '',
    dateTo: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data: movements, isLoading, error } = useStockMovements(productId)

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  // Filter movements based on current filters
  const filteredMovements = movements?.filter(movement => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!movement.reason?.toLowerCase().includes(searchLower) &&
          !movement.product?.name.toLowerCase().includes(searchLower)) {
        return false
      }
    }

    if (filters.movementType && movement.movementType !== filters.movementType) {
      return false
    }

    if (filters.dateFrom) {
      const movementDate = new Date(movement.createdAt).toISOString().split('T')[0]
      if (movementDate < filters.dateFrom) {
        return false
      }
    }

    if (filters.dateTo) {
      const movementDate = new Date(movement.createdAt).toISOString().split('T')[0]
      if (movementDate > filters.dateTo) {
        return false
      }
    }

    return true
  })

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return ArrowTrendingUpIcon
      case 'OUT':
        return ArrowTrendingDownIcon
      case 'ADJUSTMENT':
        return AdjustmentsHorizontalIcon
      default:
        return AdjustmentsHorizontalIcon
    }
  }

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'text-success-600 bg-success-100'
      case 'OUT':
        return 'text-error-600 bg-error-100'
      case 'ADJUSTMENT':
        return 'text-warning-600 bg-warning-100'
      default:
        return 'text-secondary-600 bg-secondary-100'
    }
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      movementType: undefined,
      dateFrom: '',
      dateTo: ''
    })
  }

  const hasActiveFilters = filters.search || filters.movementType || filters.dateFrom || filters.dateTo

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load stock movements. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Stock Movement History</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Track all inventory movements and transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="space-y-4">
          {/* Search and Toggle */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
              </div>
              <input
                type="text"
                placeholder="Search by product name or reason..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="input pl-10"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary ${showFilters ? 'bg-primary-50 text-primary-700 border-primary-300' : ''}`}
              >
                <FunnelIcon className="h-5 w-5" />
                Filters
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="btn-secondary text-error-600 hover:text-error-700 hover:bg-error-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-secondary-200">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Movement Type
                </label>
                <select
                  value={filters.movementType || ''}
                  onChange={(e) => handleFilterChange('movementType', e.target.value as 'IN' | 'OUT' | 'ADJUSTMENT' | undefined)}
                  className="input"
                >
                  <option value="">All Types</option>
                  <option value="IN">Stock In</option>
                  <option value="OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="input"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movements List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredMovements && filteredMovements.length > 0 ? (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-secondary-200">
              <thead className="bg-secondary-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  {!productId && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                      Product
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-secondary-200">
                {filteredMovements.map((movement) => {
                  const Icon = getMovementIcon(movement.movementType)
                  const colorClass = getMovementColor(movement.movementType)
                  
                  return (
                    <tr key={movement.id} className="hover:bg-secondary-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 text-secondary-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {new Date(movement.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {new Date(movement.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {!productId && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-secondary-900">
                            {movement.product?.name}
                          </div>
                          <div className="text-sm text-secondary-500">
                            SKU: {movement.product?.sku || 'N/A'}
                          </div>
                        </td>
                      )}
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          <Icon className="h-3 w-3 mr-1" />
                          {movement.movementType === 'IN' ? 'Stock In' :
                           movement.movementType === 'OUT' ? 'Stock Out' : 'Adjustment'}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          movement.quantity > 0 ? 'text-success-600' : 'text-error-600'
                        }`}>
                          {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {movement.product?.unitOfMeasure}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm text-secondary-900">
                          {movement.reason || 'No reason provided'}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <AdjustmentsHorizontalIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No movements found</h3>
          <p className="mt-1 text-sm text-secondary-500">
            {hasActiveFilters
              ? 'Try adjusting your filters to see more results.'
              : 'Stock movements will appear here when inventory changes occur.'
            }
          </p>
        </div>
      )}

      {/* Results Count */}
      {filteredMovements && filteredMovements.length > 0 && (
        <div className="text-sm text-secondary-600 text-center">
          Showing {filteredMovements.length} movement{filteredMovements.length !== 1 ? 's' : ''}
          {movements && filteredMovements.length !== movements.length && (
            <span> of {movements.length} total</span>
          )}
        </div>
      )}
    </div>
  )
}