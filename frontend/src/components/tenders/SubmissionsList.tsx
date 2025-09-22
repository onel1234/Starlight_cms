import React, { useState } from 'react'
import { TenderSubmission } from '../../types/tender'
import { useUpdateSubmissionStatus } from '../../hooks/useTenders'
import { formatDate, formatCurrency } from '../../utils/formatters'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface SubmissionsListProps {
  tenderId: number
  submissions: TenderSubmission[]
  isLoading: boolean
}

export const SubmissionsList: React.FC<SubmissionsListProps> = ({
  tenderId,
  submissions,
  isLoading
}) => {
  const [evaluatingSubmission, setEvaluatingSubmission] = useState<number | null>(null)
  const [evaluationData, setEvaluationData] = useState({
    score: '',
    notes: '',
    status: 'Under Review'
  })
  
  const updateSubmissionStatus = useUpdateSubmissionStatus()

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

  const handleEvaluateSubmission = (submission: TenderSubmission) => {
    setEvaluatingSubmission(submission.id)
    setEvaluationData({
      score: submission.evaluationScore?.toString() || '',
      notes: submission.evaluationNotes || '',
      status: submission.status
    })
  }

  const handleSaveEvaluation = async () => {
    if (!evaluatingSubmission) return

    try {
      await updateSubmissionStatus.mutateAsync({
        id: evaluatingSubmission,
        status: evaluationData.status,
        evaluationScore: evaluationData.score ? parseInt(evaluationData.score) : undefined,
        evaluationNotes: evaluationData.notes
      })
      setEvaluatingSubmission(null)
    } catch (error) {
      console.error('Failed to update submission:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">No Submissions</h4>
        <p className="text-gray-500">No submissions have been received for this tender yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Tender Submissions</h3>
        <div className="text-sm text-gray-500">
          {submissions.length} submission{submissions.length !== 1 ? 's' : ''} received
        </div>
      </div>

      <div className="space-y-4">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-lg font-medium text-gray-900">
                    Supplier #{submission.supplierId}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Proposed Amount:</span>
                    <p className="font-medium text-green-600">{formatCurrency(submission.proposedAmount)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Submitted:</span>
                    <p className="font-medium">{formatDate(submission.submissionDate)}</p>
                  </div>
                  {submission.evaluationScore && (
                    <div>
                      <span className="text-gray-500">Score:</span>
                      <p className="font-medium text-blue-600">{submission.evaluationScore}/100</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEvaluateSubmission(submission)}
                  className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Evaluate
                </button>
              </div>
            </div>

            {submission.notes && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Supplier Notes:</h5>
                <p className="text-gray-700 text-sm bg-gray-50 rounded-lg p-3">{submission.notes}</p>
              </div>
            )}

            {submission.evaluationNotes && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Evaluation Notes:</h5>
                <p className="text-gray-700 text-sm bg-blue-50 rounded-lg p-3">{submission.evaluationNotes}</p>
              </div>
            )}

            {submission.documents && submission.documents.length > 0 && (
              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Submitted Documents:</h5>
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
                      <button className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100">
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

      {/* Evaluation Modal */}
      {evaluatingSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluate Submission</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={evaluationData.status}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Submitted">Submitted</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Score (0-100)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evaluationData.score}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, score: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter evaluation score"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Evaluation Notes
                  </label>
                  <textarea
                    rows={4}
                    value={evaluationData.notes}
                    onChange={(e) => setEvaluationData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter evaluation comments..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEvaluatingSubmission(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEvaluation}
                  disabled={updateSubmissionStatus.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateSubmissionStatus.isPending ? 'Saving...' : 'Save Evaluation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}