import { Calendar, MapPin, User, DollarSign, MoreVertical, Edit, Trash2, Eye, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { Project } from '../../types/project'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { BudgetProgress } from './BudgetProgress'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { useAuth } from '../../hooks/useAuth'

interface ProjectCardProps {
  project: Project
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onView: (project: Project) => void
  onApprove?: (project: Project) => void
}

export function ProjectCard({ project, onEdit, onDelete, onView, onApprove }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { user } = useAuth()
  
  const canApprove = user?.role === 'Director' && project.status === 'Planning'
  const canEdit = user?.role === 'Director' || user?.role === 'Project Manager'
  const canDelete = user?.role === 'Director'

  const daysRemaining = Math.ceil((new Date(project.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysRemaining < 0
  const isNearDeadline = daysRemaining <= 7 && daysRemaining >= 0

  return (
    <div className="bg-white rounded-lg border border-secondary-200 hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-secondary-900 truncate">
              {project.name}
            </h3>
            {project.description && (
              <p className="mt-1 text-sm text-secondary-600 line-clamp-2">
                {project.description}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <ProjectStatusBadge status={project.status} />
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-secondary-400 hover:text-secondary-600 rounded-full hover:bg-secondary-100"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-secondary-200 py-1 z-10">
                  <button
                    onClick={() => {
                      onView(project)
                      setShowMenu(false)
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Details
                  </button>
                  
                  {canEdit && (
                    <button
                      onClick={() => {
                        onEdit(project)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-secondary-700 hover:bg-secondary-50 flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit Project
                    </button>
                  )}
                  
                  {canApprove && onApprove && (
                    <button
                      onClick={() => {
                        onApprove(project)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve Project
                    </button>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={() => {
                        onDelete(project)
                        setShowMenu(false)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Project
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="px-6 pb-4 space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-secondary-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
          </div>
          
          {project.location && (
            <div className="flex items-center gap-2 text-secondary-600">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{project.location}</span>
            </div>
          )}
          
          {project.projectManager && (
            <div className="flex items-center gap-2 text-secondary-600">
              <User className="h-4 w-4" />
              <span className="truncate">
                {project.projectManager.profile?.firstName} {project.projectManager.profile?.lastName}
              </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-secondary-600">
            <DollarSign className="h-4 w-4" />
            <span>{formatCurrency(project.budget)}</span>
          </div>
        </div>

        {/* Timeline Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-secondary-500">
            {isOverdue ? (
              <span className="text-red-600 font-medium">
                Overdue by {Math.abs(daysRemaining)} days
              </span>
            ) : isNearDeadline ? (
              <span className="text-orange-600 font-medium">
                {daysRemaining} days remaining
              </span>
            ) : (
              <span className="text-secondary-600">
                {daysRemaining} days remaining
              </span>
            )}
          </span>
          
          {project.projectType && (
            <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full">
              {project.projectType}
            </span>
          )}
        </div>
      </div>

      {/* Budget Progress */}
      <div className="px-6 pb-6">
        <BudgetProgress 
          budget={project.budget} 
          actualCost={project.actualCost} 
        />
      </div>
    </div>
  )
}