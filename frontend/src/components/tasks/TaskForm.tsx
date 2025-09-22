import { useState, useEffect } from 'react'
import { X, Calendar, User, Clock } from 'lucide-react'
import { Task, CreateTaskData, UpdateTaskData, TaskPriority } from '../../types/project'
import { useProjects } from '../../hooks/useProjects'
import { useUsers } from '../../hooks/useTasks'
import { formatDateForInput } from '../../utils/formatters'

interface TaskFormProps {
  task?: Task
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTaskData | UpdateTaskData) => void
  isLoading?: boolean
}

export function TaskForm({ task, isOpen, onClose, onSubmit, isLoading = false }: TaskFormProps) {
  const { data: projects } = useProjects()
  const { data: users } = useUsers()

  const [formData, setFormData] = useState<CreateTaskData>({
    projectId: 0,
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: undefined,
    startDate: undefined,
    dueDate: undefined,
    estimatedHours: undefined
  })

  useEffect(() => {
    if (task) {
      setFormData({
        projectId: task.projectId,
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        assignedTo: task.assignedTo,
        startDate: task.startDate,
        dueDate: task.dueDate,
        estimatedHours: task.estimatedHours
      })
    } else {
      setFormData({
        projectId: 0,
        title: '',
        description: '',
        priority: 'Medium',
        assignedTo: undefined,
        startDate: undefined,
        dueDate: undefined,
        estimatedHours: undefined
      })
    }
  }, [task, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.projectId) return

    const submitData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      estimatedHours: formData.estimatedHours || undefined
    }

    onSubmit(submitData)
  }

  const handleChange = (field: keyof CreateTaskData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => handleChange('projectId', Number(e.target.value))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={0}>Select a project</option>
              {projects?.projects && projects.projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              placeholder="Enter task title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder="Enter task description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value as TaskPriority)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Assignee
              </label>
              <select
                value={formData.assignedTo || ''}
                onChange={(e) => handleChange('assignedTo', e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Unassigned</option>
                {users && users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.profile?.firstName} {user.profile?.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate ? formatDateForInput(formData.startDate) : ''}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate ? formatDateForInput(formData.dueDate) : ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                min={formData.startDate ? formatDateForInput(formData.startDate) : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Estimated Hours
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={formData.estimatedHours || ''}
              onChange={(e) => handleChange('estimatedHours', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Enter estimated hours"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim() || !formData.projectId}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}