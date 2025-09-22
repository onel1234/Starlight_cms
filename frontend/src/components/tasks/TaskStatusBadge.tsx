import { TaskStatus } from '../../types/project'

interface TaskStatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'md'
}

export function TaskStatusBadge({ status, size = 'sm' }: TaskStatusBadgeProps) {
  const getStatusStyles = (status: TaskStatus) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${getStatusStyles(status)} ${sizeClasses}`}>
      {status}
    </span>
  )
}