import React from 'react'
import { Link } from 'react-router-dom'
import { CustomerProject } from '../../../types/external'
import { formatCurrency, formatDate } from '../../../utils/formatters'

interface ProjectCardProps {
  project: CustomerProject
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const getStatusColor = (status: CustomerProject['status']) => {
    switch (status) {
      case 'Planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800'
      case 'On Hold':
        return 'bg-orange-100 text-orange-800'
      case 'Completed':
        return 'bg-green-100 text-green-800'
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const progressPercentage = Math.min(100, Math.max(0, project.progress))

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {project.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Project Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget:</span>
            <span className="font-medium">{formatCurrency(project.budget)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">End Date:</span>
            <span className="font-medium">{formatDate(project.endDate)}</span>
          </div>
          {project.location && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Location:</span>
              <span className="font-medium text-right">{project.location}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link
          to={`/customer/projects/${project.id}`}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
        >
          View Details
        </Link>
      </div>
    </div>
  )
}