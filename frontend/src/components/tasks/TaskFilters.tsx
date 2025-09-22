import { Search, Filter, X } from 'lucide-react'
import { TaskStatus, TaskPriority } from '../../types/project'
import { TaskFilters as TaskFiltersType } from '../../services/mockTaskService'
import { useProjects } from '../../hooks/useProjects'
import { useUsers } from '../../hooks/useTasks'

interface TaskFiltersProps {
  filters: TaskFiltersType
  onFiltersChange: (filters: TaskFiltersType) => void
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const { data: projects } = useProjects()
  const { data: users } = useUsers()

  const handleFilterChange = (key: keyof TaskFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' ? undefined : value,
      page: 1 // Reset to first page when filters change
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit
    })
  }

  const hasActiveFilters = filters.search || filters.projectId || filters.assignedTo || 
                          filters.status || filters.priority

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Project Filter */}
        <select
          value={filters.projectId || ''}
          onChange={(e) => handleFilterChange('projectId', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Projects</option>
          {projects?.data?.projects?.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        {/* Assignee Filter */}
        <select
          value={filters.assignedTo || ''}
          onChange={(e) => handleFilterChange('assignedTo', e.target.value ? Number(e.target.value) : undefined)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users?.map((user) => (
            <option key={user.id} value={user.id}>
              {user.profile?.firstName} {user.profile?.lastName}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status || ''}
          onChange={(e) => handleFilterChange('status', e.target.value as TaskStatus)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Statuses</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>

        {/* Priority Filter */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value as TaskPriority)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>

        {/* Sort By */}
        <select
          value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-')
            handleFilterChange('sortBy', sortBy)
            handleFilterChange('sortOrder', sortOrder)
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="dueDate-asc">Due Date (Earliest)</option>
          <option value="dueDate-desc">Due Date (Latest)</option>
          <option value="priority-desc">Priority (High to Low)</option>
          <option value="priority-asc">Priority (Low to High)</option>
          <option value="title-asc">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
        </select>
      </div>
    </div>
  )
}