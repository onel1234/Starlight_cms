import { useState } from 'react'
import { Product } from '../../types/inventory'
import { formatCurrency } from '../../utils/formatters'
import { ProductForm } from './ProductForm'
import { StockMovementForm } from './StockMovementForm'
import { ProductImageGallery } from './ProductImageGallery'
import { 
  PencilIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  TagIcon,
  BuildingStorefrontIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

interface ProductCardProps {
  product: Product
  viewMode: 'grid' | 'list'
}

interface ProductDetailsModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

const ProductDetailsModal = ({ product, isOpen, onClose }: ProductDetailsModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <div>
            <h2 className="text-2xl font-semibold text-secondary-900">{product.name}</h2>
            <p className="text-sm text-secondary-600">SKU: {product.sku || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Images */}
          {product.imageUrls && product.imageUrls.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-3">Product Images</h3>
              <ProductImageGallery
                images={product.imageUrls}
                onImagesChange={() => {}} // Read-only
                allowUpload={false}
                allowDelete={false}
              />
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-3">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-secondary-700">Description:</span>
                  <p className="text-sm text-secondary-900 mt-1">
                    {product.description || 'No description available'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-700">Category:</span>
                  <p className="text-sm text-secondary-900 mt-1">
                    {product.category?.name || 'Uncategorized'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-700">Supplier:</span>
                  <p className="text-sm text-secondary-900 mt-1">
                    {product.supplier?.companyName || 'No supplier assigned'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-700">Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    product.status === 'Active'
                      ? 'bg-success-100 text-success-800'
                      : 'bg-secondary-100 text-secondary-800'
                  }`}>
                    {product.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-3">Pricing & Inventory</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-secondary-700">Unit Price:</span>
                  <p className="text-lg font-semibold text-secondary-900 mt-1">
                    {formatCurrency(product.unitPrice)} per {product.unitOfMeasure}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-700">Current Stock:</span>
                  <p className="text-sm text-secondary-900 mt-1">
                    {product.stockQuantity} {product.unitOfMeasure}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-700">Minimum Stock:</span>
                  <p className="text-sm text-secondary-900 mt-1">
                    {product.minimumStock} {product.unitOfMeasure}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-secondary-700">Stock Status:</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                    product.stockQuantity <= product.minimumStock
                      ? 'bg-warning-100 text-warning-800'
                      : 'bg-success-100 text-success-800'
                  }`}>
                    {product.stockQuantity <= product.minimumStock ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-secondary-900 mb-3">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                    <span className="font-medium text-secondary-700">{key}:</span>
                    <span className="text-secondary-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-secondary-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-secondary-600">
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2">{new Date(product.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <span className="ml-2">{new Date(product.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-secondary-200">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export function ProductCard({ product, viewMode }: ProductCardProps) {
  const [showEditForm, setShowEditForm] = useState(false)
  const [showStockForm, setShowStockForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const isLowStock = product.stockQuantity <= product.minimumStock
  const stockPercentage = (product.stockQuantity / (product.minimumStock * 2)) * 100

  if (viewMode === 'list') {
    return (
      <>
        <div className="card hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Product Image */}
              <div className="flex-shrink-0">
                {product.imageUrls && product.imageUrls.length > 0 ? (
                  <img
                    src={product.imageUrls[0]}
                    alt={product.name}
                    className="h-16 w-16 rounded-lg object-cover bg-secondary-100"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                ) : null}
                <div className={`h-16 w-16 rounded-lg bg-secondary-100 flex items-center justify-center ${
                  product.imageUrls && product.imageUrls.length > 0 ? 'hidden' : ''
                }`}>
                  <CubeIcon className="h-8 w-8 text-secondary-400" />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-secondary-900 truncate">
                    {product.name}
                  </h3>
                  {isLowStock && (
                    <ExclamationTriangleIcon className="h-5 w-5 text-warning-500 flex-shrink-0" />
                  )}
                </div>
                
                <div className="mt-1 flex items-center space-x-4 text-sm text-secondary-600">
                  <span className="flex items-center">
                    <TagIcon className="h-4 w-4 mr-1" />
                    {product.sku || 'No SKU'}
                  </span>
                  {product.category && (
                    <span>{product.category.name}</span>
                  )}
                  {product.supplier && (
                    <span className="flex items-center">
                      <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                      {product.supplier.companyName}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Info */}
              <div className="text-right">
                <p className="text-lg font-semibold text-secondary-900">
                  {formatCurrency(product.unitPrice)}
                </p>
                <div className="mt-1">
                  <p className={`text-sm font-medium ${
                    isLowStock ? 'text-warning-600' : 'text-secondary-900'
                  }`}>
                    Stock: {product.stockQuantity} {product.unitOfMeasure}
                  </p>
                  <div className="mt-1 w-24 bg-secondary-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isLowStock ? 'bg-warning-500' : 'bg-success-500'
                      }`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setShowDetails(true)}
                className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
                title="View Details"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowStockForm(true)}
                className="p-2 text-primary-600 hover:text-primary-900 hover:bg-primary-100 rounded-lg"
                title="Update Stock"
              >
                <CubeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                className="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
                title="Edit Product"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Modals */}
        <ProductDetailsModal
          product={product}
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
        />

        {showEditForm && (
          <ProductForm
            product={product}
            onClose={() => setShowEditForm(false)}
            onSuccess={() => setShowEditForm(false)}
          />
        )}

        {showStockForm && (
          <StockMovementForm
            product={product}
            onClose={() => setShowStockForm(false)}
            onSuccess={() => setShowStockForm(false)}
          />
        )}
      </>
    )
  }

  // Grid view
  return (
    <>
      <div className="card hover:shadow-lg transition-shadow group">
        {/* Product Image */}
        <div className="aspect-square mb-4 relative overflow-hidden rounded-lg bg-secondary-100">
          {product.imageUrls && product.imageUrls.length > 0 ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${
            product.imageUrls && product.imageUrls.length > 0 ? 'hidden' : ''
          }`}>
            <CubeIcon className="h-16 w-16 text-secondary-400" />
          </div>

          {/* Low Stock Badge */}
          {isLowStock && (
            <div className="absolute top-2 right-2 bg-warning-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
              Low Stock
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <button
                onClick={() => setShowDetails(true)}
                className="p-2 bg-white text-secondary-600 hover:text-secondary-900 rounded-lg shadow-lg"
                title="View Details"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowStockForm(true)}
                className="p-2 bg-white text-primary-600 hover:text-primary-900 rounded-lg shadow-lg"
                title="Update Stock"
              >
                <CubeIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowEditForm(true)}
                className="p-2 bg-white text-secondary-600 hover:text-secondary-900 rounded-lg shadow-lg"
                title="Edit Product"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-3">
          <div>
            <h3 className="font-medium text-secondary-900 truncate" title={product.name}>
              {product.name}
            </h3>
            <p className="text-sm text-secondary-600 flex items-center mt-1">
              <TagIcon className="h-4 w-4 mr-1" />
              {product.sku || 'No SKU'}
            </p>
          </div>

          {/* Category and Supplier */}
          <div className="space-y-1">
            {product.category && (
              <p className="text-xs text-secondary-500">{product.category.name}</p>
            )}
            {product.supplier && (
              <p className="text-xs text-secondary-500 flex items-center">
                <BuildingStorefrontIcon className="h-3 w-3 mr-1" />
                {product.supplier.companyName}
              </p>
            )}
          </div>

          {/* Price and Stock */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-secondary-900">
                {formatCurrency(product.unitPrice)}
              </span>
              <span className="text-sm text-secondary-600">
                per {product.unitOfMeasure}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-secondary-600">Stock</span>
                <span className={`font-medium ${
                  isLowStock ? 'text-warning-600' : 'text-secondary-900'
                }`}>
                  {product.stockQuantity} / {product.minimumStock}
                </span>
              </div>
              <div className="mt-1 w-full bg-secondary-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isLowStock ? 'bg-warning-500' : 'bg-success-500'
                  }`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductDetailsModal
        product={product}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />

      {showEditForm && (
        <ProductForm
          product={product}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}

      {showStockForm && (
        <StockMovementForm
          product={product}
          onClose={() => setShowStockForm(false)}
          onSuccess={() => setShowStockForm(false)}
        />
      )}
    </>
  )
}