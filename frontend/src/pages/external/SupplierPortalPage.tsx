import React from 'react'
import { useLocation } from 'react-router-dom'
import { SupplierDashboard } from '../../components/external/supplier/SupplierDashboard'
import { SupplierTendersList } from '../../components/external/supplier/SupplierTendersList'
import { SupplierQuotationsList } from '../../components/external/supplier/SupplierQuotationsList'
import { SupplierOrdersList } from '../../components/external/supplier/SupplierOrdersList'
import { TenderDetails } from '../../components/external/supplier/TenderDetails'
import { QuotationForm } from '../../components/external/supplier/QuotationForm'
import { MessageCenter } from '../../components/external/communication/MessageCenter'

export const SupplierPortalPage: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  
  // Get the section parameter for supplier portal navigation
  const section = searchParams.get('section') || ''
  const tenderId = searchParams.get('tenderId')
  const action = searchParams.get('action')

  const renderContent = () => {
    switch (section) {
      case 'tenders':
        if (tenderId && action === 'quote') {
          return <QuotationForm />
        }
        if (tenderId) {
          return <TenderDetails />
        }
        return <SupplierTendersList />
      case 'quotations':
        return <SupplierQuotationsList />
      case 'orders':
        return <SupplierOrdersList />
      case 'messages':
        return <MessageCenter />
      default:
        return <SupplierDashboard />
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}