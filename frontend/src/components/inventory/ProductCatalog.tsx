import { useState } from 'react'
import { useProducts, useCategories } from '../../hooks/useInventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ProductCard } from './ProductCard'
import { ProductFilters } from './ProductFilters'
import { ProductForm } from './ProductForm'
import {
  PlusIcon,
  ViewColumnsIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'

type ViewMode = 'grid' | 'list'

export function ProductCatalog() {
  const [filters, setFilters] = useState({
    search: '',
    categoryId: undefined as number | undefined,
    supplierId: undefined as number | undefined,
    status: undefined as 'Active' | 'Inactive' | undefined,
    lowStock: false
  })
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showCreateForm, setShowCreateForm] = useState(false)

  const { data: products, isLoading, error } = useProducts(filters)
  const { data: categories } = useCategories()

  const handleFilterChange = (newFilters: {
    search: string
    categoryId?: number
    supplierId?: number
    status?: 'Active' | 'Inactive'
    lowStock: boolean
  }) => {
    setFilters({
      search: newFilters.search,
      categoryId: newFilters.categoryId ?? undefined,
      supplierId: newFilters.supplierId ?? undefined,
      status: newFilters.status ?? undefined,
      lowStock: newFilters.lowStock
    })
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-error-600">Failed to load products. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900">Product Catalog</h2>
          <p className="mt-1 text-sm text-secondary-600">
            Manage your inventory products and specifications
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-secondary-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-l-lg ${viewMode === 'grid'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-600 hover:bg-secondary-50'
                }`}
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-r-lg ${viewMode === 'list'
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-secondary-600 hover:bg-secondary-50'
                }`}
            >
              <ViewColumnsIcon className="h-5 w-5" />
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-5 w-5" />
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <ProductFilters
        filters={filters}
        onFiltersChange={handleFilterChange}
        categories={categories || []}
      />

      {/* Products Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : products && products.length > 0 ? (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Squares2X2Icon className="mx-auto h-12 w-12 text-secondary-400" />
          <h3 className="mt-2 text-sm font-medium text-secondary-900">No products found</h3>
          <p className="mt-1 text-sm text-secondary-500">
            {filters.search || filters.categoryId || filters.supplierId || filters.status || filters.lowStock
              ? 'Try adjusting your filters to see more results.'
              : 'Get started by adding your first product.'
            }
          </p>
          {!filters.search && !filters.categoryId && !filters.supplierId && !filters.status && !filters.lowStock && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateForm(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5" />
                Add Product
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Count */}
      {products && products.length > 0 && (
        <div className="text-sm text-secondary-600 text-center">
          Showing {products.length} product{products.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Create Product Modal */}
      {showCreateForm && (
        <ProductForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => setShowCreateForm(false)}
        />
      )}
    </div>
  )
}