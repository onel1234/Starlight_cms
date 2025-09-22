import { useState } from 'react'
import { Category } from '../../types/inventory'
import { useSuppliers } from '../../hooks/useInventory'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProductFiltersProps {
  filters: {
    search: string
    categoryId?: number
    supplierId?: number
    status?: 'Active' | 'Inactive'
    lowStock: boolean
  }
  onFiltersChange: (filters: {
    search: string
    categoryId?: number
    supplierId?: number
    status?: 'Active' | 'Inactive'
    lowStock: boolean
  }) => void
  categories: Category[]
}

export function ProductFilters({ filters, onFiltersChange, categories }: ProductFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { data: suppliers } = useSuppliers({ status: 'Active' })

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      categoryId: undefined,
      supplierId: undefined,
      status: undefined,
      lowStock: false
    })
  }

  const hasActiveFilters = filters.search || filters.categoryId || filters.supplierId || filters.status || filters.lowStock

  // Get root categories (no parent)
  const rootCategories = categories.filter(cat => !cat.parentId)

  return (
    <div className="card">
      <div className="space-y-4">
        {/* Search and Toggle */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-secondary-400" />
            </div>
            <input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`btn-secondary ${showAdvanced ? 'bg-primary-50 text-primary-700 border-primary-300' : ''}`}
            >
              <FunnelIcon className="h-5 w-5" />
              Filters
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="btn-secondary text-error-600 hover:text-error-700 hover:bg-error-50"
              >
                <XMarkIcon className="h-5 w-5" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-secondary-200">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Category
              </label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
                className="input"
              >
                <option value="">All Categories</option>
                {rootCategories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    <option value={category.id}>{category.name}</option>
                    {category.children?.map((child) => (
                      <option key={child.id} value={child.id}>
                        └ {child.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Supplier Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Supplier
              </label>
              <select
                value={filters.supplierId || ''}
                onChange={(e) => handleFilterChange('supplierId', e.target.value ? Number(e.target.value) : undefined)}
                className="input"
              >
                <option value="">All Suppliers</option>
                {suppliers?.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.companyName}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Status
              </label>
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

            {/* Low Stock Toggle */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Stock Level
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.lowStock}
                  onChange={(e) => handleFilterChange('lowStock', e.target.checked)}
                  className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-secondary-700">Low stock only</span>
              </label>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-secondary-200">
            <span className="text-sm text-secondary-600">Active filters:</span>
            
            {filters.search && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.categoryId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Category: {categories.find(c => c.id === filters.categoryId)?.name}
                <button
                  onClick={() => handleFilterChange('categoryId', undefined)}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.supplierId && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Supplier: {suppliers?.find(s => s.id === filters.supplierId)?.companyName}
                <button
                  onClick={() => handleFilterChange('supplierId', undefined)}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.status && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                Status: {filters.status}
                <button
                  onClick={() => handleFilterChange('status', undefined)}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.lowStock && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                Low Stock Only
                <button
                  onClick={() => handleFilterChange('lowStock', false)}
                  className="ml-1 text-warning-600 hover:text-warning-800"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}