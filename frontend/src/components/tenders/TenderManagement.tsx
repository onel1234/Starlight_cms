import React, { useState } from 'react'
import { useTenders, usePublishTender, useCloseTender, useDeleteTender } from '../../hooks/useTenders'
import { TenderCard } from './TenderCard'
import { TenderForm } from './TenderForm'
import { TenderDetails } from './TenderDetails'
import { Tender } from '../../types/tender'
import { LoadingSpinner } from '../ui/LoadingSpinner'

export const TenderManagement: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingTender, setEditingTender] = useState<Tender | undefined>()
  const [viewingTender, setViewingTender] = useState<Tender | undefined>()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const { data: tenders, isLoading, error } = useTenders()
  const publishTender = usePublishTender()
  const closeTender = useCloseTender()
  const deleteTender = useDeleteTender()

  const handleCreateTender = () => {
    setEditingTender(undefined)
    setShowForm(true)
  }

  const handleEditTender = (tender: Tender) => {
    setEditingTender(tender)
    setShowForm(true)
  }

  const handleViewTender = (tender: Tender) => {
    setViewingTender(tender)
  }

  const handlePublishTender = async (id: number) => {
    if (window.confirm('Are you sure you want to publish this tender? Once published, it will be visible to all suppliers.')) {
      await publishTender.mutateAsync(id)
    }
  }

  const handleCloseTender = async (id: number) => {
    if (window.confirm('Are you sure you want to close this tender? This action cannot be undone.')) {
      await closeTender.mutateAsync({ id })
    }
  }

  const handleDeleteTender = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this tender? This action cannot be undone.')) {
      await deleteTender.mutateAsync(id)
    }
  }

  const filteredTenders = tenders?.filter(tender => {
    const matchesStatus = statusFilter === 'all' || tender.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch = !searchQuery || 
      tender.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tender.description.toLowerCase().includes(searchQuery.toLowerCase())
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
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Tenders</h3>
        <p className="text-gray-500">There was an error loading the tenders. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tender Management</h1>
          <p className="text-gray-600">Create and manage construction project tenders</p>
        </div>
        <button
          onClick={handleCreateTender}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Create New Tender
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search tenders..."
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
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tender Grid */}
      {filteredTenders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tenders Found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || statusFilter !== 'all' 
              ? 'No tenders match your current filters.' 
              : 'Get started by creating your first tender.'
            }
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              onClick={handleCreateTender}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create First Tender
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenders.map((tender) => (
            <TenderCard
              key={tender.id}
              tender={tender}
              onEdit={handleEditTender}
              onView={handleViewTender}
              onPublish={handlePublishTender}
              onClose={handleCloseTender}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <TenderForm
          tender={editingTender}
          onClose={() => {
            setShowForm(false)
            setEditingTender(undefined)
          }}
        />
      )}

      {viewingTender && (
        <TenderDetails
          tender={viewingTender}
          onClose={() => setViewingTender(undefined)}
          onEdit={handleEditTender}
          onPublish={handlePublishTender}
          onClose={handleCloseTender}
          onDelete={handleDeleteTender}
        />
      )}
    </div>
  )
}