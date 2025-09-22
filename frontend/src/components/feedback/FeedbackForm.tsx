import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateFeedbackData, FeedbackCategory, FeedbackPriority } from '../../types/feedback'
import { useCreateFeedback } from '../../hooks/useFeedback'
import { useProjects } from '../../hooks/useProjects'
import { Project } from '../../types/project'

interface FeedbackFormProps {
  onClose?: () => void
  preselectedProjectId?: number
  isModal?: boolean
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onClose,
  preselectedProjectId,
  isModal = true
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rating, setRating] = useState<number>(0)
  const [hoveredRating, setHoveredRating] = useState<number>(0)

  const createFeedback = useCreateFeedback()
  const { data: projectsResponse } = useProjects()
  const projects = projectsResponse?.data?.projects || []

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CreateFeedbackData>({
    defaultValues: {
      projectId: preselectedProjectId,
      priority: 'Medium',
      category: 'General'
    }
  })

  const categories: FeedbackCategory[] = [
    'Service Quality',
    'Communication',
    'Timeline',
    'Budget',
    'General'
  ]

  const priorities: FeedbackPriority[] = [
    'Low',
    'Medium',
    'High',
    'Critical'
  ]

  const onSubmit = async (data: CreateFeedbackData) => {
    setIsSubmitting(true)
    try {
      const feedbackData = {
        ...data,
        rating: rating > 0 ? rating : undefined,
        projectId: data.projectId || undefined
      }

      await createFeedback.mutateAsync(feedbackData)
      if (onClose) onClose()
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityColor = (priority: FeedbackPriority) => {
    switch (priority) {
      case 'Low':
        return 'text-green-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'High':
        return 'text-orange-600'
      case 'Critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const formContent = (
    <div className="p-6">
      {isModal && (
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit Feedback</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {!isModal && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Submit Feedback</h2>
          <p className="text-gray-600 mt-1">Share your experience and help us improve our services</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              id="category"
              {...register('category', { required: 'Category is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <select
              id="priority"
              {...register('priority', { required: 'Priority is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorities.map((priority) => (
                <option key={priority} value={priority} className={getPriorityColor(priority)}>
                  {priority}
                </option>
              ))}
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">
            Related Project (Optional)
          </label>
          <select
            id="projectId"
            {...register('projectId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select a project (optional)</option>
            {projects.map((project: Project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            {...register('title', { required: 'Title is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief summary of your feedback"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            rows={5}
            {...register('description', { required: 'Description is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Provide detailed feedback about your experience..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Overall Rating (Optional)
          </label>
          <div className="flex items-center space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 focus:outline-none"
              >
                <svg
                  className={`w-8 h-8 transition-colors ${star <= (hoveredRating || rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-3 text-sm text-gray-600">
                {rating} out of 5 stars
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Rate your overall experience (1 = Poor, 5 = Excellent)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Your feedback matters</h4>
              <p className="text-sm text-blue-700 mt-1">
                We value your input and use it to improve our services. Our team will review your feedback and respond as needed.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t">
          {isModal && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </div>
      </form>
    </div>
  )

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {formContent}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {formContent}
    </div>
  )
}