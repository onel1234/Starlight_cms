import { useRef, useEffect } from 'react'
import { Edit, Trash2, CheckCircle, XCircle, Clock, Link } from 'lucide-react'
import { Task } from '../../types/project'

interface TaskActionsProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (id: number) => void
  onApprove?: (id: number) => void
  onDecline?: (id: number) => void
  onViewDependencies?: (id: number) => void
  onViewTimeLogs?: (id: number) => void
  onClose: () => void
}

export function TaskActions({ 
  task, 
  onEdit, 
  onDelete, 
  onApprove, 
  onDecline,
  onViewDependencies,
  onViewTimeLogs,
  onClose 
}: TaskActionsProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10"
    >
      {onEdit && (
        <button
          onClick={() => handleAction(() => onEdit(task))}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Task
        </button>
      )}

      {onViewTimeLogs && (
        <button
          onClick={() => handleAction(() => onViewTimeLogs(task.id))}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Clock className="h-4 w-4" />
          View Time Logs
        </button>
      )}

      {onViewDependencies && (
        <button
          onClick={() => handleAction(() => onViewDependencies(task.id))}
          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
        >
          <Link className="h-4 w-4" />
          View Dependencies
        </button>
      )}

      {task.status === 'In Progress' && onApprove && (
        <button
          onClick={() => handleAction(() => onApprove(task.id))}
          className="w-full px-4 py-2 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Approve Task
        </button>
      )}

      {task.status === 'In Progress' && onDecline && (
        <button
          onClick={() => handleAction(() => onDecline(task.id))}
          className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Decline Task
        </button>
      )}

      {onDelete && (
        <>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => handleAction(() => onDelete(task.id))}
            className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Task
          </button>
        </>
      )}
    </div>
  )
}