import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useAvailableTenders, useSupplierOrders, useSupplierQuotations } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { SupplierStats } from './SupplierStats'
import { TenderCard } from './TenderCard'
import { OrderCard } from './OrderCard'

export const SupplierDashboard: React.FC = () => {
  const { user } = useAuth()
  const supplierId = user?.id || 0

  const { data: tenders, isLoading: tendersLoading } = useAvailableTenders(supplierId)
  const { data: orders, isLoading: ordersLoading } = useSupplierOrders(supplierId)
  const { data: quotations, isLoading: quotationsLoading } = useSupplierQuotations(supplierId)

  if (tendersLoading || ordersLoading || quotationsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const activeTenders = tenders?.filter(t => t.status === 'Open') || []
  const activeOrders = orders?.filter(o => ['Confirmed', 'In Production', 'Shipped'].includes(o.status)) || []
  const pendingQuotations = quotations?.filter(q => q.status === 'Under Review') || []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.profile?.companyName || user?.profile?.firstName || 'Supplier'}!
        </h1>
        <p className="text-green-100">
          Manage your tenders, quotations, and orders with Star Light Constructions
        </p>
      </div>

      {/* Supplier Statistics */}
      <SupplierStats 
        tenders={tenders || []} 
        orders={orders || []} 
        quotations={quotations || []} 
      />

      {/* Active Tenders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Available Tenders</h2>
        {activeTenders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTenders.slice(0, 6).map(tender => (
              <TenderCard key={tender.id} tender={tender} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No active tenders available at the moment</p>
          </div>
        )}
      </div>

      {/* Active Orders */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Orders</h2>
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOrders.slice(0, 4).map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No active orders at the moment</p>
          </div>
        )}
      </div>

      {/* Pending Quotations */}
      {pendingQuotations.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quotations Under Review</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium">
              You have {pendingQuotations.length} quotation(s) currently under review
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              We'll notify you once the review process is complete
            </p>
          </div>
        </div>
      )}
    </div>
  )
}