import React from 'react'
import { SupplierTender, SupplierOrder, SupplierQuotation } from '../../../types/external'
import { formatCurrency } from '../../../utils/formatters'

interface SupplierStatsProps {
  tenders: SupplierTender[]
  orders: SupplierOrder[]
  quotations: SupplierQuotation[]
}

export const SupplierStats: React.FC<SupplierStatsProps> = ({ tenders, orders, quotations }) => {
  const availableTenders = tenders.filter(t => t.status === 'Open').length
  const totalOrders = orders.length
  const activeOrders = orders.filter(o => ['Confirmed', 'In Production', 'Shipped'].includes(o.status)).length
  const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const submittedQuotations = quotations.filter(q => q.status !== 'Draft').length
  const acceptedQuotations = quotations.filter(q => q.status === 'Accepted').length

  const stats = [
    {
      label: 'Available Tenders',
      value: availableTenders,
      icon: '📋',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Active Orders',
      value: activeOrders,
      icon: '📦',
      color: 'bg-green-50 text-green-700'
    },
    {
      label: 'Total Order Value',
      value: formatCurrency(totalOrderValue),
      icon: '💰',
      color: 'bg-purple-50 text-purple-700'
    },
    {
      label: 'Quotations Submitted',
      value: submittedQuotations,
      icon: '📊',
      color: 'bg-orange-50 text-orange-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}