import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CloudArrowUpIcon, 
  DocumentIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { DocumentUploadOptions, DocumentUploadProgress } from '../../types/document'
import { useDocuments } from '../../hooks/useDocuments'

interface FileUploadProps {
  onUploadComplete?: (documents: any[]) => void
  uploadOptions: DocumentUploadOptions
  multiple?: boolean
  acceptedTypes?: string[]
  maxFileSize?: number // in bytes
  className?: string
}

interface FileWithProgress {
  file: File
  progress: DocumentUploadProgress
  id: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  uploadOptions,
  multiple = true,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.zip', '.dwg'],
  maxFileSize = 50 * 1024 * 1024, // 50MB default
  className = ''
}) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [filesWithProgress, setFilesWithProgress] = useState<FileWithProgress[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { uploadDocument } = useDocuments()

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File "${file.name}" is too large. Maximum size is ${Math.round(maxFileSize / (1024 * 1024))}MB`
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type "${fileExtension}" is not supported`
    }

    return null
  }, [maxFileSize, acceptedTypes])

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files)
    const newErrors: string[] = []
    const validFiles: File[] = []

    // Validate files
    fileArray.forEach(file => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(error)
      } else {
        validFiles.push(file)
      }
    })

    setErrors(newErrors)

    if (validFiles.length === 0) return

    // Create file progress objects
    const newFilesWithProgress: FileWithProgress[] = validFiles.map(file => ({
      file,
      progress: {
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      },
      id: `${Date.now()}-${Math.random()}`
    }))

    setFilesWithProgress(prev => [...prev, ...newFilesWithProgress])

    // Upload files
    const uploadedDocuments: any[] = []
    
    for (const fileWithProgress of newFilesWithProgress) {
      try {
        const document = await uploadDocument(
          fileWithProgress.file,
          uploadOptions,
          (progress) => {
            setFilesWithProgress(prev => 
              prev.map(f => 
                f.id === fileWithProgress.id 
                  ? { ...f, progress }
                  : f
              )
            )
          }
        )
        uploadedDocuments.push(document)
      } catch (error) {
        setFilesWithProgress(prev => 
          prev.map(f => 
            f.id === fileWithProgress.id 
              ? { 
                  ...f, 
                  progress: { 
                    ...f.progress, 
                    status: 'error', 
                    error: error instanceof Error ? error.message : 'Upload failed' 
                  }
                }
              : f
          )
        )
      }
    }

    if (uploadedDocuments.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedDocuments)
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setFilesWithProgress(prev => 
        prev.filter(f => f.progress.status === 'uploading' || f.progress.status === 'processing')
      )
    }, 3000)
  }, [uploadDocument, uploadOptions, validateFile, onUploadComplete])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFiles(files)
    }
  }, [handleFiles])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFiles])

  const handleClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const removeFile = useCallback((id: string) => {
    setFilesWithProgress(prev => prev.filter(f => f.id !== id))
  }, [])

  const clearErrors = useCallback(() => {
    setErrors([])
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: DocumentUploadProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      default:
        return (
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        )
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <motion.div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragOver 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />

        <CloudArrowUpIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900 dark:text-white">
            {isDragOver ? 'Drop files here' : 'Upload documents'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Supported formats: {acceptedTypes.join(', ')} • Max size: {Math.round(maxFileSize / (1024 * 1024))}MB
          </p>
        </div>
      </motion.div>

      {/* Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                    Upload Errors
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <button
                onClick={clearErrors}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      <AnimatePresence>
        {filesWithProgress.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Upload Progress
            </h4>
            <div className="space-y-2">
              {filesWithProgress.map((fileWithProgress) => (
                <motion.div
                  key={fileWithProgress.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {fileWithProgress.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(fileWithProgress.file.size)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(fileWithProgress.progress.status)}
                      <button
                        onClick={() => removeFile(fileWithProgress.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(fileWithProgress.progress.status === 'uploading' || fileWithProgress.progress.status === 'processing') && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        className="bg-blue-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${fileWithProgress.progress.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  )}

                  {/* Status Text */}
                  <div className="mt-2 text-xs">
                    {fileWithProgress.progress.status === 'uploading' && (
                      <span className="text-blue-600 dark:text-blue-400">
                        Uploading... {fileWithProgress.progress.progress}%
                      </span>
                    )}
                    {fileWithProgress.progress.status === 'processing' && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Processing...
                      </span>
                    )}
                    {fileWithProgress.progress.status === 'completed' && (
                      <span className="text-green-600 dark:text-green-400">
                        Upload completed
                      </span>
                    )}
                    {fileWithProgress.progress.status === 'error' && (
                      <span className="text-red-600 dark:text-red-400">
                        Error: {fileWithProgress.progress.error}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}