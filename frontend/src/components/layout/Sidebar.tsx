import { useState } from 'react'
import { NavLink } from 'react-router-dom'
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
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  if (!user) return null

  const navigation = filterNavigationByRole(NAVIGATION_ITEMS, user.role)

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

    return (
      <li key={item.name}>
        {hasChildren ? (
          <div>
            <button
              onClick={() => toggleExpanded(item.name)}
              className={`group flex w-full items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-secondary-700 hover:text-primary-600 hover:bg-secondary-100 transition-colors ${paddingLeft}`}
            >
              <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">{item.name}</span>
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 shrink-0" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 shrink-0" />
              )}
            </button>
            {isExpanded && item.children && (
              <ul className="mt-1 space-y-1">
                {item.children.map(child => renderNavigationItem(child, level + 1))}
              </ul>
            )}
          </div>
        ) : (
          <NavLink
            to={item.href}
            className={({ isActive }) =>
              `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors ${paddingLeft} ${isActive
                ? 'bg-primary-50 text-primary-600'
                : 'text-secondary-700 hover:text-primary-600 hover:bg-secondary-100'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            {item.name}
          </NavLink>
        )}
      </li>
    )
  }

  const sidebarContent = (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-secondary-200 px-6 pb-4 scrollbar-thin">
      <div className="flex h-16 shrink-0 items-center justify-between">
        <h1 className="text-xl font-bold text-primary-600">Star Light CMS</h1>
        {onClose && (
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-secondary-700"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <XIcon className="h-6 w-6" aria-hidden="true" />
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
          <li className="mt-auto space-y-2">
            {/* User Profile Section */}
            <div className="border-t border-secondary-200 pt-4">
              <div className="flex items-center gap-x-3 px-2 py-2">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-secondary-100 flex items-center justify-center">
                  {user.profile?.avatarUrl ? (
                    <img
                      src={user.profile.avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-secondary-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleDisplayName(user.role)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="mt-2 space-y-1">
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-medium transition-colors ${isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-secondary-600 hover:text-primary-600 hover:bg-secondary-100'
                    }`
                  }
                >
                  <SettingsIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Profile Settings
                </NavLink>

                <button
                  onClick={logout}
                  className="group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-medium text-secondary-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOutIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
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