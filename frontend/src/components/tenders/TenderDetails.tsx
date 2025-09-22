import React, { useState } from 'react'
import { Tender } from '../../types/tender'
import { useTenderSubmissions } from '../../hooks/useTenders'
import { formatDate, formatCurrency } from '../../utils/formatters'
import { DocumentUpload } from './DocumentUpload'
import { SubmissionsList } from './SubmissionsList'

interface TenderDetailsProps {
  tender: Tender
  onClose: () => void
  onEdit?: (tender: Tender) => void
  onPublish?: (id: number) => void
  onCloseTender?: (id: number) => void
  onDelete?: (id: number) => void
  showActions?: boolean
}

export const TenderDetails: React.FC<TenderDetailsProps> = ({
  tender,
  onClose,
  onEdit,
  onPublish,
  onCloseTender,
  onDelete,
  showActions = true
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'documents' | 'submissions'>('details')
  const { data: submissions, isLoading: submissionsLoading } = useTenderSubmissions(tender.id)

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

  const tabs = [
    { id: 'details', label: 'Details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'documents', label: 'Documents', icon: 'M9 2a1 1 0 000 2h2a1 1 0 100-2H9z M4 5a2 2 0 012-2v0a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z' },
    { id: 'submissions', label: `Submissions (${submissions?.length || 0})`, icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">{tender.title}</h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tender.status)}`}>
                  {tender.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>Created: {formatDate(tender.createdAt)}</span>
                {tender.publishedDate && (
                  <span>Published: {formatDate(tender.publishedDate)}</span>
                )}
                <span className={`font-medium ${isExpired ? 'text-red-600' : daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                  Deadline: {formatDate(tender.submissionDeadline)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {showActions && tender.status === 'Draft' && onEdit && onPublish && (
                <>
                  <button
                    onClick={() => onEdit(tender)}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onPublish(tender.id)}
                    className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Publish
                  </button>
                </>
              )}
              {showActions && tender.status === 'Published' && onCloseTender && (
                <button
                  onClick={() => onCloseTender(tender.id)}
                  className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Close Tender
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{tender.description}</p>
              </div>

              {tender.requirements && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Technical Requirements</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{tender.requirements}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Submission Deadline:</span>
                      <span className="font-medium text-blue-900">{formatDate(tender.submissionDeadline)}</span>
                    </div>
                    {!isExpired && tender.status === 'Published' && (
                      <div className="flex justify-between">
                        <span className="text-blue-700">Days Remaining:</span>
                        <span className={`font-medium ${daysUntilDeadline <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                          {daysUntilDeadline} days
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Submission Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Total Submissions:</span>
                      <span className="font-medium text-green-900">{submissions?.length || 0}</span>
                    </div>
                    {submissions && submissions.length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-green-700">Under Review:</span>
                        <span className="font-medium text-green-900">
                          {submissions.filter(s => s.status === 'Under Review').length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Tender Documents</h3>
                {showActions && tender.status === 'Draft' && (
                  <DocumentUpload tenderId={tender.id} />
                )}
              </div>

              {tender.documents && tender.documents.length > 0 ? (
                <div className="space-y-3">
                  {tender.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-sm text-gray-500">
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • Uploaded {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <button className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Documents</h4>
                  <p className="text-gray-500">No documents have been uploaded for this tender yet.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <SubmissionsList 
              tenderId={tender.id} 
              submissions={submissions || []} 
              isLoading={submissionsLoading}
            />
          )}
        </div>
      </div>
    </div>
  )
}