import React from 'react'
import { Tender } from '../../types/tender'
import { formatDate } from '../../utils/formatters'

interface TenderCardProps {
  tender: Tender
  onEdit?: (tender: Tender) => void
  onView: (tender: Tender) => void
  onPublish?: (id: number) => void
  onClose?: (id: number) => void
  showActions?: boolean
}

export const TenderCard: React.FC<TenderCardProps> = ({
  tender,
  onEdit,
  onView,
  onPublish,
  onClose,
  showActions = true
}) => {
  const getStatusColor = (status: Tender['status']) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800'
      case 'Published':
        return 'bg-green-100 text-green-800'
      case 'Closed':
        return 'bg-red-100 text-red-800'
      case 'Awarded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const isExpired = new Date(tender.submissionDeadline) < new Date()
  const daysUntilDeadline = Math.ceil(
    (new Date(tender.submissionDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{tender.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
              {tender.status}
            </span>
          </div>
          {showActions && (
            <div className="flex space-x-2 ml-4">
              <button
                onClick={() => onView(tender)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View Details"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              {onEdit && tender.status === 'Draft' && (
                <button
                  onClick={() => onEdit(tender)}
                  className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                  title="Edit Tender"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{tender.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Submission Deadline:</span>
            <span className={`font-medium ${isExpired ? 'text-red-600' : daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-gray-900'}`}>
              {formatDate(tender.submissionDeadline)}
            </span>
          </div>
          
          {tender.status === 'Published' && !isExpired && (
            <div className="flex justify-between">
              <span className="text-gray-500">Days Remaining:</span>
              <span className={`font-medium ${daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                {daysUntilDeadline} days
              </span>
            </div>
          )}

          {tender.submissions && tender.submissions.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-500">Submissions:</span>
              <span className="font-medium text-blue-600">{tender.submissions.length}</span>
            </div>
          )}

          {tender.publishedDate && (
            <div className="flex justify-between">
              <span className="text-gray-500">Published:</span>
              <span className="text-gray-900">{formatDate(tender.publishedDate)}</span>
            </div>
          )}
        </div>

        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {tender.status === 'Draft' && onPublish && (
                <button
                  onClick={() => onPublish(tender.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Publish
                </button>
              )}
              
              {tender.status === 'Published' && onClose && (
                <button
                  onClick={() => onClose(tender.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close
                </button>
              )}
              
              <button
                onClick={() => onView(tender)}
                className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Details
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}