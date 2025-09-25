import React from 'react'
import { useLocation } from 'react-router-dom'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { DashboardLayout } from '../layout/DashboardLayout'
import { ExternalLayout } from '../layout/ExternalLayout'
import { CustomerPortalPage } from '../../pages/external/CustomerPortalPage'
import { SupplierPortalPage } from '../../pages/external/SupplierPortalPage'
import { DashboardPage } from '../../pages/DashboardPage'
import { ProjectsPage } from '../../pages/projects/ProjectsPage'
import { TasksPage } from '../../pages/tasks/TasksPage'
import { InventoryPage } from '../../pages/inventory/InventoryPage'
import { FinancialPage } from '../../pages/financial/FinancialPage'
import { ReportsPage } from '../../pages/reports/ReportsPage'
import { UsersPage } from '../../pages/users/UsersPage'
import { TendersPage } from '../../pages/tenders/TendersPage'
import { FeedbackPage } from '../../pages/feedback/FeedbackPage'
import { DocumentsPage } from '../../pages/documents/DocumentsPage'
import { ProfilePage } from '../../pages/profile/ProfilePage'

export const QueryBasedRouter: React.FC = () => {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  
  // Check for external portal query parameters
  const isCustomerPortal = searchParams.has('customer')
  const isSupplierPortal = searchParams.has('supplier')
  
  // Extract the page parameter for internal routing
  const page = searchParams.get('page') || ''

  if (isCustomerPortal) {
    return (
      <ProtectedRoute requiredRoles={['Customer']}>
        <ExternalLayout>
          <CustomerPortalPage />
        </ExternalLayout>
      </ProtectedRoute>
    )
  }

  if (isSupplierPortal) {
    return (
      <ProtectedRoute requiredRoles={['Supplier']}>
        <ExternalLayout>
          <SupplierPortalPage />
        </ExternalLayout>
      </ProtectedRoute>
    )
  }

  // Internal user routes with query parameter navigation
  return (
    <ProtectedRoute requiredRoles={['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee']}>
      <DashboardLayout>
        {(() => {
          switch (page) {
            case 'profile':
              return <ProfilePage />
            case 'projects':
              return <ProjectsPage />
            case 'tasks':
              return <TasksPage />
            case 'inventory':
              return <InventoryPage />
            case 'financial':
              return <FinancialPage />
            case 'tenders':
              return <TendersPage />
            case 'feedback':
              return <FeedbackPage />
            case 'documents':
              return <DocumentsPage />
            case 'reports':
              return <ReportsPage />
            case 'users':
              return (
                <ProtectedRoute requiredRoles={['Director']}>
                  <UsersPage />
                </ProtectedRoute>
              )
            default:
              return <DashboardPage />
          }
        })()}
      </DashboardLayout>
    </ProtectedRoute>
  )
}