import React from 'react'
import { useLocation } from 'react-router-dom'
import { CustomerDashboard } from '../../components/external/customer/CustomerDashboard'
import { ProjectDetails } from '../../components/external/customer/ProjectDetails'
import { CustomerFeedbackForm } from '../../components/external/customer/CustomerFeedbackForm'
import { MessageCenter } from '../../components/external/communication/MessageCenter'
import { CustomerProjectsList } from '../../components/external/customer/CustomerProjectsList'
import { CustomerDocuments } from '../../components/external/customer/CustomerDocuments'

export const CustomerPortalPage: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  
  // Get the section parameter for customer portal navigation
  const section = searchParams.get('section') || ''
  const projectId = searchParams.get('projectId')

  const renderContent = () => {
    switch (section) {
      case 'projects':
        if (projectId) {
          return <ProjectDetails />
        }
        return <CustomerProjectsList />
      case 'documents':
        return <CustomerDocuments />
      case 'feedback':
        return <CustomerFeedbackForm />
      case 'messages':
        return <MessageCenter />
      default:
        return <CustomerDashboard />
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}