import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClockIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PlusIcon,
  UserIcon,
  DocumentIcon,
  CheckCircleIcon,
  XMarkIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { Document, DocumentVersion, DocumentUploadProgress } from '../../types/document'
import { useDocumentVersions } from '../../hooks/useDocuments'
import { FileUpload } from './FileUpload'

interface DocumentVersionsProps {
  document: Document
  isOpen: boolean
  onClose: () => void
  onVersionSelect?: (version: DocumentVersion) => void
  className?: string
}

interface VersionItemProps {
  version: DocumentVersion
  isActive: boolean
  isLatest: boolean
  onSelect: (version: DocumentVersion) => void
  onDownload: (version: DocumentVersion) => void
  onPreview?: (version: DocumentVersion) => void
}

const VersionItem: React.FC<VersionItemProps> = ({
  version,
  isActive,
  isLatest,
  onSelect,
  onDownload,
  onPreview
}) => {
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

  return (
    <motion.div
      className={`
        border rounded-lg p-4 cursor-pointer transition-all
        ${isActive 
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      onClick={() => onSelect(version)}
      whileHover={{ y: -2 }}
      layout
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <DocumentIcon className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">
              Version {version.version}
            </span>
            {isLatest && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Current
              </span>
            )}
            {isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                Active
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 truncate">
            {version.fileName}
          </p>

          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center">
              <UserIcon className="w-3 h-3 mr-1" />
              User {version.uploadedBy}
            </span>
            <span className="flex items-center">
              <ClockIcon className="w-3 h-3 mr-1" />
              {formatDate(version.uploadedAt)}
            </span>
            <span>{formatFileSize(version.fileSize)}</span>
          </div>

          {version.changeLog && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400">
              <strong>Changes:</strong> {version.changeLog}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 ml-4">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreview(version)
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title="Preview"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDownload(version)
            }}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            title="Download"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export const DocumentVersions: React.FC<DocumentVersionsProps> = ({
  document,
  isOpen,
  onClose,
  onVersionSelect,
  className = ''
}) => {
  const { versions, loading, fetchVersions, uploadNewVersion } = useDocumentVersions()
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<DocumentUploadProgress | null>(null)

  useEffect(() => {
    if (isOpen && document) {
      fetchVersions(document.id)
      setSelectedVersionId(document.currentVersion.id)
    }
  }, [isOpen, document, fetchVersions])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUploadForm) {
          setShowUploadForm(false)
        } else {
          onClose()
        }
      }
    }

    if (isOpen) {
      window.document.addEventListener('keydown', handleEscape)
    }

    return () => {
      window.document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, showUploadForm, onClose])

  const handleVersionSelect = (version: DocumentVersion) => {
    setSelectedVersionId(version.id)
    onVersionSelect?.(version)
  }

  const handleVersionDownload = (version: DocumentVersion) => {
    // In a real app, this would trigger a download
    window.open(`/api/documents/${document.id}/versions/${version.id}/download`, '_blank')
  }

  const handleVersionPreview = (version: DocumentVersion) => {
    // In a real app, this would open a preview
    window.open(`/api/documents/${document.id}/versions/${version.id}/preview`, '_blank')
  }

  const handleNewVersionUpload = async (files: FileList) => {
    if (files.length === 0) return

    const file = files[0]
    const changeLog = prompt('Enter a description of changes (optional):')

    try {
      await uploadNewVersion(
        document.id,
        file,
        changeLog || undefined,
        setUploadProgress
      )
      setShowUploadForm(false)
      setUploadProgress(null)
    } catch (error) {
      console.error('Failed to upload new version:', error)
    }
  }

  const sortedVersions = [...versions].sort((a, b) => {
    // Sort by version number (descending)
    const aVersion = parseFloat(a.version)
    const bVersion = parseFloat(b.version)
    return bVersion - aVersion
  })

  const latestVersion = sortedVersions[0]

  if (!document) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm ${className}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, x: '100%' }}
            animate={{ scale: 1, opacity: 1, x: 0 }}
            exit={{ scale: 0.9, opacity: 0, x: '100%' }}
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                  Document Versions
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                  {document.originalName}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  New Version
                </button>
                
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedVersions.map((version) => (
                    <VersionItem
                      key={version.id}
                      version={version}
                      isActive={version.isActive}
                      isLatest={version.id === latestVersion?.id}
                      onSelect={handleVersionSelect}
                      onDownload={handleVersionDownload}
                      onPreview={handleVersionPreview}
                    />
                  ))}

                  {versions.length === 0 && (
                    <div className="text-center py-12">
                      <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No versions found
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
              {uploadProgress && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                >
                  <div className="flex items-center space-x-3">
                    <CloudArrowUpIcon className="w-5 h-5 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Uploading new version...
                      </p>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <motion.div
                          className="bg-blue-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress.progress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {uploadProgress.progress}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Upload Form Modal */}
          <AnimatePresence>
            {showUploadForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setShowUploadForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Upload New Version
                    </h3>
                    <button
                      onClick={() => setShowUploadForm(false)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select a new file to create version {(parseFloat(latestVersion?.version || '1.0') + 0.1).toFixed(1)}
                    </p>

                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        onChange={(e) => e.target.files && handleNewVersionUpload(e.target.files)}
                        className="hidden"
                        id="version-upload"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip,.dwg"
                      />
                      <label
                        htmlFor="version-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Click to select file
                        </span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}