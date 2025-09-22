import React, { useState, useMemo } from 'react'
import { useTenders } from '../../hooks/useTenders'
import { TenderCard } from './TenderCard'
import { TenderDetails } from './TenderDetails'
import { Tender, TenderStatus } from '../../types/tender'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface TenderArchiveProps {
  className?: string
}

export const TenderArchive: React.FC<TenderArchiveProps> = ({ className = '' }) => {
  const { data: tenders, isLoading, error } = useTenders()
  const [selectedTender, setSelectedTender] = useState<Tender | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TenderStatus | 'All'>('All')
  const [dateFilter, setDateFilter] = useState<'all' | 'last30' | 'last90' | 'lastYear'>('all')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'deadline'>('newest')

  // Filter archived tenders (Closed and Awarded)
  const archivedTenders = useMemo(() => {
    if (!tenders) return []
    
    let filtered = tenders.filter(tender => 
      tender.status === 'Closed' || tender.status === 'Awarded'
    )

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tender =>
        tender.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tender.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(tender => tender.status === statusFilter)
    }

    // Apply date filter
    const now = new Date()
    if (dateFilter !== 'all') {
      const filterDate = new Date()
      switch (dateFilter) {
        case 'last30':
          filterDate.setDate(now.getDate() - 30)
          break
        case 'last90':
          filterDate.setDate(now.getDate() - 90)
          break
        case 'lastYear':
          filterDate.setFullYear(now.getFullYear() - 1)
          break
      }
      filtered = filtered.filter(tender => 
        new Date(tender.closedDate || tender.updatedAt) >= filterDate
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.closedDate || b.updatedAt).getTime() - new Date(a.closedDate || a.updatedAt).getTime()
        case 'oldest':
          return new Date(a.closedDate || a.updatedAt).getTime() - new Date(b.closedDate || b.updatedAt).getTime()
        case 'deadline':
          return new Date(b.submissionDeadline).getTime() - new Date(a.submissionDeadline).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [tenders, searchTerm, statusFilter, dateFilter, sortBy])

  const handleViewTender = (tender: Tender) => {
    setSelectedTender(tender)
  }

  const handleCloseDetails = () => {
    setSelectedTender(null)
  }

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-12 ${className}`}>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">Failed to load tender archive</p>
          <p className="text-sm text-gray-500 mt-1">Please try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {selectedTender ? (
        <TenderDetails
          tender={selectedTender}
          onClose={handleCloseDetails}
          showActions={false}
        />
      ) : (
        <>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tender Archive</h2>
            <p className="text-gray-600">
              Browse historical tender records and their outcomes
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Tenders
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TenderStatus | 'All')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Statuses</option>
                  <option value="Closed">Closed</option>
                  <option value="Awarded">Awarded</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date Range
                </label>
                <select
                  id="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Time</option>
                  <option value="last30">Last 30 Days</option>
                  <option value="last90">Last 90 Days</option>
                  <option value="lastYear">Last Year</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="deadline">By Deadline</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Showing {archivedTenders.length} archived tender{archivedTenders.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          </div>

          {/* Tender Grid */}
          {archivedTenders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg font-medium text-gray-500">No archived tenders found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {searchTerm || statusFilter !== 'All' || dateFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Archived tenders will appear here once tenders are closed or awarded'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {archivedTenders.map((tender) => (
                <TenderCard
                  key={tender.id}
                  tender={tender}
                  onView={handleViewTender}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}