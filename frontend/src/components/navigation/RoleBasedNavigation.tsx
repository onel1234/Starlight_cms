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
    href: '/projects',
    icon: FolderIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee', 'Customer'],
    children: [
      {
        name: 'All Projects',
        href: '/projects',
        icon: FolderIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee']
      },
      {
        name: 'My Projects',
        href: '/projects/my',
        icon: FolderIcon,
        roles: ['Customer']
      },
      {
        name: 'Create Project',
        href: '/projects/create',
        icon: FolderIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Tasks',
    href: '/tasks',
    icon: CheckSquareIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee'],
    children: [
      {
        name: 'All Tasks',
        href: '/tasks',
        icon: CheckSquareIcon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'My Tasks',
        href: '/tasks/my',
        icon: CheckSquareIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee']
      },
      {
        name: 'Create Task',
        href: '/tasks/create',
        icon: CheckSquareIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Inventory',
    href: '/inventory',
    icon: PackageIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee'],
    children: [
      {
        name: 'Products',
        href: '/inventory/products',
        icon: PackageIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Employee']
      },
      {
        name: 'Categories',
        href: '/inventory/categories',
        icon: PackageIcon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'Suppliers',
        href: '/inventory/suppliers',
        icon: TruckIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      },
      {
        name: 'Stock Movements',
        href: '/inventory/movements',
        icon: PackageIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      }
    ]
  },
  {
    name: 'Financial',
    href: '/financial',
    icon: DollarSignIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager'],
    children: [
      {
        name: 'Quotations',
        href: '/financial/quotations',
        icon: FileTextIcon,
        roles: ['Director', 'Quantity Surveyor', 'Sales Manager']
      },
      {
        name: 'Purchase Orders',
        href: '/financial/purchase-orders',
        icon: ClipboardListIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      },
      {
        name: 'Invoices',
        href: '/financial/invoices',
        icon: CreditCardIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor']
      },
      {
        name: 'Payments',
        href: '/financial/payments',
        icon: DollarSignIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Tenders',
    href: '/tenders',
    icon: ClipboardListIcon,
    roles: ['Director', 'Sales Manager', 'Supplier'],
    children: [
      {
        name: 'All Tenders',
        href: '/tenders',
        icon: ClipboardListIcon,
        roles: ['Director', 'Sales Manager']
      },
      {
        name: 'Available Tenders',
        href: '/tenders/available',
        icon: ClipboardListIcon,
        roles: ['Supplier']
      },
      {
        name: 'My Submissions',
        href: '/tenders/submissions',
        icon: ClipboardListIcon,
        roles: ['Supplier']
      },
      {
        name: 'Create Tender',
        href: '/tenders/create',
        icon: ClipboardListIcon,
        roles: ['Director', 'Sales Manager']
      }
    ]
  },
  {
    name: 'Feedback',
    href: '/feedback',
    icon: MessageSquareIcon,
    roles: ['Director', 'Customer Success Manager', 'Customer'],
    children: [
      {
        name: 'All Feedback',
        href: '/feedback',
        icon: MessageSquareIcon,
        roles: ['Director', 'Customer Success Manager']
      },
      {
        name: 'Submit Feedback',
        href: '/feedback/submit',
        icon: MessageSquareIcon,
        roles: ['Customer']
      },
      {
        name: 'My Feedback',
        href: '/feedback/my',
        icon: MessageSquareIcon,
        roles: ['Customer']
      }
    ]
  },
  {
    name: 'Documents',
    href: '/documents',
    icon: FolderOpenIcon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee'],
    children: [
      {
        name: 'All Documents',
        href: '/documents',
        icon: FolderOpenIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee']
      },
      {
        name: 'Upload Documents',
        href: '/documents/upload',
        icon: FileTextIcon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager', 'Employee']
      },
      {
        name: 'Manage Folders',
        href: '/documents/folders',
        icon: FolderIcon,
        roles: ['Director', 'Project Manager']
      }
    ]
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3Icon,
    roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager'],
    children: [
      {
        name: 'Dashboard',
        href: '/reports',
        icon: BarChart3Icon,
        roles: ['Director', 'Project Manager', 'Quantity Surveyor', 'Sales Manager', 'Customer Success Manager']
      },
      {
        name: 'Project Reports',
        href: '/reports/projects',
        icon: BarChart3Icon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'Financial Reports',
        href: '/reports/financial',
        icon: BarChart3Icon,
        roles: ['Director', 'Quantity Surveyor']
      },
      {
        name: 'Inventory Reports',
        href: '/reports/inventory',
        icon: BarChart3Icon,
        roles: ['Director', 'Project Manager']
      },
      {
        name: 'Sales Reports',
        href: '/reports/sales',
        icon: BarChart3Icon,
        roles: ['Director', 'Sales Manager']
      },
      {
        name: 'Customer Reports',
        href: '/reports/customers',
        icon: BarChart3Icon,
        roles: ['Director', 'Customer Success Manager']
      }
    ]
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    roles: ['Director'],
    children: [
      {
        name: 'All Users',
        href: '/users',
        icon: UsersIcon,
        roles: ['Director']
      },
      {
        name: 'Add User',
        href: '/users/create',
        icon: UsersIcon,
        roles: ['Director']
      },
      {
        name: 'Roles & Permissions',
        href: '/users/roles',
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
  
  // Handle external portal routes
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