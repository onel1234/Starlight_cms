import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'

import { ToastProvider } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { ExternalLayout } from './components/layout/ExternalLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { EmailVerificationPage } from './pages/auth/EmailVerificationPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/projects/ProjectsPage'
import { TasksPage } from './pages/tasks/TasksPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { FinancialPage } from './pages/financial/FinancialPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { UsersPage } from './pages/users/UsersPage'
import { TendersPage } from './pages/tenders/TendersPage'
import { FeedbackPage } from './pages/feedback/FeedbackPage'
import { DocumentsPage } from './pages/documents/DocumentsPage'
import { CustomerPortalPage } from './pages/external/CustomerPortalPage'
import { SupplierPortalPage } from './pages/external/SupplierPortalPage'
import { CredentialsPage } from './pages/auth/CredentialsPage'

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<EmailVerificationPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />

            {/* Internal user routes */}
            <Route path="/" element={
              <ProtectedRoute requiredRoles={['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee']}>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="projects/*" element={<ProjectsPage />} />
              <Route path="tasks/*" element={<TasksPage />} />
              <Route path="inventory/*" element={<InventoryPage />} />
              <Route path="financial/*" element={<FinancialPage />} />
              <Route path="tenders/*" element={<TendersPage />} />
              <Route path="feedback/*" element={<FeedbackPage />} />
              <Route path="documents/*" element={<DocumentsPage />} />
              <Route path="reports/*" element={<ReportsPage />} />
              <Route path="users/*" element={
                <ProtectedRoute requiredRoles={['Director']}>
                  <UsersPage />
                </ProtectedRoute>
              } />
            </Route>

            {/* Customer Portal */}
            <Route path="/customer/*" element={
              <ProtectedRoute requiredRoles={['Customer']}>
                <ExternalLayout />
              </ProtectedRoute>
            }>
              <Route path="*" element={<CustomerPortalPage />} />
            </Route>

            {/* Supplier Portal */}
            <Route path="/supplier/*" element={
              <ProtectedRoute requiredRoles={['Supplier']}>
                <ExternalLayout />
              </ProtectedRoute>
            }>
              <Route path="*" element={<SupplierPortalPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App