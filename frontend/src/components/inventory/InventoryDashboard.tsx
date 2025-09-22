import { useDashboardStats, useLowStockProducts } from '../../hooks/useInventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'
import { 
  ChartBarIcon, 
  CubeIcon, 
  ExclamationTriangleIcon, 
  BuildingStorefrontIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'

export function InventoryDashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: lowStockProducts, isLoading: lowStockLoading } = useLowStockProducts()

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CubeIcon className="h-8 w-8 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Products</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-8 w-8 text-warning-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Low Stock Items</p>
              <p className="text-2xl font-semibold text-warning-600">{stats?.lowStockCount || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Value</p>
              <p className="text-2xl font-semibold text-secondary-900">
                {formatCurrency(stats?.totalValue || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BuildingStorefrontIcon className="h-8 w-8 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Active Suppliers</p>
              <p className="text-2xl font-semibold text-secondary-900">{stats?.activeSuppliers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Low Stock Alerts</h3>
            <ExclamationTriangleIcon className="h-5 w-5 text-warning-500" />
          </div>
          
          {lowStockLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-warning-50 rounded-lg border border-warning-200">
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">{product.name}</p>
                    <p className="text-sm text-secondary-600">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-warning-700">
                      {product.stockQuantity} / {product.minimumStock}
                    </p>
                    <p className="text-xs text-secondary-500">{product.unitOfMeasure}</p>
                  </div>
                </div>
              ))}
              {lowStockProducts.length > 5 && (
                <p className="text-sm text-secondary-600 text-center pt-2">
                  +{lowStockProducts.length - 5} more items need attention
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-secondary-400" />
              <p className="mt-2 text-sm text-secondary-600">No low stock items</p>
            </div>
          )}
        </div>

        {/* Recent Stock Movements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-secondary-900">Recent Stock Movements</h3>
            <ChartBarIcon className="h-5 w-5 text-secondary-500" />
          </div>
          
          {stats?.recentMovements && stats.recentMovements.length > 0 ? (
            <div className="space-y-3">
              {stats.recentMovements.map((movement) => (
                <div key={movement.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded-full ${
                      movement.movementType === 'IN' 
                        ? 'bg-success-100 text-success-600'
                        : movement.movementType === 'OUT'
                        ? 'bg-error-100 text-error-600'
                        : 'bg-warning-100 text-warning-600'
                    }`}>
                      {movement.movementType === 'IN' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{movement.product?.name}</p>
                      <p className="text-sm text-secondary-600">{movement.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      movement.movementType === 'IN' 
                        ? 'text-success-600'
                        : 'text-error-600'
                    }`}>
                      {movement.movementType === 'IN' ? '+' : ''}{movement.quantity}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {new Date(movement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChartBarIcon className="mx-auto h-12 w-12 text-secondary-400" />
              <p className="mt-2 text-sm text-secondary-600">No recent movements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}