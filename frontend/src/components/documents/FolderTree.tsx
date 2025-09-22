import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon
} from '@heroicons/react/24/outline'
import { DocumentFolder } from '../../types/document'
import { useDocumentFolders } from '../../hooks/useDocuments'

interface FolderTreeProps {
  selectedFolderId?: number
  onFolderSelect?: (folder: DocumentFolder | null) => void
  onFolderCreate?: (parentId?: number) => void
  onFolderEdit?: (folder: DocumentFolder) => void
  onFolderDelete?: (folder: DocumentFolder) => void
  className?: string
}

interface FolderNodeProps {
  folder: DocumentFolder
  level: number
  isSelected: boolean
  isExpanded: boolean
  onToggle: (folderId: number) => void
  onSelect: (folder: DocumentFolder) => void
  onEdit: (folder: DocumentFolder) => void
  onDelete: (folder: DocumentFolder) => void
  onCreateChild: (parentId: number) => void
  children?: DocumentFolder[]
}

const FolderNode: React.FC<FolderNodeProps> = ({
  folder,
  level,
  isSelected,
  isExpanded,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onCreateChild,
  children = []
}) => {
  const [showActions, setShowActions] = useState(false)
  const hasChildren = children.length > 0

  return (
    <div>
      <motion.div
        className={`
          flex items-center space-x-2 px-2 py-1.5 rounded-lg cursor-pointer group
          ${isSelected 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }
        `}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelect(folder)}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        whileHover={{ x: 2 }}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggle(folder.id)
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-4 h-4" />
            ) : (
              <ChevronRightIcon className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Folder Icon */}
        <div className="flex-shrink-0">
          {isExpanded && hasChildren ? (
            <FolderOpenIcon className="w-5 h-5" />
          ) : (
            <FolderIcon className="w-5 h-5" />
          )}
        </div>

        {/* Folder Name */}
        <span className="flex-1 text-sm font-medium truncate">
          {folder.name}
        </span>

        {/* Document Count */}
        {folder.documentCount !== undefined && folder.documentCount > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {folder.documentCount}
          </span>
        )}

        {/* Action Buttons */}
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
                  onCreateChild(folder.id)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Create subfolder"
              >
                <PlusIcon className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(folder)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title="Edit folder"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(folder)
                }}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                title="Delete folder"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {children.map((child) => (
              <FolderNodeContainer
                key={child.id}
                folder={child}
                level={level + 1}
                isSelected={isSelected}
                onToggle={onToggle}
                onSelect={onSelect}
                onEdit={onEdit}
                onDelete={onDelete}
                onCreateChild={onCreateChild}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FolderNodeContainer: React.FC<Omit<FolderNodeProps, 'isExpanded' | 'children'>> = (props) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set())
  const { folders } = useDocumentFolders()

  const handleToggle = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const children = folders.filter(f => f.parentId === props.folder.id)

  return (
    <FolderNode
      {...props}
      isExpanded={expandedFolders.has(props.folder.id)}
      onToggle={handleToggle}
      children={children}
    />
  )
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  selectedFolderId,
  onFolderSelect,
  onFolderCreate,
  onFolderEdit,
  onFolderDelete,
  className = ''
}) => {
  const { folders, loading, fetchFolders } = useDocumentFolders()
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set([1, 4])) // Expand root folders by default

  useEffect(() => {
    fetchFolders()
  }, [fetchFolders])

  const handleToggle = (folderId: number) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleFolderSelect = (folder: DocumentFolder) => {
    onFolderSelect?.(folder)
  }

  const handleRootSelect = () => {
    onFolderSelect?.(null)
  }

  const handleFolderEdit = (folder: DocumentFolder) => {
    onFolderEdit?.(folder)
  }

  const handleFolderDelete = (folder: DocumentFolder) => {
    onFolderDelete?.(folder)
  }

  const handleCreateChild = (parentId: number) => {
    onFolderCreate?.(parentId)
  }

  const handleCreateRoot = () => {
    onFolderCreate?.()
  }

  // Get root folders (folders without parent)
  const rootFolders = folders.filter(folder => !folder.parentId)

  // Build folder tree
  const buildFolderTree = (parentId?: number): DocumentFolder[] => {
    return folders.filter(folder => folder.parentId === parentId)
  }

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Folders
        </h3>
        <button
          onClick={handleCreateRoot}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          title="Create new folder"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* All Documents */}
      <motion.div
        className={`
          flex items-center space-x-2 px-2 py-1.5 rounded-lg cursor-pointer
          ${!selectedFolderId 
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
          }
        `}
        onClick={handleRootSelect}
        whileHover={{ x: 2 }}
      >
        <DocumentIcon className="w-5 h-5" />
        <span className="text-sm font-medium">All Documents</span>
      </motion.div>

      {/* Folder Tree */}
      <div className="space-y-0.5">
        {rootFolders.map((folder) => {
          const children = buildFolderTree(folder.id)
          return (
            <FolderNode
              key={folder.id}
              folder={folder}
              level={0}
              isSelected={selectedFolderId === folder.id}
              isExpanded={expandedFolders.has(folder.id)}
              onToggle={handleToggle}
              onSelect={handleFolderSelect}
              onEdit={handleFolderEdit}
              onDelete={handleFolderDelete}
              onCreateChild={handleCreateChild}
              children={children}
            />
          )
        })}
      </div>

      {/* Empty State */}
      {rootFolders.length === 0 && (
        <div className="text-center py-8">
          <FolderIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            No folders yet
          </p>
          <button
            onClick={handleCreateRoot}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Create your first folder
          </button>
        </div>
      )}
    </div>
  )
}