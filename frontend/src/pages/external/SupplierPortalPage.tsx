import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { SupplierDashboard } from '../../components/external/supplier/SupplierDashboard'
import { SupplierTendersList } from '../../components/external/supplier/SupplierTendersList'
import { SupplierQuotationsList } from '../../components/external/supplier/SupplierQuotationsList'
import { SupplierOrdersList } from '../../components/external/supplier/SupplierOrdersList'
import { TenderDetails } from '../../components/external/supplier/TenderDetails'
import { QuotationForm } from '../../components/external/supplier/QuotationForm'
import { MessageCenter } from '../../components/external/communication/MessageCenter'

export const SupplierPortalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<SupplierDashboard />} />
        <Route path="tenders" element={<SupplierTendersList />} />
        <Route path="tenders/:tenderId" element={<TenderDetails />} />
        <Route path="tenders/:tenderId/quote" element={<QuotationForm />} />
        <Route path="quotations" element={<SupplierQuotationsList />} />
        <Route path="orders" element={<SupplierOrdersList />} />
        <Route path="messages" element={<MessageCenter />} />
      </Routes>
    </div>
  )
}