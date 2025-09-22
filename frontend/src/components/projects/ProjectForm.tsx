import { useForm } from 'react-hook-form'
import { joiResolver } from '@hookform/resolvers/joi'
import Joi from 'joi'
import { X, Save, Loader2 } from 'lucide-react'
import { Project, CreateProjectData, UpdateProjectData, ProjectStatus } from '../../types/project'
import { formatDateForInput } from '../../utils/formatters'

interface ProjectFormProps {
  project?: Project
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateProjectData | UpdateProjectData) => void
  isLoading?: boolean
}

const projectSchema = Joi.object({
  name: Joi.string().required().min(1).max(255).messages({
    'string.empty': 'Project name is required',
    'string.max': 'Project name must be less than 255 characters'
  }),
  description: Joi.string().allow('').max(1000).messages({
    'string.max': 'Description must be less than 1000 characters'
  }),
  clientId: Joi.number().optional().allow(null),
  projectManagerId: Joi.number().optional().allow(null),
  startDate: Joi.date().required().messages({
    'date.base': 'Start date is required'
  }),
  endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
    'date.base': 'End date is required',
    'date.greater': 'End date must be after start date'
  }),
  budget: Joi.number().required().min(0).messages({
    'number.base': 'Budget must be a valid number',
    'number.min': 'Budget must be greater than or equal to 0'
  }),
  location: Joi.string().allow('').max(500).messages({
    'string.max': 'Location must be less than 500 characters'
  }),
  projectType: Joi.string().allow('').max(100).messages({
    'string.max': 'Project type must be less than 100 characters'
  }),
  status: Joi.string().valid('Planning', 'In Progress', 'On Hold', 'Completed', 'Closed').optional(),
  actualCost: Joi.number().min(0).optional().messages({
    'number.min': 'Actual cost must be greater than or equal to 0'
  })
})

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: 'Planning', label: 'Planning' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'On Hold', label: 'On Hold' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Closed', label: 'Closed' },
]

export function ProjectForm({ project, isOpen, onClose, onSubmit, isLoading }: ProjectFormProps) {
  const isEditing = !!project

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<CreateProjectData & { status?: ProjectStatus; actualCost?: number }>({
    resolver: joiResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description || '',
      clientId: project.clientId || undefined,
      projectManagerId: project.projectManagerId || undefined,
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      budget: project.budget,
      location: project.location || '',
      projectType: project.projectType || '',
      status: project.status,
      actualCost: project.actualCost
    } : {
      name: '',
      description: '',
      startDate: formatDateForInput(new Date()),
      endDate: formatDateForInput(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 days from now
      budget: 0,
      location: '',
      projectType: ''
    }
  })

  const handleFormSubmit = (data: any) => {
    const formData = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      budget: Number(data.budget),
      actualCost: data.actualCost ? Number(data.actualCost) : undefined,
      clientId: data.clientId || undefined,
      projectManagerId: data.projectManagerId || undefined
    }
    onSubmit(formData)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200">
          <h2 className="text-xl font-semibold text-secondary-900">
            {isEditing ? 'Edit Project' : 'Create New Project'}
          </h2>
          <button
            onClick={handleClose}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter project name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter project description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Project Type
                </label>
                <input
                  type="text"
                  {...register('projectType')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="e.g., Water Treatment, Sewerage"
                />
                {errors.projectType && (
                  <p className="mt-1 text-sm text-red-600">{errors.projectType.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  {...register('location')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter project location"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Timeline and Budget */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">Timeline & Budget</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  {...register('endDate')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Budget *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('budget')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.00"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
                )}
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Actual Cost
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('actualCost')}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  {errors.actualCost && (
                    <p className="mt-1 text-sm text-red-600">{errors.actualCost.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Assignment and Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900">Assignment & Status</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Client
                </label>
                <select
                  {...register('clientId')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a client</option>
                  {/* TODO: Load clients from API */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Project Manager
                </label>
                <select
                  {...register('projectManagerId')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select a project manager</option>
                  {/* TODO: Load project managers from API */}
                </select>
              </div>
            </div>

            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-secondary-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-secondary-700 bg-white border border-secondary-300 rounded-lg hover:bg-secondary-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isEditing ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}