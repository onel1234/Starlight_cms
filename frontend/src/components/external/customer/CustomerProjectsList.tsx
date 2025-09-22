import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { useCustomerProjects } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { ProjectCard } from './ProjectCard'

export const CustomerProjectsList: React.FC = () => {
  const { user } = useAuth()
  const { data: projects, isLoading, error } = useCustomerProjects(user?.id || 0)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Projects</h3>
        <p className="text-red-600 mt-2">Unable to load your projects. Please try again later.</p>
      </div>
    )
  }

  const filteredProjects = projects?.filter(project => 
    statusFilter === 'all' || project.status === statusFilter
  ) || []

  const statusOptions = [
    { value: 'all', label: 'All Projects' },
    { value: 'Planning', label: 'Planning' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Closed', label: 'Closed' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Projects</h1>
          <p className="text-gray-600 mt-1">
            Track progress and view details of all your construction projects
          </p>
        </div>
        
        {/* Filter */}
        <div className="mt-4 sm:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">🏗️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {statusFilter === 'all' ? 'No Projects Found' : `No ${statusFilter} Projects`}
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter === 'all' 
              ? "You don't have any projects yet." 
              : `You don't have any projects with ${statusFilter.toLowerCase()} status.`
            }
          </p>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Projects
            </button>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">Need Help?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/customer/messages"
            className="flex items-center p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
          >
            <span className="text-2xl mr-3">💬</span>
            <div>
              <div className="font-medium text-blue-900">Contact Project Team</div>
              <div className="text-sm text-blue-700">Send a message to your project manager</div>
            </div>
          </Link>
          
          <Link
            to="/customer/feedback"
            className="flex items-center p-3 bg-white rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
          >
            <span className="text-2xl mr-3">💭</span>
            <div>
              <div className="font-medium text-blue-900">Submit Feedback</div>
              <div className="text-sm text-blue-700">Share your thoughts and suggestions</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}