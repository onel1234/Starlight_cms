import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DocumentIcon,
  FolderIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { DocumentSearchFilters, DocumentUploadOptions } from '../../types/document'
import { FileUpload } from './FileUpload'
import { DocumentSearch } from './DocumentSearch'
import { DocumentList } from './DocumentList'
import { FolderTree } from './FolderTree'

export const DocumentManagementDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'search' | 'list' | 'folders'>('upload')
  const [searchFilters, setSearchFilters] = useState<DocumentSearchFilters>({
    sortBy: 'uploadedAt',
    sortOrder: 'desc'
  })

  const uploadOptions: DocumentUploadOptions = {
    category: 'Project Documents',
    description: 'Demo upload'
  }

  const handleUploadComplete = (documents: any[]) => {
    console.log('Demo upload completed:', documents)
  }

  const handleSearch = () => {
    console.log('Demo search with filters:', searchFilters)
  }

  const tabs = [
    { id: 'upload', name: 'File Upload', icon: CloudArrowUpIcon },
    { id: 'search', name: 'Search & Filter', icon: MagnifyingGlassIcon },
    { id: 'list', name: 'Document List', icon: DocumentIcon },
    { id: 'folders', name: 'Folder Tree', icon: FolderIcon }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Document Management System Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive file upload and document management with drag-drop, search, preview, and version control
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <CloudArrowUpIcon className="w-8 h-8 text-blue-500 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Drag & Drop Upload</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Upload multiple files with progress tracking</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <MagnifyingGlassIcon className="w-8 h-8 text-green-500 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Advanced Search</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Filter by category, type, tags, and dates</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <EyeIcon className="w-8 h-8 text-purple-500 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Document Preview</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">PDF viewer and image gallery</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <ClockIcon className="w-8 h-8 text-orange-500 mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Version Control</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Track document versions and changes</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {activeTab === 'upload' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              File Upload Component
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Drag and drop files or click to browse. Supports multiple file types with validation and progress tracking.
            </p>
            <FileUpload
              uploadOptions={uploadOptions}
              onUploadComplete={handleUploadComplete}
              multiple={true}
            />
          </motion.div>
        )}

        {activeTab === 'search' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Document Search & Filtering
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Advanced search with filters for category, file type, status, dates, and tags.
            </p>
            <DocumentSearch
              filters={searchFilters}
              onFiltersChange={setSearchFilters}
              onSearch={handleSearch}
            />
          </motion.div>
        )}

        {activeTab === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Document List with Actions
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Interactive document cards with preview, download, edit, and version management.
            </p>
            <DocumentList
              filters={searchFilters}
              onDocumentSelect={(doc) => console.log('Selected:', doc)}
              onDocumentEdit={(doc) => console.log('Edit:', doc)}
              onDocumentDelete={(doc) => console.log('Delete:', doc)}
            />
          </motion.div>
        )}

        {activeTab === 'folders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Folder Tree Navigation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Hierarchical folder structure with create, edit, and delete operations.
            </p>
            <div className="max-w-md">
              <FolderTree
                onFolderSelect={(folder) => console.log('Selected folder:', folder)}
                onFolderCreate={(parentId) => console.log('Create folder with parent:', parentId)}
                onFolderEdit={(folder) => console.log('Edit folder:', folder)}
                onFolderDelete={(folder) => console.log('Delete folder:', folder)}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Implementation Notes */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
          Implementation Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">File Upload:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Drag & drop functionality</li>
              <li>Multiple file selection</li>
              <li>File type validation</li>
              <li>Size limit enforcement</li>
              <li>Upload progress tracking</li>
              <li>Error handling & display</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Document Management:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Folder organization</li>
              <li>Document categorization</li>
              <li>Tag-based labeling</li>
              <li>Advanced search & filtering</li>
              <li>Document preview (PDF/Images)</li>
              <li>Version control & history</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}