import React, { useState, useRef } from 'react'
import { useUploadTenderDocument } from '../../hooks/useTenders'

interface DocumentUploadProps {
  tenderId: number
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ tenderId }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadDocument = useUploadTenderDocument()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif'
    ]

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid file type (PDF, Word, Excel, or Image)')
      return
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    uploadFile(file)
  }

  const uploadFile = async (file: File) => {
    setUploadProgress(0)
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null) return 0
          if (prev >= 90) return prev
          return prev + Math.random() * 20
        })
      }, 200)

      await uploadDocument.mutateAsync({ tenderId, file })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      setTimeout(() => {
        setUploadProgress(null)
      }, 1000)
    } catch (error) {
      setUploadProgress(null)
      console.error('Upload failed:', error)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
        
        {uploadProgress !== null ? (
          <div className="space-y-3">
            <div className="text-blue-600">
              <svg className="w-8 h-8 mx-auto animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{Math.round(uploadProgress)}% complete</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-gray-400">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, Word, Excel, or Image files up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="text-xs text-gray-500">
        <p className="font-medium mb-1">Supported file types:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>PDF documents (.pdf)</li>
          <li>Microsoft Word (.doc, .docx)</li>
          <li>Microsoft Excel (.xls, .xlsx)</li>
          <li>Images (.jpg, .jpeg, .png, .gif)</li>
        </ul>
      </div>
    </div>
  )
}