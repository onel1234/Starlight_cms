import { useLocation, Link } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from 'lucide-react'

export function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const breadcrumbNameMap: Record<string, string> = {
    projects: 'Projects',
    tasks: 'Tasks',
    inventory: 'Inventory',
    financial: 'Financial',
    reports: 'Reports',
    users: 'Users',
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <div>
            <Link to="/" className="text-secondary-400 hover:text-secondary-500">
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1
          const to = `/${pathnames.slice(0, index + 1).join('/')}`
          const displayName = breadcrumbNameMap[value] || value

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-secondary-400" aria-hidden="true" />
                {last ? (
                  <span className="ml-4 text-sm font-medium text-secondary-500 capitalize">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="ml-4 text-sm font-medium text-secondary-500 hover:text-secondary-700 capitalize"
                  >
                    {displayName}
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}