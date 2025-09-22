import { ProjectStatus } from '../../types/project'

interface ProjectStatusBadgeProps {
  status: ProjectStatus
  className?: string
}

const statusConfig = {
  'Planning': {
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: '📋'
  },
  'In Progress': {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: '🚧'
  },
  'On Hold': {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: '⏸️'
  },
  'Completed': {
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: '✅'
  },
  'Closed': {
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: '🔒'
  }
}

export function ProjectStatusBadge({ status, className = '' }: ProjectStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color} ${className}`}>
      <span className="text-xs">{config.icon}</span>
      {status}
    </span>
  )
}