import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  DocumentIcon,
  TagIcon,
  FolderIcon
} from '@heroicons/react/24/outline'
import { Document, DocumentCategory, DocumentStatus, DocumentTag, DocumentFolder } from '../../types/document'
import { useDocumentTags, useDocumentFolders } from '../../hooks/useDocuments'

interface DocumentFormProps {
  document?: Document
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<Document>) => void
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

const DOCUMENT_STATUSES: DocumentStatus[] = [
  'Active',
  'Archived',
  'Draft'
]

export const DocumentForm: React.FC<DocumentFormProps> = ({
  document,
  isOpen,
  onClose,
  onSave,
  className = ''
}) => {
  const [formData, setFormData] = useState({
    originalName: '',
    description: '',
    category: 'Other' as DocumentCategory,
    status: 'Active' as DocumentStatus,
    folderId: undefined as number | undefined,
    tagIds: [] as number[]
  })

  const { tags, fetchTags } = useDocumentTags()
  const { folders, fetchFolders } = useDocumentFolders()

  useEffect(() => {
    if (isOpen) {
      fetchTags()
      fetchFolders()
    }
  }, [isOpen, fetchTags, fetchFolders])

  useEffect(() => {
    if (document) {
      setFormData({
        originalName: document.originalName,
        description: document.description || '',
        category: document.category,
        status: document.status,
        folderId: document.folderId,
        tagIds: document.tags.map(tag => tag.id)
      })
    } else {
      setFormData({
        originalName: '',
        description: '',
        category: 'Other',
        status: 'Active',
        folderId: undefined,
        tagIds: []
      })
    }
  }, [document])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const updates: Partial<Document> = {
      originalName: formData.originalName,
      description: formData.description,
      category: formData.category,
      status: formData.status,
      folderId: formData.folderId,
      tags: tags.filter(tag => formData.tagIds.includes(tag.id))
    }

    onSave(updates)
    onClose()
  }

  const handleTagToggle = (tagId: number) => {
    setFormData(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId]
    }))
  }

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 ${className}`}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <DocumentIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {document ? 'Edit Document' : 'Document Details'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Document Name
              </label>
              <input
                type="text"
                value={formData.originalName}
                onChange={(e) => handleInputChange('originalName', e.target.value)}
                placeholder="Enter document name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter document description (optional)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value as DocumentCategory)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DOCUMENT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as DocumentStatus)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {DOCUMENT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Folder */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FolderIcon className="w-4 h-4 inline mr-1" />
                Folder
              </label>
              <select
                value={formData.folderId || ''}
                onChange={(e) => handleInputChange('folderId', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Folder</option>
                {folders.map(folder => (
                  <option key={folder.id} value={folder.id}>
                    {folder.path}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
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
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-colors
                        ${formData.tagIds.includes(tag.id)
                          ? 'text-white'
                          : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }
                      `}
                      style={{
                        backgroundColor: formData.tagIds.includes(tag.id) ? tag.color : undefined
                      }}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                {document ? 'Update Document' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}