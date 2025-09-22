import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  DocumentCheckIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { usePurchaseOrders, useCreatePurchaseOrder, useUpdatePurchaseOrder } from '../../hooks/useFinancial';
import { PurchaseOrder, PurchaseOrderStatus, CreatePurchaseOrderData } from '../../types/financial';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const statusConfig = {
  'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: ClockIcon },
  'Approved': { color: 'bg-blue-100 text-blue-800', icon: CheckCircleIcon },
  'Delivered': { color: 'bg-green-100 text-green-800', icon: TruckIcon },
  'Completed': { color: 'bg-gray-100 text-gray-800', icon: DocumentCheckIcon }
};

export const PurchaseOrderManagement: React.FC = () => {
  const { success, error } = useToast();
  const { data: purchaseOrders, isLoading } = usePurchaseOrders();
  const createPurchaseOrder = useCreatePurchaseOrder();
  const updatePurchaseOrder = useUpdatePurchaseOrder();

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | 'All'>('All');
  
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplierId: 0,
    quotationId: undefined,
    orderDate: new Date(),
    expectedDeliveryDate: undefined,
    notes: '',
    items: []
  });

  const filteredPOs = purchaseOrders?.filter(po => 
    statusFilter === 'All' || po.status === statusFilter
  ) || [];

  const handleCreateNew = () => {
    setSelectedPO(null);
    setIsCreating(true);
    setIsEditing(false);
    setFormData({
      supplierId: 0,
      quotationId: undefined,
      orderDate: new Date(),
      expectedDeliveryDate: undefined,
      notes: '',
      items: []
    });
  };

  const handleEdit = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      supplierId: po.supplierId,
      quotationId: po.quotationId,
      orderDate: po.orderDate,
      expectedDeliveryDate: po.expectedDeliveryDate,
      notes: po.notes || '',
      items: po.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        description: item.description
      })) || []
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.supplierId) {
        error('Please select a supplier');
        return;
      }

      const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = totalAmount * 0.1; // 10% tax

      const poData = {
        ...formData,
        totalAmount: totalAmount + taxAmount,
        taxAmount,
        items: formData.items.map(item => ({
          ...item,
          id: 0,
          purchaseOrderId: selectedPO?.id || 0,
          totalPrice: item.quantity * item.unitPrice
        }))
      };

      if (isEditing && selectedPO) {
        await updatePurchaseOrder.mutateAsync({
          id: selectedPO.id,
          data: poData
        });
        success('Purchase order updated successfully');
      } else {
        await createPurchaseOrder.mutateAsync(poData);
        success('Purchase order created successfully');
      }
      
      setIsCreating(false);
      setIsEditing(false);
      setSelectedPO(null);
    } catch (err) {
      error('Failed to save purchase order');
    }
  };

  const handleStatusUpdate = async (po: PurchaseOrder, newStatus: PurchaseOrderStatus) => {
    try {
      await updatePurchaseOrder.mutateAsync({
        id: po.id,
        data: { status: newStatus }
      });
      success(`Purchase order ${newStatus.toLowerCase()}`);
    } catch (err) {
      error('Failed to update status');
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        productId: 0,
        quantity: 1,
        unitPrice: 0,
        description: ''
      }]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Purchase Order Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage purchase orders with approval workflow and status tracking
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as PurchaseOrderStatus | 'All')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Delivered">Delivered</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || isEditing) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            {isEditing ? 'Edit Purchase Order' : 'Create New Purchase Order'}
          </h3>
          
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supplier ID
                </label>
                <input
                  type="number"
                  value={formData.supplierId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplierId: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter supplier ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quotation ID (Optional)
                </label>
                <input
                  type="number"
                  value={formData.quotationId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, quotationId: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter quotation ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Order Date
                </label>
                <input
                  type="date"
                  value={formData.orderDate.toISOString().split('T')[0]}
                  onChange={(e) => setFormData(prev => ({ ...prev, orderDate: new Date(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.expectedDeliveryDate ? formData.expectedDeliveryDate.toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value ? new Date(e.target.value) : undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">Items</h4>
                <button
                  onClick={addItem}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Item
                </button>
              </div>
              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <input
                      type="number"
                      placeholder="Product ID"
                      value={item.productId || ''}
                      onChange={(e) => updateItem(index, 'productId', parseInt(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description || ''}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-600 dark:text-white"
                      step="0.01"
                    />
                    <span className="w-24 text-right font-medium">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

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
                placeholder="Additional notes..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedPO(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={createPurchaseOrder.isPending || updatePurchaseOrder.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isEditing ? 'Update' : 'Create'} Purchase Order
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Purchase Orders List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Purchase Orders ({filteredPOs.length})
          </h3>
          
          {filteredPOs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No purchase orders found
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPOs.map((po) => {
                const StatusIcon = statusConfig[po.status].icon;
                return (
                  <div
                    key={po.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                            PO #{po.purchaseOrderNumber}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[po.status].color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {po.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div>
                            <span className="font-medium">Supplier:</span> {po.supplier?.firstName ? `${po.supplier.firstName} ${po.supplier.lastName}` : `ID: ${po.supplierId}`}
                          </div>
                          <div>
                            <span className="font-medium">Amount:</span> ${po.totalAmount.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Order Date:</span> {po.orderDate.toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Expected:</span> {po.expectedDeliveryDate?.toLocaleDateString() || 'TBD'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Status Actions */}
                        {po.status === 'Pending' && (
                          <button
                            onClick={() => handleStatusUpdate(po, 'Approved')}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {po.status === 'Approved' && (
                          <button
                            onClick={() => handleStatusUpdate(po, 'Delivered')}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                          >
                            Mark Delivered
                          </button>
                        )}
                        {po.status === 'Delivered' && (
                          <button
                            onClick={() => handleStatusUpdate(po, 'Completed')}
                            className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                          >
                            Complete
                          </button>
                        )}
                        
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(po)}
                          className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Purchase Order Details Modal */}
      {selectedPO && !isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPO(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Purchase Order Details
                </h3>
                <button
                  onClick={() => setSelectedPO(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">PO Number</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPO.purchaseOrderNumber}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Status</h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedPO.status].color}`}>
                      {selectedPO.status}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Supplier</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPO.supplier?.firstName ? `${selectedPO.supplier.firstName} ${selectedPO.supplier.lastName}` : `ID: ${selectedPO.supplierId}`}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Total Amount</h4>
                    <p className="text-gray-600 dark:text-gray-400">${selectedPO.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                {selectedPO.items && selectedPO.items.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Items</h4>
                    <div className="space-y-2">
                      {selectedPO.items.map((item) => (
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
                
                {selectedPO.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">Notes</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedPO.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};