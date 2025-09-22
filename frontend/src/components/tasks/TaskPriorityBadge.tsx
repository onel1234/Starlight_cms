import { AlertTriangle, Minus, ArrowUp, Zap } from 'lucide-react'
import { TaskPriority } from '../../types/project'

interface TaskPriorityBadgeProps {
  priority: TaskPriority
  size?: 'sm' | 'md'
  showIcon?: boolean
}

export function TaskPriorityBadge({ priority, size = 'sm', showIcon = true }: TaskPriorityBadgeProps) {
  const getPriorityConfig = (priority: TaskPriority) => {
    switch (priority) {
      case 'Low':
        return {
          styles: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Minus
        }
      case 'Medium':
        return {
          styles: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: ArrowUp
        }
      case 'High':
        return {
          styles: 'bg-orange-100 text-orange-700 border-orange-200',
          icon: AlertTriangle
        }
      case 'Critical':
        return {
          styles: 'bg-red-100 text-red-700 border-red-200',
          icon: Zap
        }
      default:
        return {
          styles: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Minus
        }
    }
  }

  const config = getPriorityConfig(priority)
  const Icon = config.icon
  const sizeClasses = size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-sm'
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${config.styles} ${sizeClasses}`}>
      {showIcon && <Icon className={iconSize} />}
      {priority}
    </span>
  )
}