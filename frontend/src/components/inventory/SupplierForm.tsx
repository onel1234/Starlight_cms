import { useState, useEffect } from 'react'
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useInventory'
import { Supplier, CreateSupplierData, UpdateSupplierData } from '../../types/inventory'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface SupplierFormProps {
  supplier?: Supplier
  onClose: () => void
  onSuccess: () => void
}

export function SupplierForm({ supplier, onClose, onSuccess }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    paymentTerms: '',
    rating: '',
    status: 'Active' as 'Active' | 'Inactive'
  })

  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const isEditing = !!supplier
  const isLoading = createSupplier.isPending || updateSupplier.isPending

  useEffect(() => {
    if (supplier) {
      setFormData({
        companyName: supplier.companyName,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        taxNumber: supplier.taxNumber || '',
        paymentTerms: supplier.paymentTerms || '',
        rating: supplier.rating.toString(),
        status: supplier.status
      })
    }
  }, [supplier])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const data = {
      companyName: formData.companyName.trim(),
      contactPerson: formData.contactPerson.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      taxNumber: formData.taxNumber.trim() || undefined,
      paymentTerms: formData.paymentTerms.trim() || undefined
    }

    try {
      if (isEditing) {
        await updateSupplier.mutateAsync({
          id: supplier.id,
          data: {
            ...data,
            rating: formData.rating ? parseFloat(formData.rating) : undefined,
            status: formData.status
          } as UpdateSupplierData
        })
      } else {
        await createSupplier.mutateAsync(data as CreateSupplierData)
      }
      onSuccess()
    } catch (error) {
      console.error('Failed to save supplier:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-secondary-200">
            <h2 className="text-xl font-semibold text-secondary-900">
              {isEditing ? 'Edit Supplier' : 'Add New Supplier'}
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
            {/* Company Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="input"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  className="input"
                  placeholder="Primary contact name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tax Number
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  className="input"
                  placeholder="Tax identification number"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="input"
                  placeholder="+1-555-0123"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className="input"
                placeholder="Complete business address"
              />
            </div>

            {/* Business Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Payment Terms
                </label>
                <select
                  value={formData.paymentTerms}
                  onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                  className="input"
                >
                  <option value="">Select payment terms</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="COD">Cash on Delivery</option>
                  <option value="Prepaid">Prepaid</option>
                </select>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Performance Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                    className="input"
                    placeholder="0.0 - 5.0"
                  />
                </div>
              )}
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
                isEditing ? 'Update Supplier' : 'Create Supplier'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}