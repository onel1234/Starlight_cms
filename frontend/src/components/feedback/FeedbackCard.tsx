import React from 'react'
import { Feedback } from '../../types/feedback'
import { formatDate } from '../../utils/formatters'

interface FeedbackCardProps {
  feedback: Feedback
  onView: (feedback: Feedback) => void
  onRespond?: (feedback: Feedback) => void
  showActions?: boolean
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  onView,
  onRespond,
  showActions = true
}) => {
  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'Resolved':
        return 'bg-green-100 text-green-800'
      case 'Closed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Feedback['priority']) => {
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

  const getCategoryIcon = (category: Feedback['category']) => {
    switch (category) {
      case 'Service Quality':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      case 'Communication':
        return 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
      case 'Timeline':
        return 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
      case 'Budget':
        return 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
      case 'General':
        return 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
      default:
        return 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z'
    }
  }

  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}/5</span>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getCategoryIcon(feedback.category)} />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{feedback.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{feedback.category}</span>
                <span className="text-gray-300">•</span>
                <span className={`text-sm font-medium ${getPriorityColor(feedback.priority)}`}>
                  {feedback.priority} Priority
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
              {feedback.status}
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{feedback.description}</p>

        <div className="space-y-3">
          {feedback.rating && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Rating:</span>
              {renderStars(feedback.rating)}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Submitted:</span>
            <span className="text-gray-900">{formatDate(feedback.createdAt)}</span>
          </div>

          {feedback.project && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Project:</span>
              <span className="text-blue-600 font-medium">{feedback.project.name}</span>
            </div>
          )}

          {feedback.respondedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Responded:</span>
              <span className="text-green-600">{formatDate(feedback.respondedAt)}</span>
            </div>
          )}
        </div>

        {feedback.responseText && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-1">Response:</h4>
            <p className="text-sm text-blue-800 line-clamp-2">{feedback.responseText}</p>
          </div>
        )}

        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <button
                onClick={() => onView(feedback)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Details
              </button>
              {onRespond && feedback.status === 'Open' && (
                <button
                  onClick={() => onRespond(feedback)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Respond
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}