import { useState } from 'react'
import { useCreateStockMovement } from '../../hooks/useInventory'
import { Product } from '../../types/inventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { 
  XMarkIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface StockMovementFormProps {
  product: Product
  onClose: () => void
  onSuccess: () => void
}

export function StockMovementForm({ product, onClose, onSuccess }: StockMovementFormProps) {
  const [formData, setFormData] = useState({
    movementType: 'IN' as 'IN' | 'OUT' | 'ADJUSTMENT',
    quantity: '',
    reason: ''
  })

  const createStockMovement = useCreateStockMovement()

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const quantity = parseInt(formData.quantity)
    if (isNaN(quantity) || quantity === 0) {
      return
    }

    // For OUT movements, make quantity negative
    const adjustedQuantity = formData.movementType === 'OUT' ? -Math.abs(quantity) : 
                            formData.movementType === 'ADJUSTMENT' ? quantity :
                            Math.abs(quantity)

    try {
      await createStockMovement.mutateAsync({
        productId: product.id,
        movementType: formData.movementType,
        quantity: adjustedQuantity,
        reason: formData.reason.trim() || undefined
      })
      onSuccess()
    } catch (error) {
      console.error('Failed to create stock movement:', error)
    }
  }

  const movementTypes = [
    {
      value: 'IN',
      label: 'Stock In',
      description: 'Add inventory (purchase, return, etc.)',
      icon: ArrowTrendingUpIcon,
      color: 'text-success-600'
    },
    {
      value: 'OUT',
      label: 'Stock Out',
      description: 'Remove inventory (sale, usage, etc.)',
      icon: ArrowTrendingDownIcon,
      color: 'text-error-600'
    },
    {
      value: 'ADJUSTMENT',
      label: 'Adjustment',
      description: 'Inventory correction (damage, count adjustment)',
      icon: AdjustmentsHorizontalIcon,
      color: 'text-warning-600'
    }
  ] as const

  const selectedType = movementTypes.find(type => type.value === formData.movementType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">
              Update Stock
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-6">
            {/* Product Info */}
            <div className="bg-secondary-50 p-4 rounded-lg">
              <h3 className="font-medium text-secondary-900">{product.name}</h3>
              <p className="text-sm text-secondary-600">SKU: {product.sku || 'N/A'}</p>
              <p className="text-sm text-secondary-600">
                Current Stock: {product.stockQuantity} {product.unitOfMeasure}
              </p>
            </div>

            {/* Movement Type */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                Movement Type
              </label>
              <div className="space-y-2">
                {movementTypes.map((type) => {
                  const Icon = type.icon
                  return (
                    <label
                      key={type.value}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.movementType === type.value
                          ? 'border-primary-300 bg-primary-50'
                          : 'border-secondary-200 hover:bg-secondary-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="movementType"
                        value={type.value}
                        checked={formData.movementType === type.value}
                        onChange={(e) => handleInputChange('movementType', e.target.value)}
                        className="sr-only"
                      />
                      <Icon className={`h-5 w-5 ${type.color} mr-3`} />
                      <div className="flex-1">
                        <div className="font-medium text-secondary-900">{type.label}</div>
                        <div className="text-sm text-secondary-600">{type.description}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Quantity *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  className="input pr-20"
                  placeholder="Enter quantity"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-secondary-500 text-sm">{product.unitOfMeasure}</span>
                </div>
              </div>
              {formData.movementType === 'ADJUSTMENT' && (
                <p className="mt-1 text-xs text-secondary-600">
                  Use positive numbers to increase stock, negative to decrease
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={3}
                className="input"
                placeholder="Enter reason for stock movement (optional)"
              />
            </div>

            {/* Preview */}
            {formData.quantity && selectedType && (
              <div className="bg-secondary-50 p-4 rounded-lg">
                <h4 className="font-medium text-secondary-900 mb-2">Preview</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Current Stock:</span>
                    <span>{product.stockQuantity} {product.unitOfMeasure}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Change:</span>
                    <span className={selectedType.color}>
                      {formData.movementType === 'OUT' ? '-' : 
                       formData.movementType === 'ADJUSTMENT' && parseInt(formData.quantity) < 0 ? '' : '+'}
                      {Math.abs(parseInt(formData.quantity) || 0)} {product.unitOfMeasure}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium border-t border-secondary-200 pt-1">
                    <span>New Stock:</span>
                    <span>
                      {formData.movementType === 'OUT' 
                        ? product.stockQuantity - Math.abs(parseInt(formData.quantity) || 0)
                        : formData.movementType === 'ADJUSTMENT'
                        ? product.stockQuantity + (parseInt(formData.quantity) || 0)
                        : product.stockQuantity + Math.abs(parseInt(formData.quantity) || 0)
                      } {product.unitOfMeasure}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={createStockMovement.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={createStockMovement.isPending || !formData.quantity}
            >
              {createStockMovement.isPending ? (
                <>
                  <LoadingSpinner size="sm" />
                  Updating...
                </>
              ) : (
                'Update Stock'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}