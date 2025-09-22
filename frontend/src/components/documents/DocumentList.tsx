import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  TagIcon,
  FolderIcon,
  UserIcon,
  PhotoIcon,
  DocumentTextIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline'
import { Document, DocumentSearchFilters } from '../../types/document'
import { useDocuments } from '../../hooks/useDocuments'
import { DocumentPreview } from './DocumentPreview'
import { DocumentVersions } from './DocumentVersions'

interface DocumentListProps {
  filters?: DocumentSearchFilters
  onDocumentSelect?: (document: Document) => void
  onDocumentEdit?: (document: Document) => void
  onDocumentDelete?: (document: Document) => void
  className?: string
}

interface DocumentCardProps {
  document: Document
  onPreview: (document: Document) => void
  onDownload: (document: Document) => void
  onEdit: (document: Document) => void
  onDelete: (document: Document) => void
  onVersions: (document: Document) => void
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onPreview,
  onDownload,
  onEdit,
  onDelete,
  onVersions
}) => {
  const [showActions, setShowActions] = useState(false)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  const getFileIcon = (fileType: string) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif']
    const documentTypes = ['pdf', 'doc', 'docx']
    
    if (imageTypes.includes(fileType.toLowerCase())) {
      return <PhotoIcon className="w-8 h-8 text-blue-500" />
    } else if (documentTypes.includes(fileType.toLowerCase())) {
      return <DocumentTextIcon className="w-8 h-8 text-red-500" />
    } else if (fileType.toLowerCase() === 'zip' || fileType.toLowerCase() === 'rar') {
      return <ArchiveBoxIcon className="w-8 h-8 text-yellow-500" />
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
      case 'Archived':
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
      case 'Draft':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
    }
  }

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="flex items-start space-x-4">
        {/* File Icon */}
        <div className="flex-shrink-0">
          {document.thumbnailUrl ? (
            <img
              src={document.thumbnailUrl}
              alt={document.originalName}
              className="w-12 h-12 object-cover rounded border"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded border">
              {getFileIcon(document.fileType)}
            </div>
          )}
        </div>

        {/* Document Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {document.originalName}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {document.fileType.toUpperCase()} • {formatFileSize(document.fileSize)}
              </p>
            </div>

            {/* Status Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
              {document.status}
            </span>
          </div>

          {/* Description */}
          {document.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {document.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <UserIcon className="w-3 h-3 mr-1" />
              User {document.uploadedBy}
            </span>
            <span className="flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              {formatDate(document.uploadedAt)}
            </span>
            <span className="flex items-center">
              <FolderIcon className="w-3 h-3 mr-1" />
              {document.category}
            </span>
            {document.versions.length > 1 && (
              <span className="flex items-center">
                v{document.currentVersion.version} ({document.versions.length} versions)
              </span>
            )}
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {document.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag.name}
                </span>
              ))}
              {document.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{document.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPreview(document)
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Preview"
              >
                <EyeIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDownload(document)
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Download"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>

              {document.versions.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onVersions(document)
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  title="View versions"
                >
                  <ClockIcon className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(document)
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(document)
                }}
                className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export const DocumentList: React.FC<DocumentListProps> = ({
  filters,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentDelete,
  className = ''
}) => {
  const { documents, loading, error, fetchDocuments, deleteDocument } = useDocuments()
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [versionsDocument, setVersionsDocument] = useState<Document | null>(null)

  useEffect(() => {
    fetchDocuments(filters)
  }, [fetchDocuments, filters])

  const handlePreview = (document: Document) => {
    setPreviewDocument(document)
  }

  const handleDownload = (document: Document) => {
    window.open(document.downloadUrl, '_blank')
  }

  const handleEdit = (document: Document) => {
    onDocumentEdit?.(document)
  }

  const handleDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete "${document.originalName}"?`)) {
      try {
        await deleteDocument(document.id)
        onDocumentDelete?.(document)
      } catch (error) {
        console.error('Failed to delete document:', error)
      }
    }
  }

  const handleVersions = (document: Document) => {
    setVersionsDocument(document)
  }

  const handleDocumentClick = (document: Document) => {
    onDocumentSelect?.(document)
  }

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <DocumentIcon className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-red-600 dark:text-red-400 mb-2">Error loading documents</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
        <button
          onClick={() => fetchDocuments(filters)}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <DocumentIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">No documents found</p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          {filters && Object.keys(filters).length > 0 
            ? 'Try adjusting your search filters'
            : 'Upload your first document to get started'
          }
        </p>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <AnimatePresence>
        {documents.map((document) => (
          <motion.div
            key={document.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => handleDocumentClick(document)}
          >
            <DocumentCard
              document={document}
              onPreview={handlePreview}
              onDownload={handleDownload}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVersions={handleVersions}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Document Preview Modal */}
      <DocumentPreview
        document={previewDocument}
        isOpen={!!previewDocument}
        onClose={() => setPreviewDocument(null)}
        onDownload={handleDownload}
      />

      {/* Document Versions Modal */}
      <DocumentVersions
        document={versionsDocument!}
        isOpen={!!versionsDocument}
        onClose={() => setVersionsDocument(null)}
      />
    </div>
  )
}
