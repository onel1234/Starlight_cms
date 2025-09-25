import { UserRole } from '../../types/auth'
import {
  HomeIcon,
  FolderIcon,
  CheckSquareIcon,
  PackageIcon,
  DollarSignIcon,
  BarChart3Icon,
  UsersIcon,
  FileTextIcon,
  MessageSquareIcon,
  ClipboardListIcon,
  TruckIcon,
  CreditCardIcon,
  FolderOpenIcon
} from 'lucide-react'

export interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
  children?: NavigationItem[]
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee', 'Customer', 'Supplier']
  },
  {
    name: 'Projects',
    href: '/?page=projects',
    icon: FolderIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee', 'Customer'],
    children: [
      {
        name: 'All Projects',
        href: '/?page=projects',
        icon: FolderIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee']
      },
      {
        name: 'My Projects',
        href: '/?page=projects&view=my',
        icon: FolderIcon,
        roles: ['Customer']
      },
      {
        name: 'Create Project',
        href: '/?page=projects&action=create',
        icon: FolderIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Tasks',
    href: '/?page=tasks',
    icon: CheckSquareIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee'],
    children: [
      {
        name: 'All Tasks',
        href: '/?page=tasks',
        icon: CheckSquareIcon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'My Tasks',
        href: '/?page=tasks&view=my',
        icon: CheckSquareIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee']
      },
      {
        name: 'Create Task',
        href: '/?page=tasks&action=create',
        icon: CheckSquareIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Inventory',
    href: '/?page=inventory',
    icon: PackageIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee'],
    children: [
      {
        name: 'Products',
        href: '/?page=inventory&section=products',
        icon: PackageIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee']
      },
      {
        name: 'Categories',
        href: '/?page=inventory&section=categories',
        icon: PackageIcon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'Suppliers',
        href: '/?page=inventory&section=suppliers',
        icon: TruckIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      },
      {
        name: 'Stock Movements',
        href: '/?page=inventory&section=movements',
        icon: PackageIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      }
    ]
  },
  {
    name: 'Financial',
    href: '/?page=financial',
    icon: DollarSignIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager'],
    children: [
      {
        name: 'Quotations',
        href: '/?page=financial&section=quotations',
        icon: FileTextIcon,
        roles: ['Director', 'Quantity Surveyor', 'Sales Manager']
      },
      {
        name: 'Purchase Orders',
        href: '/?page=financial&section=purchase-orders',
        icon: ClipboardListIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      },
      {
        name: 'Invoices',
        href: '/?page=financial&section=invoices',
        icon: CreditCardIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      },
      {
        name: 'Payments',
        href: '/?page=financial&section=payments',
        icon: DollarSignIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Tenders',
    href: '/?page=tenders',
    icon: ClipboardListIcon,
    roles: ['Director', 'Sales Manager', 'Supplier'],
    children: [
      {
        name: 'All Tenders',
        href: '/?page=tenders',
        icon: ClipboardListIcon,
        roles: ['Director', 'Sales Manager']
      },
      {
        name: 'Available Tenders',
        href: '/?page=tenders&view=available',
        icon: ClipboardListIcon,
        roles: ['Supplier']
      },
      {
        name: 'My Submissions',
        href: '/?page=tenders&view=submissions',
        icon: ClipboardListIcon,
        roles: ['Supplier']
      },
      {
        name: 'Create Tender',
        href: '/?page=tenders&action=create',
        icon: ClipboardListIcon,
        roles: ['Director', 'Sales Manager']
      }
    ]
  },
  {
    name: 'Feedback',
    href: '/?page=feedback',
    icon: MessageSquareIcon,
    roles: ['Director', 'Customer Success Manager', 'Customer'],
    children: [
      {
        name: 'All Feedback',
        href: '/?page=feedback',
        icon: MessageSquareIcon,
        roles: ['Director', 'Customer Success Manager']
      },
      {
        name: 'Submit Feedback',
        href: '/?page=feedback&action=submit',
        icon: MessageSquareIcon,
        roles: ['Customer']
      },
      {
        name: 'My Feedback',
        href: '/?page=feedback&view=my',
        icon: MessageSquareIcon,
        roles: ['Customer']
      }
    ]
  },
  {
    name: 'Documents',
    href: '/?page=documents',
    icon: FolderOpenIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee'],
    children: [
      {
        name: 'All Documents',
        href: '/?page=documents',
        icon: FolderOpenIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee']
      },
      {
        name: 'Upload Documents',
        href: '/?page=documents&action=upload',
        icon: FileTextIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee']
      },
      {
        name: 'Manage Folders',
        href: '/?page=documents&section=folders',
        icon: FolderIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Reports',
    href: '/?page=reports',
    icon: BarChart3Icon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager'],
    children: [
      {
        name: 'Dashboard',
        href: '/?page=reports',
        icon: BarChart3Icon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager']
      },
      {
        name: 'Project Reports',
        href: '/?page=reports&section=projects',
        icon: BarChart3Icon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'Financial Reports',
        href: '/?page=reports&section=financial',
        icon: BarChart3Icon,
        roles: ['Director', 'Quantity Surveyor']
      },
      {
        name: 'Inventory Reports',
        href: '/?page=reports&section=inventory',
        icon: BarChart3Icon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'Sales Reports',
        href: '/?page=reports&section=sales',
        icon: BarChart3Icon,
        roles: ['Director', 'Sales Manager']
      },
      {
        name: 'Customer Reports',
        href: '/?page=reports&section=customers',
        icon: BarChart3Icon,
        roles: ['Director', 'Customer Success Manager']
      }
    ]
  },
  {
    name: 'Users',
    href: '/?page=users',
    icon: UsersIcon,
    roles: ['Director'],
    children: [
      {
        name: 'All Users',
        href: '/?page=users',
        icon: UsersIcon,
        roles: ['Director']
      },
      {
        name: 'Add User',
        href: '/?page=users&action=create',
        icon: UsersIcon,
        roles: ['Director']
      },
      {
        name: 'Roles & Permissions',
        href: '/?page=users&section=roles',
        icon: UsersIcon,
        roles: ['Director']
      }
    ]
  }
]

export function filterNavigationByRole(items: NavigationItem[], userRole: UserRole): NavigationItem[] {
  return items
    .filter(item => item.roles.includes(userRole))
    .map(item => ({
      ...item,
      children: item.children ? filterNavigationByRole(item.children, userRole) : undefined
    }))
}

export function hasAccessToRoute(route: string, userRole: UserRole): boolean {
  // Profile page should be accessible to all authenticated users
  if (route === '/profile') {
    return true
  }

  // Handle external portal routes with query parameters
  const url = new URL(route, 'http://localhost') // Use dummy base for parsing
  const searchParams = url.searchParams
  
  // Check for customer portal access
  if (searchParams.has('customer') && userRole === 'Customer') {
    return true
  }
  
  // Check for supplier portal access
  if (searchParams.has('supplier') && userRole === 'Supplier') {
    return true
  }

  // Handle legacy external portal routes (direct paths)
  if (route.startsWith('/customer') && userRole === 'Customer') {
    return true
  }
  if (route.startsWith('/supplier') && userRole === 'Supplier') {
    return true
  }

  // Handle internal navigation routes
  const checkItem = (item: NavigationItem): boolean => {
    if (item.href === route && item.roles.includes(userRole)) {
      return true
    }
    if (item.children) {
      return item.children.some(checkItem)
    }
    return false
  }

  return NAVIGATION_ITEMS.some(checkItem)
}

export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    'Director': 'Director',
    'Project Manager': 'Project Manager',
    'Quantity Surveyor': 'Quantity Surveyor',
    'Sales Manager': 'Sales Manager',
    'Customer Success Manager': 'Customer Success Manager',
    'Employee': 'Employee',
    'Customer': 'Customer',
    'Supplier': 'Supplier'
  }

  return roleNames[role] || role
}

export function getRoleColor(role: UserRole): string {
  const roleColors: Record<UserRole, string> = {
    'Director': 'bg-purple-100 text-purple-800',
    'Project Manager': 'bg-blue-100 text-blue-800',
    'Quantity Surveyor': 'bg-green-100 text-green-800',
    'Sales Manager': 'bg-orange-100 text-orange-800',
    'Customer Success Manager': 'bg-pink-100 text-pink-800',
    'Employee': 'bg-gray-100 text-gray-800',
    'Customer': 'bg-indigo-100 text-indigo-800',
    'Supplier': 'bg-yellow-100 text-yellow-800'
  }

  return roleColors[role] || 'bg-gray-100 text-gray-800'
}