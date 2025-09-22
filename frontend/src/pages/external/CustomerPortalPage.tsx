import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { CustomerDashboard } from '../../components/external/customer/CustomerDashboard'
import { ProjectDetails } from '../../components/external/customer/ProjectDetails'
import { CustomerFeedbackForm } from '../../components/external/customer/CustomerFeedbackForm'
import { MessageCenter } from '../../components/external/communication/MessageCenter'
import { CustomerProjectsList } from '../../components/external/customer/CustomerProjectsList'
import { CustomerDocuments } from '../../components/external/customer/CustomerDocuments'

export const CustomerPortalPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Routes>
        <Route index element={<CustomerDashboard />} />
        <Route path="projects" element={<CustomerProjectsList />} />
        <Route path="projects/:projectId" element={<ProjectDetails />} />
        <Route path="documents" element={<CustomerDocuments />} />
        <Route path="feedback" element={<CustomerFeedbackForm />} />
        <Route path="messages" element={<MessageCenter />} />
      </Routes>
    </div>
  )
}