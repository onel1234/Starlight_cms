import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useSupplierOrders, useUpdateOrderStatus } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { formatters } from '../../../utils/formatters'
import { SupplierOrder } from '../../../types/external'

export const SupplierOrdersList: React.FC = () => {
  const { user } = useAuth()
  const { data: orders, isLoading, error } = useSupplierOrders(user?.id || 0)
  const updateOrderStatus = useUpdateOrderStatus()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingOrder, setUpdatingOrder] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Orders</h3>
        <p className="text-red-600 mt-2">Unable to load your orders. Please try again later.</p>
      </div>
    )
  }

  const filteredOrders = orders?.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  ) || []

  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Confirmed', label: 'Confirmed' },
    { value: 'In Production', label: 'In Production' },
    { value: 'Shipped', label: 'Shipped' },
    { value: 'Delivered', label: 'Delivered' },
    { value: 'Completed', label: 'Completed' }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Confirmed': return 'bg-blue-100 text-blue-800'
      case 'In Production': return 'bg-purple-100 text-purple-800'
      case 'Shipped': return 'bg-indigo-100 text-indigo-800'
      case 'Delivered': return 'bg-green-100 text-green-800'
      case 'Completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getNextStatus = (currentStatus: string): string | null => {
    const statusFlow = {
      'Pending': 'Confirmed',
      'Confirmed': 'In Production',
      'In Production': 'Shipped',
      'Shipped': 'Delivered',
      'Delivered': 'Completed'
    }
    return statusFlow[currentStatus as keyof typeof statusFlow] || null
  }

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingOrder(orderId)
    try {
      await updateOrderStatus.mutateAsync({
        orderId,
        status: newStatus as SupplierOrder['status']
      })
    } finally {
      setUpdatingOrder(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your purchase orders
          </p>
        </div>
        
        {/* Filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>      
{/* Orders List */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const nextStatus = getNextStatus(order.status)
            const isUpdating = updatingOrder === order.id
            
            return (
              <div key={order.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {order.orderNumber}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Total Amount:</span>
                        <div className="text-lg font-semibold text-gray-900">
                          {formatters.currency(order.totalAmount)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Order Date:</span>
                        <div className="text-gray-900">
                          {formatters.date(order.orderDate)}
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-gray-700">Expected Delivery:</span>
                        <div className="text-gray-900">
                          {formatters.date(order.expectedDeliveryDate)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {nextStatus && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, nextStatus)}
                      disabled={isUpdating}
                      className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      {isUpdating ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        `Mark as ${nextStatus}`
                      )}
                    </button>
                  )}
                </div>

                {/* Items */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Order Items ({order.items.length})</h4>
                  <div className="space-y-2">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatters.currency(item.unitPrice)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                            {item.status}
                          </span>
                          <span className="font-medium text-gray-900">
                            {formatters.currency(item.totalPrice)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Delivery Address:</span>
                    <p className="text-gray-600 mt-1">{order.deliveryAddress}</p>
                  </div>
                  
                  {order.trackingNumber && (
                    <div>
                      <span className="font-medium text-gray-700">Tracking Number:</span>
                      <div className="text-gray-900 font-mono mt-1">{order.trackingNumber}</div>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="text-gray-600 text-sm mt-1">{order.notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "You don't have any orders yet." 
              : `You don't have any orders with ${statusFilter.toLowerCase()} status.`
            }
          </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View All Orders
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-green-700">
              Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
            </span>
            <span className="text-green-600">
              Total value: {formatters.currency(filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}