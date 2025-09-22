import { useState } from 'react'
import { Calendar, Clock, User, AlertCircle, CheckCircle2, Play, Pause, MoreVertical } from 'lucide-react'
import { Task } from '../../types/project'
import { formatDate, formatDuration } from '../../utils/formatters'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import { TaskProgressSlider } from './TaskProgressSlider'
import { TaskActions } from './TaskActions'

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: number) => void
  onUpdateProgress?: (id: number, progress: number) => void
  onStartTimer?: (id: number) => void
  onStopTimer?: (id: number) => void
  onViewDependencies?: (task: Task) => void
  onViewTimeLogs?: (task: Task) => void
  onViewApprovalWorkflow?: (task: Task) => void
  isTimerRunning?: boolean
}

export function TaskCard({ 
  task, 
  onEdit, 
  onDelete, 
  onUpdateProgress,
  onStartTimer,
  onStopTimer,
  onViewDependencies,
  onViewTimeLogs,
  onViewApprovalWorkflow,
  isTimerRunning = false
}: TaskCardProps) {
  const [showActions, setShowActions] = useState(false)

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed'

  return (
    <div className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${
      isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-3">
          <TaskPriorityBadge priority={task.priority} />
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>
            {showActions && (
              <TaskActions
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDependencies={onViewDependencies ? () => onViewDependencies(task) : undefined}
                onViewTimeLogs={onViewTimeLogs ? () => onViewTimeLogs(task) : undefined}
                onApprove={onViewApprovalWorkflow ? () => onViewApprovalWorkflow(task) : undefined}
                onDecline={onViewApprovalWorkflow ? () => onViewApprovalWorkflow(task) : undefined}
                onClose={() => setShowActions(false)}
              />
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Status and Progress */}
        <div className="flex items-center justify-between">
          <TaskStatusBadge status={task.status} />
          <span className="text-sm text-gray-500">{task.completionPercentage}% complete</span>
        </div>

        {/* Progress Slider */}
        <TaskProgressSlider
          value={task.completionPercentage}
          onChange={(progress) => onUpdateProgress?.(task.id, progress)}
          disabled={task.status === 'Completed'}
        />

        {/* Task Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {task.assignee && (
              <div className="flex items-center gap-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>{task.assignee.profile?.firstName} {task.assignee.profile?.lastName}</span>
              </div>
            )}
            {task.dueDate && (
              <div className={`flex items-center gap-2 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                {isOverdue ? <AlertCircle className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {task.estimatedHours && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Est: {task.estimatedHours}h</span>
              </div>
            )}
            {task.actualHours > 0 && (
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="h-4 w-4" />
                <span>Actual: {formatDuration(task.actualHours * 60)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2">
            {isTimerRunning ? (
              <button
                onClick={() => onStopTimer?.(task.id)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                <Pause className="h-3 w-3" />
                Stop Timer
              </button>
            ) : (
              <button
                onClick={() => onStartTimer?.(task.id)}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                disabled={task.status === 'Completed'}
              >
                <Play className="h-3 w-3" />
                Start Timer
              </button>
            )}
          </div>
          <span className="text-xs text-gray-500">
            Created {formatDate(task.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}