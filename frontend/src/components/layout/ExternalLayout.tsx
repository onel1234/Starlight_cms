import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export const ExternalLayout: React.FC = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isCustomer = user?.role === 'Customer'
  const isSupplier = user?.role === 'Supplier'

  const getNavItems = () => {
    if (isCustomer) {
      return [
        { path: '/customer', label: 'Dashboard', icon: '🏠' },
        { path: '/customer/projects', label: 'My Projects', icon: '🏗️' },
        { path: '/customer/documents', label: 'Documents', icon: '📄' },
        { path: '/customer/feedback', label: 'Feedback', icon: '💭' },
        { path: '/customer/messages', label: 'Messages', icon: '💬' }
      ]
    }
    
    if (isSupplier) {
      return [
        { path: '/supplier', label: 'Dashboard', icon: '🏠' },
        { path: '/supplier/tenders', label: 'Tenders', icon: '📋' },
        { path: '/supplier/quotations', label: 'Quotations', icon: '💰' },
        { path: '/supplier/orders', label: 'Orders', icon: '📦' },
        { path: '/supplier/messages', label: 'Messages', icon: '💬' }
      ]
    }
    
    return []
  }

  const navItems = getNavItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to={isCustomer ? '/customer' : '/supplier'} className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Star Light Constructions</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || 
                  (item.path !== '/customer' && item.path !== '/supplier' && location.pathname.startsWith(item.path))
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.profile?.firstName || user?.profile?.companyName || 'User'}
              </div>
              <button
                onClick={logout}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/customer' && item.path !== '/supplier' && location.pathname.startsWith(item.path))
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              © 2024 Star Light Constructions. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-gray-600">
              <a href="#" className="hover:text-gray-900 transition-colors">Support</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}