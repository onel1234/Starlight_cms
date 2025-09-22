import { useState } from 'react'
import { BellIcon, MenuIcon, ChevronDownIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'


interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-secondary-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-secondary-700 lg:hidden hover:text-black"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <MenuIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-secondary-200 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Notifications */}
          <div className="relative">
            <button 
              type="button" 
              className="-m-2.5 p-2.5 text-secondary-400 hover:text-secondary-500 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">View notifications</span>
              <BellIcon className="h-6 w-6" aria-hidden="true" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-black mb-3">Notifications</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-2 hover:bg-secondary-100 rounded">
                        <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-black">New project assigned</p>
                          <p className="text-xs text-secondary-500">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-2 hover:bg-secondary-100 rounded">
                        <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-black">Task completed</p>
                          <p className="text-xs text-secondary-500">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-2 hover:bg-secondary-100 rounded">
                        <div className="flex-shrink-0 w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-black">Low stock alert</p>
                          <p className="text-xs text-secondary-500">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-secondary-200">
                      <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-secondary-200" aria-hidden="true" />

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-x-2 hover:bg-secondary-100 rounded-lg p-1.5 transition-colors"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user?.profile?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                </span>
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span className="ml-2 text-sm font-semibold leading-6 text-black">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </span>
                <ChevronDownIcon className="ml-2 h-4 w-4 text-secondary-400" />
              </span>
            </button>

            {/* Profile dropdown menu */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="py-1">
                    <a
                      href="/profile"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      Your Profile
                    </a>
                    <a
                      href="/settings"
                      className="block px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-100"
                    >
                      Settings
                    </a>
                    <div className="border-t border-secondary-200 my-1"></div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false)
                        // Add logout logic here
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}