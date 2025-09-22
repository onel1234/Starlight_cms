import React from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useCustomerProjects } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { ProjectCard } from './ProjectCard'
import { ProjectStats } from './ProjectStats'

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth()
  const { data: projects, isLoading, error } = useCustomerProjects(user?.id || 0)

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

  const activeProjects = projects?.filter(p => p.status === 'In Progress') || []
  const completedProjects = projects?.filter(p => p.status === 'Completed') || []

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user?.profile?.firstName || 'Customer'}!
        </h1>
        <p className="text-blue-100">
          Track your construction projects and stay updated on progress
        </p>
      </div>

      {/* Project Statistics */}
      <ProjectStats projects={projects || []} />

      {/* Active Projects */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Projects</h2>
        {activeProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600">No active projects at the moment</p>
          </div>
        )}
      </div>

      {/* Recent Completed Projects */}
      {completedProjects.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recently Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedProjects.slice(0, 3).map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}