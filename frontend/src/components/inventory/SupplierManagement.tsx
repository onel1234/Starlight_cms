import { useState } from 'react'
import { useSuppliers } from '../../hooks/useInventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { SupplierCard } from './SupplierCard'
import { SupplierForm } from './SupplierForm'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'

export function SupplierManagement() {
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as 'Active' | 'Inactive' | undefined
  })
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: suppliers, isLoading, error } = useSuppliers(filters)

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load suppliers. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Supplier Management</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Manage supplier relationships and performance metrics
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary"
        >
          <PlusIcon className="h-5 w-5" />
          Add Supplier
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search suppliers by name, contact, or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as 'Active' | 'Inactive' | undefined)}
              className="input"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : suppliers && suppliers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <BuildingStorefrontIcon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No suppliers found</h3>
          <p className="mt-1 text-sm text-secondary-500">
            {filters.search || filters.status
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first supplier.'
            }
          </p>
          {!filters.search && !filters.status && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5" />
                Add Supplier
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {suppliers && suppliers.length > 0 && (
        <div className="text-sm text-secondary-600 text-center">
          Showing {suppliers.length} supplier{suppliers.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Create Supplier Modal */}
      {showCreateForm && (
        <SupplierForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}