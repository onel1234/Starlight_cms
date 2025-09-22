import React, { useState, useEffect } from 'react';
import { 
  TrashIcon, 
  DocumentArrowDownIcon,
  EnvelopeIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation } from '../../hooks/useFinancial';
import { Quotation, CreateQuotationData } from '../../types/financial';
import { Product } from '../../types/inventory';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';
import { mockInventoryService } from '../../services/mockInventoryService';

interface QuotationBuilderProps {
  quotation?: Quotation;
  onSave?: (quotation: Quotation) => void;
  onCancel?: () => void;
}

export const QuotationBuilder: React.FC<QuotationBuilderProps> = ({
  quotation,
  onSave,
  onCancel
}) => {
  const { success, error } = useToast();
  const { data: quotations, isLoading: quotationsLoading } = useQuotations();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();

  const [isEditing, setIsEditing] = useState(!quotation);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(quotation || null);
  const [formData, setFormData] = useState<CreateQuotationData>({
    customerId: 0,
    projectId: undefined,
    validUntil: undefined,
    notes: '',
    items: []
  });
  const [draggedProduct, setDraggedProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<{ products: Product[] }>({ products: [] });

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const response = await mockInventoryService.getProducts({});
        setInventory({ products: response.products });
      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    };
    loadInventory();
  }, []);

  useEffect(() => {
    if (quotation) {
      setFormData({
        customerId: quotation.customerId,
        projectId: quotation.projectId,
        validUntil: quotation.validUntil,
        notes: quotation.notes || '',
        items: quotation.items?.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description
        })) || []
      });
    }
  }, [quotation]);

  const handleDragStart = (product: Product) => {
    setDraggedProduct(product);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedProduct && !formData.items.find(item => item.productId === draggedProduct.id)) {
      const newItem = {
        productId: draggedProduct.id,
        quantity: 1,
        unitPrice: draggedProduct.unitPrice,
        description: draggedProduct.name
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
      setDraggedProduct(null);
    }
  };

  const addProductToQuotation = (product: Product) => {
    if (!formData.items.find(item => item.productId === product.id)) {
      const newItem = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.unitPrice,
        description: product.name
      };
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }));
    }
  };

  const removeItem = (productId: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.productId !== productId)
    }));
  };

  const updateItemQuantity = (productId: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    }));
  };

  const updateItemPrice = (productId: number, unitPrice: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.productId === productId ? { ...item, unitPrice } : item
      )
    }));
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxRate = 0.1; // 10% tax
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSave = async () => {
    try {
      if (!formData.customerId) {
        error('Please select a customer');
        return;
      }

      const { taxAmount, total } = calculateTotals();
      const quotationData = {
        ...formData,
        taxAmount,
        totalAmount: total,
        discountAmount: 0,
        items: formData.items.map(item => ({
          ...item,
          id: 0,
          quotationId: selectedQuotation?.id || 0,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      if (selectedQuotation) {
        const updated = await updateQuotation.mutateAsync({
          id: selectedQuotation.id,
          data: quotationData
        });
        setSelectedQuotation(updated);
        onSave?.(updated);
      } else {
        const created = await createQuotation.mutateAsync(quotationData);
        setSelectedQuotation(created);
        onSave?.(created);
      }
      
      setIsEditing(false);
      success('Quotation saved successfully');
    } catch (err) {
      error('Failed to save quotation');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      try {
        await deleteQuotation.mutateAsync(id);
        success('Quotation deleted successfully');
        setSelectedQuotation(null);
        setIsEditing(true);
      } catch (err) {
        error('Failed to delete quotation');
      }
    }
  };

  if (quotationsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {isEditing ? (selectedQuotation ? 'Edit Quotation' : 'Create New Quotation') : 'Quotation Details'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? 'Build dynamic quotations with drag-drop product selection' : 'View quotation details'}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isEditing && selectedQuotation && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <PencilIcon className="h-4 w-4" />
                <span>Edit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>PDF</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                <EnvelopeIcon className="h-4 w-4" />
                <span>Email</span>
              </button>
            </>
          )}
          {isEditing && (
            <>
              <button
                onClick={handleSave}
                disabled={createQuotation.isPending || updateQuotation.isPending}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <span>Save</span>
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  onCancel?.();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Catalog */}
        {isEditing && (
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Product Catalog
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inventory?.products?.map((product: Product) => (
                  <div
                    key={product.id}
                    draggable
                    onDragStart={() => handleDragStart(product)}
                    onClick={() => addProductToQuotation(product)}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {product.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          SKU: {product.sku}
                        </p>
                      </div>
                      <span className="text-lg font-semibold text-green-600">
                        ${product.unitPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quotation Form/Details */}
        <div className={isEditing ? 'lg:col-span-2' : 'lg:col-span-3'}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Customer ID
                    </label>
                    <input
                      type="number"
                      value={formData.customerId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter customer ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Project ID (Optional)
                    </label>
                    <input
                      type="number"
                      value={formData.projectId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectId: parseInt(e.target.value) || undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter project ID"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil ? formData.validUntil.toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value ? new Date(e.target.value) : undefined }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Items Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Quotation Items
                  </h4>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 min-h-32"
                  >
                    {formData.items.length === 0 ? (
                      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Drag products here or click on products to add them to the quotation
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {formData.items.map((item, index) => {
                          const product = inventory?.products?.find((p: Product) => p.id === item.productId);
                          return (
                            <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {product?.name || item.description}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  SKU: {product?.sku}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-600 dark:text-white"
                                  min="1"
                                />
                                <span className="text-gray-500">×</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => updateItemPrice(item.productId, parseFloat(e.target.value) || 0)}
                                  className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-center dark:bg-gray-600 dark:text-white"
                                  step="0.01"
                                />
                                <span className="text-gray-500">=</span>
                                <span className="w-24 text-right font-medium">
                                  ${(item.quantity * item.unitPrice).toFixed(2)}
                                </span>
                                <button
                                  onClick={() => removeItem(item.productId)}
                                  className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Totals */}
                {formData.items.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="space-y-2 text-right">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateTotals().subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax (10%):</span>
                        <span>${calculateTotals().taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold border-t pt-2">
                        <span>Total:</span>
                        <span>${calculateTotals().total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Additional notes or terms..."
                  />
                </div>
              </div>
            ) : (
              // View Mode
              selectedQuotation && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">Quotation #{selectedQuotation.quotationNumber}</h3>
                      <p className="text-gray-600 dark:text-gray-400">Status: {selectedQuotation.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">${selectedQuotation.totalAmount.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Valid until: {selectedQuotation.validUntil?.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedQuotation.items && selectedQuotation.items.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">Items</h4>
                      <div className="space-y-2">
                        {selectedQuotation.items.map((item) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                            <div>
                              <span className="font-medium">{item.description}</span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2">
                                {item.quantity} × ${item.unitPrice.toFixed(2)}
                              </span>
                            </div>
                            <span className="font-semibold">${item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Existing Quotations List */}
      {!quotation && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Recent Quotations
          </h3>
          <div className="space-y-3">
            {quotations?.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => setSelectedQuotation(q)}
              >
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {q.quotationNumber}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer ID: {q.customerId} • ${q.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    q.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    q.status === 'Sent' ? 'bg-blue-100 text-blue-800' :
                    q.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {q.status}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuotation(q);
                    }}
                    className="p-1 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(q.id);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

