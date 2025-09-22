import React from 'react'
import { ProjectMilestone } from '../../../types/external'
import { formatDate } from '../../../utils/formatters'

interface ProjectMilestonesProps {
  milestones: ProjectMilestone[]
}

export const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({ milestones }) => {
  const getStatusColor = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Pending':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'Overdue':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: ProjectMilestone['status']) => {
    switch (status) {
      case 'Completed':
        return '✅'
      case 'In Progress':
        return '🔄'
      case 'Pending':
        return '⏳'
      case 'Overdue':
        return '⚠️'
      default:
        return '📋'
    }
  }

  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Milestones</h3>
      
      {sortedMilestones.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No milestones defined for this project
        </div>
      ) : (
        <div className="space-y-4">
          {sortedMilestones.map((milestone) => (
            <div key={milestone.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getStatusIcon(milestone.status)}</span>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900">{milestone.title}</h4>
                    {milestone.description && (
                      <p className="text-gray-600 mt-1">{milestone.description}</p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(milestone.status)}`}>
                  {milestone.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm text-gray-600">{milestone.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      milestone.status === 'Completed' ? 'bg-green-500' :
                      milestone.status === 'In Progress' ? 'bg-blue-500' :
                      milestone.status === 'Overdue' ? 'bg-red-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${milestone.progress}%` }}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2 font-medium">{formatDate(milestone.dueDate)}</span>
                </div>
                {milestone.completedDate && (
                  <div>
                    <span className="text-gray-600">Completed:</span>
                    <span className="ml-2 font-medium text-green-600">{formatDate(milestone.completedDate)}</span>
                  </div>
                )}
              </div>

              {/* Overdue Warning */}
              {milestone.status === 'Overdue' && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 text-sm font-medium">
                    ⚠️ This milestone is overdue. Please contact the project manager for updates.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}