import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LogOutIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  UserIcon,
  SettingsIcon,
  XIcon
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { NAVIGATION_ITEMS, filterNavigationByRole, getRoleColor, getRoleDisplayName } from '../navigation/RoleBasedNavigation'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  if (!user) return null

  const navigation = filterNavigationByRole(NAVIGATION_ITEMS, user.role)
  const searchParams = new URLSearchParams(location.search)

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev =>
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    )
  }

  const renderNavigationItem = (item: typeof navigation[0], level = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.name)
    const paddingLeft = level === 0 ? 'pl-2' : 'pl-8'
    const isCurrentPage = location.search === item.href.split('?')[1] || (item.href === '/' && location.pathname === '/' && !searchParams.get('page'))

    return (
      <li key={item.name}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.name)}
              className={`group flex w-full items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all hover:bg-gray-100 ${paddingLeft}`}
            >
              <div className={`p-1 rounded-md ${isExpanded ? 'bg-blue-100 text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                <item.icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <span className="flex-1 text-left text-gray-700 group-hover:text-gray-900">{item.name}</span>
              <div className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                <ChevronRightIcon className="h-4 w-4 text-gray-400" />
              </div>
            </button>
            <AnimatePresence>
              {isExpanded && item.children && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-1 space-y-1 overflow-hidden"
                >
                  {item.children.map(child => renderNavigationItem(child, level + 1))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <Link
            to={item.href}
            className={`group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all ${paddingLeft} ${
              isCurrentPage
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className={`p-1 rounded-md ${isCurrentPage ? 'bg-blue-100 text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
              <item.icon className="h-4 w-4" aria-hidden="true" />
            </div>
            <span className="truncate">{item.name}</span>
            {isCurrentPage && (
              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
            )}
          </Link>
        )}
      </li>
    )
  }

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-secondary-200 px-6 pb-4 scrollbar-thin">
      <div className="flex h-16 shrink-0 items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">SL</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Star Light CMS</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Construction Management</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        )}
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map(item => renderNavigationItem(item))}
            </ul>
          </li>
          <li className="mt-auto">
            {/* User Profile Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-3">
                <div className="flex items-center gap-x-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center ring-2 ring-white">
                    {user.profile?.avatarUrl ? (
                      <img
                        src={user.profile.avatarUrl}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 truncate mb-2">
                      {user.email}
                    </p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="space-y-1">
                <Link
                  to="/?page=profile"
                  className={`group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all ${
                    searchParams.get('page') === 'profile'
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div className={`p-1 rounded-md ${searchParams.get('page') === 'profile' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    <SettingsIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  Profile Settings
                </Link>

                <button
                  onClick={logout}
                  className="group flex w-full items-center gap-x-3 rounded-lg p-3 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <div className="p-1 rounded-md text-gray-500 group-hover:text-red-600">
                    <LogOutIcon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  Sign out
                </button>
              </div>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {sidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && onClose && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={onClose}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 lg:hidden"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}