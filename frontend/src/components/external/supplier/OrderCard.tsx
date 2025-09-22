import React from 'react'
import { Link } from 'react-router-dom'
import { SupplierOrder } from '../../../types/external'
import { formatCurrency, formatDate } from '../../../utils/formatters'

interface OrderCardProps {
  order: SupplierOrder
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const getStatusColor = (status: SupplierOrder['status']) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'Confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'In Production':
        return 'bg-purple-100 text-purple-800'
      case 'Shipped':
        return 'bg-orange-100 text-orange-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      case 'Completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: SupplierOrder['status']) => {
    switch (status) {
      case 'Pending':
        return '⏳'
      case 'Confirmed':
        return '✅'
      case 'In Production':
        return '🏭'
      case 'Shipped':
        return '🚚'
      case 'Delivered':
        return '📦'
      case 'Completed':
        return '🎉'
      default:
        return '📋'
    }
  }

  const isOverdue = order.expectedDeliveryDate && 
    new Date(order.expectedDeliveryDate) < new Date() && 
    !order.actualDeliveryDate

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Order #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-600">
              Ordered: {formatDate(order.orderDate)}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(order.status)}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </div>

        {/* Order Value */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">Total Order Value</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
        </div>

        {/* Delivery Information */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Expected Delivery:</span>
            <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
              {formatDate(order.expectedDeliveryDate)}
              {isOverdue && ' (Overdue)'}
            </span>
          </div>
          {order.actualDeliveryDate && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Actual Delivery:</span>
              <span className="font-medium text-green-600">{formatDate(order.actualDeliveryDate)}</span>
            </div>
          )}
          {order.trackingNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tracking:</span>
              <span className="font-medium font-mono">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        {/* Items Summary */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800 font-medium">
            {order.items.length} item(s) in this order
          </p>
          <div className="mt-2 space-y-1">
            {order.items.slice(0, 2).map((item, index) => (
              <p key={index} className="text-xs text-blue-700">
                • {item.productName} (Qty: {item.quantity})
              </p>
            ))}
            {order.items.length > 2 && (
              <p className="text-xs text-blue-600">
                + {order.items.length - 2} more items
              </p>
            )}
          </div>
        </div>

        {/* Overdue Warning */}
        {isOverdue && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-800 text-sm font-medium">
              ⚠️ This order is overdue. Please update the delivery status.
            </p>
          </div>
        )}

        {/* Notes */}
        {order.notes && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-600 mb-1">Notes:</p>
            <p className="text-sm text-gray-800">{order.notes}</p>
          </div>
        )}

        {/* Action Button */}
        <Link
          to={`/supplier/orders/${order.id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
        >
          Manage Order
        </Link>
      </div>
    </div>
  )
}