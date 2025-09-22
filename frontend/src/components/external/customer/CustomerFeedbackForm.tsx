import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useSubmitCustomerFeedback, useCustomerProjects } from '../../../hooks/useExternal'

interface CustomerFeedbackFormProps {
  projectId?: number
}

export const CustomerFeedbackForm: React.FC<CustomerFeedbackFormProps> = ({ projectId }) => {
  const { user } = useAuth()
  const { data: projects } = useCustomerProjects(user?.id || 0)
  const [selectedProjectId, setSelectedProjectId] = useState(projectId || (projects?.[0]?.id || 0))
  const [rating, setRating] = useState(0)
  const [category, setCategory] = useState('')
  const [message, setMessage] = useState('')
  const [hoveredRating, setHoveredRating] = useState(0)

  const submitFeedback = useSubmitCustomerFeedback()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rating || !category || !message.trim()) {
      return
    }

    submitFeedback.mutate({
      projectId: selectedProjectId,
      feedback: {
        rating,
        category,
        message: message.trim()
      }
    }, {
      onSuccess: () => {
        setRating(0)
        setCategory('')
        setMessage('')
      }
    })
  }

  const categories = [
    'Communication',
    'Quality of Work',
    'Timeline',
    'Budget',
    'Project Management',
    'General Satisfaction',
    'Suggestion',
    'Complaint'
  ]

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1
      const isActive = starValue <= (hoveredRating || rating)
      
      return (
        <button
          key={index}
          type="button"
          onClick={() => setRating(starValue)}
          onMouseEnter={() => setHoveredRating(starValue)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`text-2xl transition-colors ${
            isActive ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'
          }`}
        >
          ⭐
        </button>
      )
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Feedback</h3>
      
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          {!projectId && projects && projects.length > 0 && (
            <div>
              <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-2">
                Select Project *
              </label>
              <select
                id="project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={0}>Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Overall Rating *
            </label>
            <div className="flex items-center space-x-1">
              {renderStars()}
              {rating > 0 && (
                <span className="ml-3 text-sm text-gray-600">
                  {rating} out of 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Category *
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please share your thoughts, suggestions, or concerns about this project..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters ({message.length}/10)
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedProjectId || !rating || !category || message.length < 10 || submitFeedback.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>

      {/* Feedback Guidelines */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">💡 Feedback Guidelines</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Be specific about what you liked or what could be improved</li>
          <li>• Include details about timeline, quality, communication, or any other aspects</li>
          <li>• Your feedback helps us improve our services for future projects</li>
          <li>• We typically respond to feedback within 24-48 hours</li>
        </ul>
      </div>
    </div>
  )
}