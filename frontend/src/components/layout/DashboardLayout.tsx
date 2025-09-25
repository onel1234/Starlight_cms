import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Breadcrumb } from './Breadcrumb'
import { SessionTimeoutWarning, useSessionTimeoutWarning } from '../auth/SessionTimeoutWarning'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const {
    showWarning,
    timeRemaining,
    handleExtend,
    handleLogout,
    handleDismiss
  } = useSessionTimeoutWarning()

  return (
    <div className="min-h-screen bg-white">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      <div className="lg:pl-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Breadcrumb />
            <div className="mt-6">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      {/* Session Timeout Warning */}
      <SessionTimeoutWarning
        show={showWarning}
        timeRemaining={timeRemaining}
        onExtend={handleExtend}
        onLogout={handleLogout}
        onDismiss={handleDismiss}
      />
    </div>
  )
}