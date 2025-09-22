import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useTenderDetails, useSubmitQuotation } from '../../../hooks/useExternal'
import { useAuth } from '../../../hooks/useAuth'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { formatters } from '../../../utils/formatters'
import { QuotationItem } from '../../../types/external'

export const QuotationForm: React.FC = () => {
  const { tenderId } = useParams<{ tenderId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: tender, isLoading: tenderLoading } = useTenderDetails(Number(tenderId))
  const submitQuotation = useSubmitQuotation()

  const [formData, setFormData] = useState({
    validUntil: '',
    notes: ''
  })

  const [items, setItems] = useState<Omit<QuotationItem, 'id'>[]>([
    {
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      specifications: ''
    }
  ])

  if (tenderLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!tender) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Tender Not Found</h3>
        <p className="text-red-600 mt-2">Unable to load tender details.</p>
      </div>
    )
  }

  const updateItem = (index: number, field: keyof Omit<QuotationItem, 'id'>, value: string | number) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, {
      productName: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      specifications: ''
    }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user?.id || !tenderId) return

    try {
      await submitQuotation.mutateAsync({
        tenderId: Number(tenderId),
        supplierId: user.id,
        quotationNumber: `QUO-${Date.now()}`,
        totalAmount,
        status: 'Submitted',
        validUntil: new Date(formData.validUntil),
        items: items.map((item, index) => ({ ...item, id: index + 1 })),
        notes: formData.notes
      })
      
      navigate('/supplier/quotations')
    } catch (error) {
      console.error('Failed to submit quotation:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 mb-2">
          <Link
            to={`/supplier/tenders/${tenderId}`}
            className="text-green-600 hover:text-green-700 text-sm font-medium"
          >
            ← Back to Tender Details
          </Link>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900">Submit Quotation</h1>
        <p className="text-gray-600 mt-1">
          Create your quotation for: {tender.title}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tender Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Tender Summary</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Deadline:</span>
              <div className="text-blue-700">{formatters.date(tender.submissionDeadline)}</div>
            </div>
            {tender.estimatedValue && (
              <div>
                <span className="font-medium text-blue-800">Estimated Value:</span>
                <div className="text-blue-700">{formatters.currency(tender.estimatedValue)}</div>
              </div>
            )}
          </div>
        </div>    
    {/* Quotation Items */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Quotation Items</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={item.productName}
                      onChange={(e) => updateItem(index, 'productName', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Price
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formatters.currency(item.totalPrice)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specifications
                    </label>
                    <textarea
                      rows={2}
                      value={item.specifications}
                      onChange={(e) => updateItem(index, 'specifications', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">
                {formatters.currency(totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Quotation Details */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quotation Details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valid Until *
              </label>
              <input
                type="date"
                required
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes, terms, or conditions..."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to={`/supplier/tenders/${tenderId}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancel
          </Link>
          
          <button
            type="submit"
            disabled={submitQuotation.isPending || totalAmount === 0}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {submitQuotation.isPending ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">Submitting...</span>
              </>
            ) : (
              'Submit Quotation'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}