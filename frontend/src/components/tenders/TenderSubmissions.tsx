import React, { useState } from 'react'
import { useTenderSubmissions } from '../../hooks/useTenders'
import { TenderSubmission } from '../../types/tender'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { formatCurrency } from '../../utils/formatters'

export const TenderSubmissions: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: submissions, isLoading, error } = useTenderSubmissions()

  const getStatusColor = (status: TenderSubmission['status']) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800'
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800'
      case 'Accepted':
        return 'bg-green-100 text-green-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredSubmissions = submissions?.filter(submission => {
    const matchesStatus = statusFilter === 'all' || submission.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch = !searchQuery || 
      submission.tender?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Submissions</h3>
        <p className="text-gray-500">There was an error loading your tender submissions. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tender Submissions</h1>
        <p className="text-gray-600">Track the status of your submitted proposals</p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="under review">Under Review</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Found</h3>
          <p className="text-gray-500">
            {searchQuery || statusFilter !== 'all' 
              ? 'No submissions match your current filters.' 
              : 'You haven\'t submitted any tender proposals yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {submission.tender?.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Submitted: {new Date(submission.submissionDate).toLocaleDateString()}</span>
                    <span>Amount: {formatCurrency(submission.proposedAmount)}</span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                  {submission.status}
                </span>
              </div>

              {submission.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Proposal Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    {submission.notes}
                  </p>
                </div>
              )}

              {submission.evaluationScore && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Evaluation</h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-700">Score:</span>
                      <span className="text-sm font-medium text-blue-900">{submission.evaluationScore}/100</span>
                    </div>
                    {submission.evaluationNotes && (
                      <p className="text-sm text-blue-700">{submission.evaluationNotes}</p>
                    )}
                  </div>
                </div>
              )}

              {submission.documents && submission.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Submitted Documents</h4>
                  <div className="space-y-2">
                    {submission.documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-1 bg-blue-100 rounded">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                            <p className="text-xs text-gray-500">
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}