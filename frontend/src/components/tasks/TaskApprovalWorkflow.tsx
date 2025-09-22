import { useState } from 'react'
import { X, CheckCircle, XCircle, MessageSquare, Clock, User } from 'lucide-react'
import { Task } from '../../types/project'
import { useApproveTask, useDeclineTask } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'

interface TaskApprovalWorkflowProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

interface ApprovalComment {
  id: number
  taskId: number
  userId: number
  userName: string
  action: 'approve' | 'decline' | 'comment'
  comment: string
  createdAt: Date
}

// Mock approval history - in real app this would come from API
const mockApprovalHistory: ApprovalComment[] = [
  {
    id: 1,
    taskId: 1,
    userId: 2,
    userName: 'John Manager',
    action: 'comment',
    comment: 'Please review the specifications before marking as complete.',
    createdAt: new Date('2024-01-10T10:30:00')
  }
]

export function TaskApprovalWorkflow({ task, isOpen, onClose }: TaskApprovalWorkflowProps) {
  const [comment, setComment] = useState('')
  const [showCommentForm, setShowCommentForm] = useState(false)
  const [actionType, setActionType] = useState<'approve' | 'decline' | null>(null)

  const { user } = useAuth()
  const approveTaskMutation = useApproveTask()
  const declineTaskMutation = useDeclineTask()

  const approvalHistory = mockApprovalHistory.filter(h => h.taskId === task.id)

  const canApprove = user?.role === 'Project Manager' || user?.role === 'Director'
  const isTaskPendingApproval = task.status === 'In Progress' && task.completionPercentage === 100

  const handleApprove = () => {
    setActionType('approve')
    setShowCommentForm(true)
  }

  const handleDecline = () => {
    setActionType('decline')
    setShowCommentForm(true)
  }

  const handleSubmitAction = () => {
    if (!actionType) return

    if (actionType === 'approve') {
      approveTaskMutation.mutate({
        id: task.id,
        comment: comment.trim() || undefined
      })
    } else if (actionType === 'decline') {
      if (!comment.trim()) return // Decline requires a comment
      
      declineTaskMutation.mutate({
        id: task.id,
        comment: comment.trim()
      })
    }

    setComment('')
    setShowCommentForm(false)
    setActionType(null)
    onClose()
  }

  const handleCancel = () => {
    setComment('')
    setShowCommentForm(false)
    setActionType(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Task Approval - {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Task Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">{task.title}</h3>
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
            </div>
            
            {task.description && (
              <p className="text-sm text-gray-600 mb-3">{task.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Assignee:</span>
                <p className="font-medium">
                  {task.assignee ? 
                    `${task.assignee.profile?.firstName} ${task.assignee.profile?.lastName}` : 
                    'Unassigned'
                  }
                </p>
              </div>
              <div>
                <span className="text-gray-500">Progress:</span>
                <p className="font-medium">{task.completionPercentage}%</p>
              </div>
              <div>
                <span className="text-gray-500">Due Date:</span>
                <p className="font-medium">
                  {task.dueDate ? formatDate(task.dueDate) : 'No due date'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Actual Hours:</span>
                <p className="font-medium">{task.actualHours}h</p>
              </div>
            </div>
          </div>

          {/* Approval Status */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Approval Status</h3>
            
            {isTaskPendingApproval ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Pending Approval</span>
                </div>
                <p className="text-sm text-yellow-700">
                  This task has been marked as 100% complete and is awaiting approval from a project manager or director.
                </p>
              </div>
            ) : task.status === 'Completed' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Approved</span>
                </div>
                <p className="text-sm text-green-700">
                  This task has been approved and marked as completed.
                </p>
              </div>
            ) : task.status === 'On Hold' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-800">Declined</span>
                </div>
                <p className="text-sm text-red-700">
                  This task has been declined and requires additional work.
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-800">In Progress</span>
                </div>
                <p className="text-sm text-blue-700">
                  This task is currently in progress. Approval will be available once it's marked as 100% complete.
                </p>
              </div>
            )}
          </div>

          {/* Approval Actions */}
          {canApprove && isTaskPendingApproval && !showCommentForm && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Actions</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleApprove}
                  disabled={approveTaskMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Task
                </button>
                <button
                  onClick={handleDecline}
                  disabled={declineTaskMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Decline Task
                </button>
              </div>
            </div>
          )}

          {/* Comment Form */}
          {showCommentForm && (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">
                {actionType === 'approve' ? 'Approve Task' : 'Decline Task'}
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment {actionType === 'decline' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add an optional comment about the approval...'
                      : 'Please explain why this task is being declined...'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmitAction}
                  disabled={
                    (actionType === 'decline' && !comment.trim()) ||
                    approveTaskMutation.isPending ||
                    declineTaskMutation.isPending
                  }
                  className={`px-4 py-2 text-white rounded-md disabled:opacity-50 ${
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionType === 'approve' ? 'Approve' : 'Decline'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Approval History */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Approval History</h3>
            
            {approvalHistory.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No approval history yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {approvalHistory.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg">
                    <div className={`p-2 rounded-full ${
                      entry.action === 'approve' ? 'bg-green-100' :
                      entry.action === 'decline' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      {entry.action === 'approve' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : entry.action === 'decline' ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{entry.userName}</span>
                        <span className="text-sm text-gray-500">
                          {entry.action === 'approve' ? 'approved' : 
                           entry.action === 'decline' ? 'declined' : 'commented on'} this task
                        </span>
                        <span className="text-sm text-gray-400">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{entry.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}