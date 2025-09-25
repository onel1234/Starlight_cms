import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MenuIcon, 
  XIcon, 
  ChevronDownIcon,
  HomeIcon,
  FolderIcon,
  FileTextIcon,
  MessageSquareIcon,
  ClipboardListIcon,
  DollarSignIcon,
  PackageIcon,
  UserIcon,
  LogOutIcon,
  BellIcon,
  HelpCircleIcon,
  PhoneIcon
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface ExternalLayoutProps {
  children: React.ReactNode
}

export const ExternalLayout: React.FC<ExternalLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const isCustomer = user?.role === 'Customer'
  const isSupplier = user?.role === 'Supplier'
  const currentSection = searchParams.get('section') || ''

  const getNavItems = () => {
    if (isCustomer) {
      return [
        { 
          query: '?customer', 
          label: 'Dashboard', 
          icon: HomeIcon, 
          section: '',
          description: 'Overview of your projects and activities'
        },
        { 
          query: '?customer&section=projects', 
          label: 'My Projects', 
          icon: FolderIcon, 
          section: 'projects',
          description: 'View and track your construction projects'
        },
        { 
          query: '?customer&section=documents', 
          label: 'Documents', 
          icon: FileTextIcon, 
          section: 'documents',
          description: 'Access project documents and files'
        },
        { 
          query: '?customer&section=feedback', 
          label: 'Feedback', 
          icon: MessageSquareIcon, 
          section: 'feedback',
          description: 'Submit feedback and view responses'
        },
        { 
          query: '?customer&section=messages', 
          label: 'Messages', 
          icon: MessageSquareIcon, 
          section: 'messages',
          description: 'Communicate with your project team'
        }
      ]
    }
    
    if (isSupplier) {
      return [
        { 
          query: '?supplier', 
          label: 'Dashboard', 
          icon: HomeIcon, 
          section: '',
          description: 'Overview of your business activities'
        },
        { 
          query: '?supplier&section=tenders', 
          label: 'Tenders', 
          icon: ClipboardListIcon, 
          section: 'tenders',
          description: 'Browse and submit tender applications'
        },
        { 
          query: '?supplier&section=quotations', 
          label: 'Quotations', 
          icon: DollarSignIcon, 
          section: 'quotations',
          description: 'Manage your price quotations'
        },
        { 
          query: '?supplier&section=orders', 
          label: 'Orders', 
          icon: PackageIcon, 
          section: 'orders',
          description: 'Track and fulfill your orders'
        },
        { 
          query: '?supplier&section=messages', 
          label: 'Messages', 
          icon: MessageSquareIcon, 
          section: 'messages',
          description: 'Communicate with clients'
        }
      ]
    }
    
    return []
  }

  const navItems = getNavItems()

  // Mock notifications for external users
  const notifications = [
    {
      id: 1,
      title: isCustomer ? 'Project Update' : 'New Tender Available',
      message: isCustomer ? 'Your project milestone has been completed' : 'Office Building Project - Bid deadline in 3 days',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 2,
      title: 'Message Received',
      message: isCustomer ? 'New message from your project manager' : 'Client inquiry about your quotation',
      time: '3 hours ago',
      unread: false
    }
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to={isCustomer ? '/?customer' : '/?supplier'} className="flex items-center group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3 group-hover:from-blue-700 group-hover:to-blue-800 transition-all">
                  <span className="text-white font-bold text-lg">SL</span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-xl font-bold text-gray-900">Star Light Constructions</div>
                  <div className="text-xs text-gray-500 -mt-1">
                    {isCustomer ? 'Customer Portal' : 'Supplier Portal'}
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentSection === item.section
                const IconComponent = item.icon
                
                return (
                  <Link
                    key={item.query}
                    to={item.query}
                    className={`group flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title={item.description}
                  >
                    <IconComponent className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BellIcon className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifications && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Notifications</h3>
                        <div className="space-y-3">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-3 rounded-lg ${
                                notification.unread ? 'bg-blue-50' : 'bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {notification.title}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                {notification.unread && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Support */}
              <button className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <HelpCircleIcon className="h-4 w-4" />
                Support
              </button>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">
                      {user?.profile?.firstName?.[0] || user?.profile?.companyName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.profile?.firstName || user?.profile?.companyName || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isCustomer ? 'Customer' : 'Supplier'}
                    </div>
                  </div>
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                    >
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-100 mb-2">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.profile?.firstName} {user?.profile?.lastName || user?.profile?.companyName}
                          </div>
                          <div className="text-xs text-gray-500">{user?.email}</div>
                        </div>
                        
                        <a
                          href="#"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <UserIcon className="h-4 w-4" />
                          Profile Settings
                        </a>
                        
                        <a
                          href="#"
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        >
                          <PhoneIcon className="h-4 w-4" />
                          Contact Support
                        </a>
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                          onClick={logout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50 rounded-md"
                        >
                          <LogOutIcon className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-gray-200 bg-white"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item) => {
                  const isActive = currentSection === item.section
                  const IconComponent = item.icon
                  
                  return (
                    <Link
                      key={item.query}
                      to={item.query}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <div>
                        <div>{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-sm">SL</span>
                </div>
                <span className="text-lg font-bold text-gray-900">Star Light Constructions</span>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Building excellence through quality construction and exceptional service.
              </p>
              <div className="text-sm text-gray-600">
                © 2024 Star Light Constructions. All rights reserved.
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Services</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Projects</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Contact Support</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}