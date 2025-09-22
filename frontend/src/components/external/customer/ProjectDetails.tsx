import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import { useCustomerProject } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { ProjectTimeline } from './ProjectTimeline'
import { ProjectMilestones } from './ProjectMilestones'
import { ProjectDocuments } from './ProjectDocuments'
import { CustomerFeedbackForm } from './CustomerFeedbackForm'
import { formatCurrency, formatDate } from '../../../utils/formatters'

export const ProjectDetails: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'milestones' | 'documents' | 'feedback'>('overview')
  
  const { data: project, isLoading, error } = useCustomerProject(
    user?.id || 0, 
    parseInt(projectId || '0')
  )

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Project Not Found</h3>
        <p className="text-red-600 mt-2">The requested project could not be found.</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
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

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'milestones', label: 'Milestones', icon: '🎯' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'feedback', label: 'Feedback', icon: '💬' }
  ] as const

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Spent</p>
            <p className="text-lg font-semibold text-gray-900">{formatCurrency(project.actualCost)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Start Date</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(project.startDate)}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">End Date</p>
            <p className="text-lg font-semibold text-gray-900">{formatDate(project.endDate)}</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Project Type</p>
                    <p className="font-medium">{project.projectType || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium">{project.location || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget Utilization</p>
                    <p className="font-medium">
                      {((project.actualCost / project.budget) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining Budget</p>
                    <p className="font-medium">{formatCurrency(project.budget - project.actualCost)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && <ProjectTimeline timeline={project.timeline} />}
          {activeTab === 'milestones' && <ProjectMilestones milestones={project.milestones} />}
          {activeTab === 'documents' && <ProjectDocuments documents={project.documents} />}
          {activeTab === 'feedback' && <CustomerFeedbackForm projectId={project.id} />}
        </div>
      </div>
    </div>
  )
}