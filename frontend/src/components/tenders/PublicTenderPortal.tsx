import React, { useState } from 'react'
import { usePublicTenders } from '../../hooks/useTenders'
import { TenderCard } from './TenderCard'
import { TenderSubmissionForm } from './TenderSubmissionForm'
import { Tender } from '../../types/tender'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const PublicTenderPortal: React.FC = () => {
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [showSubmissionForm, setShowSubmissionForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  const { data: tenders, isLoading, error } = usePublicTenders()

  const handleViewTender = (tender: Tender) => {
    setSelectedTender(tender)
  }

  const handleSubmitProposal = (tender: Tender) => {
    setSelectedTender(tender)
    setShowSubmissionForm(true)
  }

  const filteredTenders = tenders?.filter(tender => {
    const matchesSearch = !searchQuery || 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Only show published tenders that haven't expired
    const isActive = tender.status === 'Published' && new Date(tender.submissionDeadline) > new Date()
    
    return matchesSearch && isActive
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tenders</h3>
        <p className="text-gray-500">There was an error loading the available tenders. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Available Tenders</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Browse and submit proposals for construction projects from Star Light Constructions
        </p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <input
          type="text"
          placeholder="Search tenders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Tender Grid */}
      {filteredTenders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Tenders</h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'No tenders match your search criteria.' 
              : 'There are currently no active tenders available for submission.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenders.map((tender) => (
            <div key={tender.id} className="relative">
              <TenderCard
                tender={tender}
                onView={handleViewTender}
                showActions={false}
              />
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleViewTender(tender)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleSubmitProposal(tender)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tender Details Modal */}
      {selectedTender && !showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedTender.title}</h2>
                <button
                  onClick={() => setSelectedTender(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Project Description</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedTender.description}</p>
                </div>

                {selectedTender.requirements && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Requirements</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedTender.requirements}</p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">Submission Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">Submission Deadline:</span>
                      <p className="font-medium text-blue-900">
                        {new Date(selectedTender.submissionDeadline).toLocaleDateString()} at{' '}
                        {new Date(selectedTender.submissionDeadline).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700">Days Remaining:</span>
                      <p className="font-medium text-green-600">
                        {Math.ceil(
                          (new Date(selectedTender.submissionDeadline).getTime() - new Date().getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} days
                      </p>
                    </div>
                  </div>
                </div>

                {selectedTender.documents && selectedTender.documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Tender Documents</h3>
                    <div className="space-y-3">
                      {selectedTender.documents.map((doc) => (
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
                                {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
                <button
                  onClick={() => setSelectedTender(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Close
                </button>
                <button
                  onClick={() => handleSubmitProposal(selectedTender)}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Submit Proposal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form Modal */}
      {showSubmissionForm && selectedTender && (
        <TenderSubmissionForm
          tender={selectedTender}
          onClose={() => {
            setShowSubmissionForm(false)
            setSelectedTender(null)
          }}
        />
      )}
    </div>
  )
}