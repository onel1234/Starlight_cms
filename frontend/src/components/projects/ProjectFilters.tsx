import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { ProjectStatus } from '../../types/project'
import { ProjectFilters as ProjectFiltersType } from '../../services/mockProjectService'

interface ProjectFiltersProps {
  filters: ProjectFiltersType
  onFiltersChange: (filters: ProjectFiltersType) => void
  onClearFilters: () => void
}

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'Planning', label: 'Planning' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Closed', label: 'Closed' },
]

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
  { value: 'budget', label: 'Budget' },
  { value: 'status', label: 'Status' },
  { value: 'createdAt', label: 'Created Date' },
]

export function ProjectFilters({ filters, onFiltersChange, onClearFilters }: ProjectFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search, page: 1 })
  }

  const handleStatusChange = (status: string) => {
    onFiltersChange({ 
      ...filters, 
      status: status === '' ? undefined : status,
      page: 1 
    })
  }

  const handleSortChange = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    onFiltersChange({ ...filters, sortBy, sortOrder, page: 1 })
  }

  const hasActiveFilters = filters.status || filters.search || filters.sortBy

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search projects..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Status</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy || 'createdAt'}
          onChange={(e) => handleSortChange(e.target.value, filters.sortOrder || 'desc')}
          className="px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>

        <select
          value={filters.sortOrder || 'desc'}
          onChange={(e) => handleSortChange(filters.sortBy || 'createdAt', e.target.value as 'asc' | 'desc')}
          className="px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100"
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="p-4 bg-secondary-50 rounded-lg border border-secondary-200">
          <h4 className="text-sm font-medium text-secondary-900 mb-3">Advanced Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary-700 mb-1">
                Project Manager
              </label>
              <select
                value={filters.projectManagerId || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  projectManagerId: e.target.value ? Number(e.target.value) : undefined,
                  page: 1 
                })}
                className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Managers</option>
                {/* TODO: Load from API */}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary-700 mb-1">
                Client
              </label>
              <select
                value={filters.clientId || ''}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  clientId: e.target.value ? Number(e.target.value) : undefined,
                  page: 1 
                })}
                className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Clients</option>
                {/* TODO: Load from API */}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-secondary-700 mb-1">
                Items per page
              </label>
              <select
                value={filters.limit || 10}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  limit: Number(e.target.value),
                  page: 1 
                })}
                className="w-full px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}