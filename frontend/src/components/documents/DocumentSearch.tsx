import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  TagIcon,
  UserIcon,
  DocumentIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'
import { DocumentSearchFilters, DocumentCategory, FileType, DocumentStatus } from '../../types/document'
import { useDocumentTags } from '../../hooks/useDocuments'

interface DocumentSearchProps {
  filters: DocumentSearchFilters
  onFiltersChange: (filters: DocumentSearchFilters) => void
  onSearch: () => void
  className?: string
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  'Project Documents',
  'Contracts',
  'Invoices',
  'Quotations',
  'Purchase Orders',
  'Technical Drawings',
  'Permits',
  'Reports',
  'Photos',
  'Other'
]

const FILE_TYPES: FileType[] = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'dwg',
  'zip',
  'rar'
]

const DOCUMENT_STATUSES: DocumentStatus[] = [
  'Active',
  'Archived',
  'Draft'
]

const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'uploadedAt', label: 'Upload Date' },
  { value: 'fileSize', label: 'File Size' },
  { value: 'category', label: 'Category' }
]

export const DocumentSearch: React.FC<DocumentSearchProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  className = ''
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState<DocumentSearchFilters>(filters)
  const { tags, fetchTags } = useDocumentTags()

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleFilterChange = (key: keyof DocumentSearchFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch()
  }

  const clearFilters = () => {
    const clearedFilters: DocumentSearchFilters = {
      sortBy: 'uploadedAt',
      sortOrder: 'desc'
    }
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return !!(
      localFilters.query ||
      localFilters.category ||
      localFilters.fileType ||
      localFilters.status ||
      localFilters.folderId ||
      localFilters.projectId ||
      localFilters.uploadedBy ||
      localFilters.dateFrom ||
      localFilters.dateTo ||
      (localFilters.tags && localFilters.tags.length > 0)
    )
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (localFilters.query) count++
    if (localFilters.category) count++
    if (localFilters.fileType) count++
    if (localFilters.status) count++
    if (localFilters.folderId) count++
    if (localFilters.projectId) count++
    if (localFilters.uploadedBy) count++
    if (localFilters.dateFrom) count++
    if (localFilters.dateTo) count++
    if (localFilters.tags && localFilters.tags.length > 0) count++
    return count
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            value={localFilters.query || ''}
            onChange={(e) => handleFilterChange('query', e.target.value)}
            className="w-full pl-10 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`
                p-1.5 rounded-md transition-colors relative
                ${showAdvancedFilters || hasActiveFilters()
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              title="Advanced filters"
            >
              <FunnelIcon className="w-4 h-4" />
              {getActiveFilterCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
                <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                Advanced Filters
              </h3>
              {hasActiveFilters() && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Categories</option>
                  {DOCUMENT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* File Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  File Type
                </label>
                <select
                  value={localFilters.fileType || ''}
                  onChange={(e) => handleFilterChange('fileType', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Types</option>
                  {FILE_TYPES.map(type => (
                    <option key={type} value={type}>{type.toUpperCase()}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">All Statuses</option>
                  {DOCUMENT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  From Date
                </label>
                <input
                  type="date"
                  value={localFilters.dateFrom ? localFilters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <CalendarIcon className="w-4 h-4 inline mr-1" />
                  To Date
                </label>
                <input
                  type="date"
                  value={localFilters.dateTo ? localFilters.dateTo.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <div className="flex space-x-2">
                  <select
                    value={localFilters.sortBy || 'uploadedAt'}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {SORT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={localFilters.sortOrder || 'desc'}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="asc">↑ Asc</option>
                    <option value="desc">↓ Desc</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            {tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <TagIcon className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const currentTags = localFilters.tags || []
                        const newTags = currentTags.includes(tag.id)
                          ? currentTags.filter(id => id !== tag.id)
                          : [...currentTags, tag.id]
                        handleFilterChange('tags', newTags.length > 0 ? newTags : undefined)
                      }}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-colors
                        ${(localFilters.tags || []).includes(tag.id)
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                      style={{
                        backgroundColor: (localFilters.tags || []).includes(tag.id) ? tag.color : undefined
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Summary */}
      <AnimatePresence>
        {hasActiveFilters() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-gray-500 dark:text-gray-400">Active filters:</span>
            
            {localFilters.query && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                Search: "{localFilters.query}"
                <button
                  onClick={() => handleFilterChange('query', undefined)}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {localFilters.category && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                Category: {localFilters.category}
                <button
                  onClick={() => handleFilterChange('category', undefined)}
                  className="ml-1 hover:text-green-600 dark:hover:text-green-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {localFilters.fileType && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200">
                Type: {localFilters.fileType.toUpperCase()}
                <button
                  onClick={() => handleFilterChange('fileType', undefined)}
                  className="ml-1 hover:text-purple-600 dark:hover:text-purple-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}

            {(localFilters.tags && localFilters.tags.length > 0) && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200">
                {localFilters.tags.length} tag{localFilters.tags.length > 1 ? 's' : ''}
                <button
                  onClick={() => handleFilterChange('tags', undefined)}
                  className="ml-1 hover:text-yellow-600 dark:hover:text-yellow-300"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}