import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentIcon,
  PhotoIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Document } from '../../types/document'

interface DocumentPreviewProps {
  document: Document | null
  isOpen: boolean
  onClose: () => void
  onDownload?: (document: Document) => void
  className?: string
}

interface ImageGalleryProps {
  images: string[]
  currentIndex: number
  onIndexChange: (index: number) => void
  onClose: () => void
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  currentIndex,
  onIndexChange,
  onClose
}) => {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handlePrevious = () => {
    onIndexChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleNext = () => {
    onIndexChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0)
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev * 1.5, 5))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev / 1.5, 0.5))
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        handlePrevious()
        break
      case 'ArrowRight':
        handleNext()
        break
      case 'Escape':
        onClose()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
        handleZoomOut()
        break
    }
  }

  useEffect(() => {
    window.document.addEventListener('keydown', handleKeyDown)
    return () => window.document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  return (
    <div className="relative w-full h-full bg-black flex items-center justify-center">
      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
          >
            <ArrowRightIcon className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={handleZoomOut}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <MagnifyingGlassMinusIcon className="w-5 h-5" />
        </button>
        <button
          onClick={handleZoomIn}
          className="p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <MagnifyingGlassPlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Image */}
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        alt={`Preview ${currentIndex + 1}`}
        className="max-w-full max-h-full object-contain cursor-move"
        style={{
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onDragStart={(e) => e.preventDefault()}
      />
    </div>
  )
}

const PDFViewer: React.FC<{ url: string }> = ({ url }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  return (
    <div className="w-full h-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      {loading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading PDF...</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load PDF</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Open in new tab
          </a>
        </div>
      )}

      <iframe
        src={url}
        className={`w-full h-full border-0 ${loading ? 'hidden' : ''}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false)
          setError(true)
        }}
        title="PDF Preview"
      />
    </div>
  )
}

const UnsupportedPreview: React.FC<{ document: Document }> = ({ document }) => {
  const getFileIcon = (fileType: string) => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif']
    if (imageTypes.includes(fileType.toLowerCase())) {
      return <PhotoIcon className="w-16 h-16 text-gray-400" />
    }
    return <DocumentIcon className="w-16 h-16 text-gray-400" />
  }

  return (
    <div className="w-full h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {getFileIcon(document.fileType)}
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Preview not available
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {document.originalName}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {document.fileType.toUpperCase()} • {Math.round(document.fileSize / 1024)} KB
        </p>
        <a
          href={document.downloadUrl}
          className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
          Download File
        </a>
      </div>
    </div>
  )
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  isOpen,
  onClose,
  onDownload,
  className = ''
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      window.document.addEventListener('keydown', handleEscape)
      window.document.body.style.overflow = 'hidden'
    }

    return () => {
      window.document.removeEventListener('keydown', handleEscape)
      window.document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!document) return null

  const canPreview = () => {
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif']
    return previewableTypes.includes(document.fileType.toLowerCase())
  }

  const isImage = () => {
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif']
    return imageTypes.includes(document.fileType.toLowerCase())
  }

  const isPDF = () => {
    return document.fileType.toLowerCase() === 'pdf'
  }

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document)
    } else {
      // Fallback to direct download
      window.open(document.downloadUrl, '_blank')
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm ${className}`}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="absolute inset-4 bg-white dark:bg-gray-800 rounded-lg shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {document.originalName}
                </h2>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>{document.fileType.toUpperCase()}</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>{document.category}</span>
                  {document.uploadedAt && (
                    <span>
                      Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {document.previewUrl && (
                  <button
                    onClick={() => window.open(document.previewUrl, '_blank')}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Open in new tab"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Download"
                >
                  <ArrowDownTrayIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {canPreview() ? (
                <>
                  {isPDF() && document.previewUrl && (
                    <PDFViewer url={document.previewUrl} />
                  )}

                  {isImage() && document.previewUrl && (
                    <ImageGallery
                      images={[document.previewUrl]}
                      currentIndex={currentImageIndex}
                      onIndexChange={setCurrentImageIndex}
                      onClose={onClose}
                    />
                  )}
                </>
              ) : (
                <UnsupportedPreview document={document} />
              )}
            </div>

            {/* Footer with document info */}
            {document.description && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <strong>Description:</strong> {document.description}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}