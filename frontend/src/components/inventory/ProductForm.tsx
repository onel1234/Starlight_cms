import { useState, useEffect } from 'react'
import { useCreateProduct, useUpdateProduct, useCategories, useSuppliers } from '../../hooks/useInventory'
import { Product, CreateProductData, UpdateProductData } from '../../types/inventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { ProductImageGallery } from './ProductImageGallery'
import { 
  XMarkIcon,
  PlusIcon,
  TrashIcon
} from '@heroicons/react/24/outline'

interface ProductFormProps {
  product?: Product
  onClose: () => void
  onSuccess: () => void
}

export function ProductForm({ product, onClose, onSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    categoryId: undefined as number | undefined,
    supplierId: undefined as number | undefined,
    unitPrice: '',
    stockQuantity: '',
    minimumStock: '',
    unitOfMeasure: '',
    imageUrls: [] as string[],
    specifications: {} as Record<string, string>,
    status: 'Active' as 'Active' | 'Inactive'
  })

  const [specificationKey, setSpecificationKey] = useState('')
  const [specificationValue, setSpecificationValue] = useState('')

  const { data: categories } = useCategories()
  const { data: suppliers } = useSuppliers({ status: 'Active' })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()

  const isEditing = !!product
  const isLoading = createProduct.isPending || updateProduct.isPending

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        sku: product.sku || '',
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        unitPrice: product.unitPrice.toString(),
        stockQuantity: product.stockQuantity.toString(),
        minimumStock: product.minimumStock.toString(),
        unitOfMeasure: product.unitOfMeasure || '',
        imageUrls: product.imageUrls || [],
        specifications: product.specifications || {},
        status: product.status
      })
    }
  }, [product])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addSpecification = () => {
    if (specificationKey.trim() && specificationValue.trim()) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [specificationKey.trim()]: specificationValue.trim()
        }
      }))
      setSpecificationKey('')
      setSpecificationValue('')
    }
  }

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications }
      delete newSpecs[key]
      return {
        ...prev,
        specifications: newSpecs
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      sku: formData.sku.trim() || undefined,
      categoryId: formData.categoryId,
      supplierId: formData.supplierId,
      unitPrice: parseFloat(formData.unitPrice),
      stockQuantity: parseInt(formData.stockQuantity),
      minimumStock: parseInt(formData.minimumStock),
      unitOfMeasure: formData.unitOfMeasure.trim() || undefined,
      imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined,
      specifications: Object.keys(formData.specifications).length > 0 ? formData.specifications : undefined
    }

    try {
      if (isEditing) {
        await updateProduct.mutateAsync({
          id: product.id,
          data: { ...data, status: formData.status } as UpdateProductData
        })
      } else {
        await createProduct.mutateAsync(data as CreateProductData)
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">
              {isEditing ? 'Edit Product' : 'Add New Product'}
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
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
                  className="input"
                  placeholder="Product SKU"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Unit of Measure
                </label>
                <input
                  type="text"
                  value={formData.unitOfMeasure}
                  onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
                  className="input"
                  placeholder="e.g., piece, kg, meter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.categoryId || ''}
                  onChange={(e) => handleInputChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                >
                  <option value="">Select Category</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.parentId ? `└ ${category.name}` : category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Supplier
                </label>
                <select
                  value={formData.supplierId || ''}
                  onChange={(e) => handleInputChange('supplierId', e.target.value ? Number(e.target.value) : undefined)}
                  className="input"
                >
                  <option value="">Select Supplier</option>
                  {suppliers?.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.companyName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="input"
                placeholder="Product description"
              />
            </div>

            {/* Pricing and Stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Unit Price *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.unitPrice}
                  onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                  className="input"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Stock Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.stockQuantity}
                  onChange={(e) => handleInputChange('stockQuantity', e.target.value)}
                  className="input"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Minimum Stock *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.minimumStock}
                  onChange={(e) => handleInputChange('minimumStock', e.target.value)}
                  className="input"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Status (only for editing) */}
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'Active' | 'Inactive')}
                  className="input"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            )}

            {/* Product Images */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Product Images
              </label>
              <ProductImageGallery
                images={formData.imageUrls}
                onImagesChange={(images) => handleInputChange('imageUrls', images)}
                maxImages={5}
                allowUpload={true}
                allowDelete={true}
              />
            </div>

            {/* Specifications */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Specifications
              </label>
              
              {/* Add Specification */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={specificationKey}
                  onChange={(e) => setSpecificationKey(e.target.value)}
                  placeholder="Property name"
                  className="input flex-1"
                />
                <input
                  type="text"
                  value={specificationValue}
                  onChange={(e) => setSpecificationValue(e.target.value)}
                  placeholder="Value"
                  className="input flex-1"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="btn-secondary"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Existing Specifications */}
              {Object.entries(formData.specifications).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 bg-secondary-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-secondary-900">{key}:</span>
                        <span className="ml-2 text-secondary-700">{value}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-error-600 hover:text-error-800"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Product' : 'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}