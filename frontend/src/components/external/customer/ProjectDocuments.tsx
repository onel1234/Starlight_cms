import React from 'react'
import { ProjectDocument } from '../../../types/external'
import { useDownloadDocument } from '../../../hooks/useExternal'
import { formatDate } from '../../../utils/formatters'

interface ProjectDocumentsProps {
  documents: ProjectDocument[]
}

export const ProjectDocuments: React.FC<ProjectDocumentsProps> = ({ documents }) => {
  const downloadDocument = useDownloadDocument()

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('word') || type.includes('doc')) return '📝'
    if (type.includes('excel') || type.includes('sheet')) return '📊'
    if (type.includes('dwg') || type.includes('cad')) return '📐'
    return '📎'
  }

  const getCategoryColor = (category: ProjectDocument['category']) => {
    switch (category) {
      case 'Contract':
        return 'bg-blue-100 text-blue-800'
      case 'Drawing':
        return 'bg-purple-100 text-purple-800'
      case 'Report':
        return 'bg-green-100 text-green-800'
      case 'Invoice':
        return 'bg-yellow-100 text-yellow-800'
      case 'Other':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleDownload = (documentId: number) => {
    downloadDocument.mutate(documentId)
  }

  const groupedDocuments = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = []
    }
    acc[doc.category].push(doc)
    return acc
  }, {} as Record<string, ProjectDocument[]>)

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Documents</h3>
      
      {documents.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No documents available for this project
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedDocuments).map(([category, categoryDocs]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-md font-medium text-gray-800 flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium mr-3 ${getCategoryColor(category as ProjectDocument['category'])}`}>
                  {category}
                </span>
                <span className="text-sm text-gray-500">({categoryDocs.length} documents)</span>
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                {categoryDocs.map((document) => (
                  <div key={document.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-2xl">{getDocumentIcon(document.type)}</span>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{document.name}</h5>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">{formatFileSize(document.size)}</span>
                            <span className="text-xs text-gray-500">Uploaded {formatDate(document.uploadedAt)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDownload(document.id)}
                        disabled={downloadDocument.isPending}
                        className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {downloadDocument.isPending ? 'Downloading...' : 'Download'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Download Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Document Access</h4>
        <p className="text-sm text-blue-700">
          Click the download button to access project documents. If you have trouble accessing any documents, 
          please contact your project manager for assistance.
        </p>
      </div>
    </div>
  )
}