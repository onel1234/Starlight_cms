import { useState } from 'react'
import { Plus, Grid, List, Calendar, BarChart3 } from 'lucide-react'
import { useProjects, useCreateProject, useUpdateProject, useDeleteProject, useApproveProject } from '../../hooks/useProjects'
import { ProjectFilters } from './ProjectFilters'
import { ProjectCard } from './ProjectCard'
import { ProjectForm } from './ProjectForm'
import { ProjectGanttChart } from './ProjectGanttChart'
import { ProjectStats } from './ProjectStatsSimple'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { Project, CreateProjectData, UpdateProjectData } from '../../types/project'
import { ProjectFilters as ProjectFiltersType } from '../../services/mockProjectService'
import { useAuth } from '../../hooks/useAuth'
import { formatCurrency, formatDate } from '../../utils/formatters'

type ViewType = 'grid' | 'list' | 'gantt' | 'stats'

export function ProjectDashboard() {
  const { user } = useAuth()
  const [view, setView] = useState<ViewType>('grid')
  const [ganttViewMode, setGanttViewMode] = useState<'month' | 'week' | 'day'>('month')
  const [filters, setFilters] = useState<ProjectFiltersType>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Project | null>(null)

  const { data: projectsData, isLoading, error } = useProjects(filters)
  const createProjectMutation = useCreateProject()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const approveProjectMutation = useApproveProject()

  const projects = projectsData?.data?.projects || []
  const totalProjects = projectsData?.data?.total || 0
  const totalPages = projectsData?.data?.totalPages || 1

  const canCreateProject = user?.role === 'Director' || user?.role === 'Project Manager'

  const handleFiltersChange = (newFilters: ProjectFiltersType) => {
    setFilters(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const handleCreateProject = () => {
    setSelectedProject(null)
    setShowForm(true)
  }

  const handleEditProject = (project: Project) => {
    setSelectedProject(project)
    setShowForm(true)
  }

  const handleViewProject = (project: Project) => {
    // TODO: Navigate to project detail page
    console.log('View project:', project)
  }

  const handleDeleteProject = (project: Project) => {
    setShowDeleteConfirm(project)
  }

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      deleteProjectMutation.mutate(showDeleteConfirm.id)
      setShowDeleteConfirm(null)
    }
  }

  const handleApproveProject = (project: Project) => {
    approveProjectMutation.mutate(project.id)
  }

  const handleFormSubmit = (data: CreateProjectData | UpdateProjectData) => {
    if (selectedProject) {
      updateProjectMutation.mutate(
        { id: selectedProject.id, data },
        {
          onSuccess: () => {
            setShowForm(false)
            setSelectedProject(null)
          }
        }
      )
    } else {
      createProjectMutation.mutate(data as CreateProjectData, {
        onSuccess: () => {
          setShowForm(false)
        }
      })
    }
  }

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page })
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load projects</p>
          <p className="text-sm text-secondary-600 mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Projects</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage construction projects and track progress ({totalProjects} total)
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-white border border-secondary-300 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded-md ${view === 'grid' ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:text-secondary-900'}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md ${view === 'list' ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:text-secondary-900'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('gantt')}
              className={`p-2 rounded-md ${view === 'gantt' ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:text-secondary-900'}`}
              title="Gantt Chart"
            >
              <Calendar className="h-4 w-4" />
            </button>
            <button
              onClick={() => setView('stats')}
              className={`p-2 rounded-md ${view === 'stats' ? 'bg-primary-100 text-primary-700' : 'text-secondary-600 hover:text-secondary-900'}`}
              title="Statistics"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>

          {canCreateProject && (
            <button
              onClick={handleCreateProject}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              New Project
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      {(view === 'grid' || view === 'list') && (
        <ProjectFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Gantt View Mode Selector */}
      {view === 'gantt' && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-secondary-700">View Mode:</span>
          <select
            value={ganttViewMode}
            onChange={(e) => setGanttViewMode(e.target.value as 'month' | 'week' | 'day')}
            className="px-3 py-2 text-sm border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
          </select>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {view === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onView={handleViewProject}
                  onApprove={handleApproveProject}
                />
              ))}
            </div>
          )}

          {view === 'list' && (
            <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-secondary-200">
                  <thead className="bg-secondary-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Timeline
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Budget
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Manager
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-secondary-200">
                    {projects.map((project) => (
                      <tr key={project.id} className="hover:bg-secondary-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-secondary-900">
                              {project.name}
                            </div>
                            <div className="text-sm text-secondary-500">
                              {project.projectType}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                            project.status === 'Planning' ? 'bg-gray-100 text-gray-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          <div>
                            <div>{formatDate(project.startDate)}</div>
                            <div className="text-xs text-secondary-500">{formatDate(project.endDate)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          <div>
                            <div>{formatCurrency(project.budget)}</div>
                            <div className="text-xs text-secondary-500">
                              Spent: {formatCurrency(project.actualCost)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                          {project.projectManager ? (
                            <div>
                              <div>{project.projectManager.profile?.firstName} {project.projectManager.profile?.lastName}</div>
                              <div className="text-xs text-secondary-500">{project.projectManager.email}</div>
                            </div>
                          ) : (
                            <span className="text-secondary-400">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewProject(project)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </button>
                            {canCreateProject && (
                              <button
                                onClick={() => handleEditProject(project)}
                                className="text-secondary-600 hover:text-secondary-900"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {view === 'gantt' && (
            <ProjectGanttChart
              projects={projects}
              viewMode={ganttViewMode}
              onTaskClick={handleViewProject}
            />
          )}

          {view === 'stats' && (
            <ProjectStats projects={projects} />
          )}
        </>
      )}

      {/* Pagination */}
      {(view === 'grid' || view === 'list') && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-secondary-700">
            Showing {((filters.page || 1) - 1) * (filters.limit || 12) + 1} to{' '}
            {Math.min((filters.page || 1) * (filters.limit || 12), totalProjects)} of{' '}
            {totalProjects} projects
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange((filters.page || 1) - 1)}
              disabled={filters.page === 1}
              className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg ${filters.page === page
                    ? 'bg-primary-600 text-white'
                    : 'text-secondary-700 bg-white border border-secondary-300 hover:bg-secondary-50'
                    }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange((filters.page || 1) + 1)}
              disabled={filters.page === totalPages}
              className="px-3 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectForm
        project={selectedProject || undefined}
        isOpen={showForm}
        onClose={() => {
          setShowForm(false)
          setSelectedProject(null)
        }}
        onSubmit={handleFormSubmit}
        isLoading={createProjectMutation.isPending || updateProjectMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                Delete Project
              </h3>
              <p className="text-secondary-600 mb-4">
                Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteProjectMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteProjectMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}