import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DocumentIcon,
  PlusIcon,
  FolderIcon,
  MagnifyingGlassIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { DocumentSearchFilters, DocumentFolder, Document, DocumentUploadOptions } from '../../types/document'
import { useDocuments, useDocumentFolders } from '../../hooks/useDocuments'
import { DocumentList } from '../../components/documents/DocumentList'
import { DocumentSearch } from '../../components/documents/DocumentSearch'
import { FolderTree } from '../../components/documents/FolderTree'
import { FileUpload } from '../../components/documents/FileUpload'
import { DocumentForm } from '../../components/documents/DocumentForm'

type ViewMode = 'list' | 'grid' | 'table'

interface FolderFormProps {
  folder?: DocumentFolder
  parentId?: number
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, parentId?: number) => void
}

const FolderForm: React.FC<FolderFormProps> = ({
  folder,
  parentId,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(folder?.name || '')

  useEffect(() => {
    setName(folder?.name || '')
  }, [folder])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), folder ? folder.parentId : parentId)
      setName('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
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
            {folder ? 'Edit Folder' : 'Create Folder'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Folder Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              {folder ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export const DocumentsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showUpload, setShowUpload] = useState(false)
  const [showFolderForm, setShowFolderForm] = useState(false)
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | undefined>()
  const [folderFormParentId, setFolderFormParentId] = useState<number | undefined>()
  const [selectedFolder, setSelectedFolder] = useState<DocumentFolder | null>(null)
  const [editingDocument, setEditingDocument] = useState<Document | undefined>()
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [searchFilters, setSearchFilters] = useState<DocumentSearchFilters>({
    sortBy: 'uploadedAt',
    sortOrder: 'desc'
  })

  const { fetchDocuments, updateDocument } = useDocuments()
  const { createFolder, updateFolder, deleteFolder } = useDocumentFolders()

  const handleSearch = () => {
    fetchDocuments(searchFilters)
  }

  const handleFiltersChange = (filters: DocumentSearchFilters) => {
    setSearchFilters(filters)
  }

  const handleFolderSelect = (folder: DocumentFolder | null) => {
    setSelectedFolder(folder)
    setSearchFilters(prev => ({
      ...prev,
      folderId: folder?.id
    }))
  }

  const handleFolderCreate = (parentId?: number) => {
    setEditingFolder(undefined)
    setFolderFormParentId(parentId)
    setShowFolderForm(true)
  }

  const handleFolderEdit = (folder: DocumentFolder) => {
    setEditingFolder(folder)
    setFolderFormParentId(undefined)
    setShowFolderForm(true)
  }

  const handleFolderDelete = async (folder: DocumentFolder) => {
    if (window.confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
      try {
        await deleteFolder(folder.id)
        if (selectedFolder?.id === folder.id) {
          setSelectedFolder(null)
          setSearchFilters(prev => ({ ...prev, folderId: undefined }))
        }
      } catch (error) {
        console.error('Failed to delete folder:', error)
      }
    }
  }

  const handleFolderSave = async (name: string, parentId?: number) => {
    try {
      if (editingFolder) {
        await updateFolder(editingFolder.id, { name })
      } else {
        await createFolder(name, parentId)
      }
    } catch (error) {
      console.error('Failed to save folder:', error)
    }
  }

  const handleUploadComplete = (documents: Document[]) => {
    console.log('Upload completed:', documents)
    setShowUpload(false)
    fetchDocuments(searchFilters)
  }

  const handleDocumentEdit = (document: Document) => {
    setEditingDocument(document)
    setShowDocumentForm(true)
  }

  const handleDocumentSave = async (updates: Partial<Document>) => {
    if (editingDocument) {
      try {
        await updateDocument(editingDocument.id, updates)
        fetchDocuments(searchFilters)
      } catch (error) {
        console.error('Failed to update document:', error)
      }
    }
  }

  const uploadOptions: DocumentUploadOptions = {
    category: 'Other',
    folderId: selectedFolder?.id,
    description: 'Uploaded via document management'
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Document Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Organize, search, and manage all your project documents
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="List view"
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Grid view"
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                  title="Table view"
                >
                  <ViewColumnsIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Upload Button */}
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Upload Documents
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <FolderTree
                selectedFolderId={selectedFolder?.id}
                onFolderSelect={handleFolderSelect}
                onFolderCreate={handleFolderCreate}
                onFolderEdit={handleFolderEdit}
                onFolderDelete={handleFolderDelete}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <DocumentSearch
                filters={searchFilters}
                onFiltersChange={handleFiltersChange}
                onSearch={handleSearch}
              />
            </div>

            {/* Current Folder Info */}
            {selectedFolder && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      {selectedFolder.name}
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      ({selectedFolder.documentCount || 0} documents)
                    </span>
                  </div>
                  <button
                    onClick={() => handleFolderSelect(null)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Document List */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Documents
                </h2>
              </div>
              <div className="p-6">
                <DocumentList
                  filters={searchFilters}
                  onDocumentSelect={(document) => console.log('Selected:', document)}
                  onDocumentEdit={handleDocumentEdit}
                  onDocumentDelete={(document) => console.log('Delete:', document)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Upload Documents
                </h3>
                <button
                  onClick={() => setShowUpload(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {selectedFolder && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <FolderIcon className="w-4 h-4 inline mr-1" />
                    Uploading to: <strong>{selectedFolder.name}</strong>
                  </p>
                </div>
              )}

              <FileUpload
                uploadOptions={uploadOptions}
                onUploadComplete={handleUploadComplete}
                multiple={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Folder Form Modal */}
      <AnimatePresence>
        <FolderForm
          folder={editingFolder}
          parentId={folderFormParentId}
          isOpen={showFolderForm}
          onClose={() => setShowFolderForm(false)}
          onSave={handleFolderSave}
        />
      </AnimatePresence>

      {/* Document Form Modal */}
      <DocumentForm
        document={editingDocument}
        isOpen={showDocumentForm}
        onClose={() => {
          setShowDocumentForm(false)
          setEditingDocument(undefined)
        }}
        onSave={handleDocumentSave}
      />
    </div>
  )
}