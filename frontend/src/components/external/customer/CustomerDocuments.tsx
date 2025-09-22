import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useCustomerProjects, useDownloadDocument } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { ProjectDocument } from '../../../types/external'
import { formatters } from '../../../utils/formatters'

export const CustomerDocuments: React.FC = () => {
  const { user } = useAuth()
  const { data: projects, isLoading, error } = useCustomerProjects(user?.id || 0)
  const downloadDocument = useDownloadDocument()
  const [selectedProject, setSelectedProject] = useState<number | 'all'>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Documents</h3>
        <p className="text-red-600 mt-2">Unable to load your documents. Please try again later.</p>
      </div>
    )
  }

  // Collect all documents from all projects
  const allDocuments: (ProjectDocument & { projectName: string })[] = []
  projects?.forEach(project => {
    project.documents.forEach(doc => {
      allDocuments.push({
        ...doc,
        projectName: project.name
      })
    })
  })

  // Filter documents
  const filteredDocuments = allDocuments.filter(doc => {
    const projectMatch = selectedProject === 'all' || doc.projectId === selectedProject
    const categoryMatch = selectedCategory === 'all' || doc.category === selectedCategory
    return projectMatch && categoryMatch
  })

  const categories = ['Contract', 'Drawing', 'Report', 'Invoice', 'Other']

  const handleDownload = (documentId: number) => {
    downloadDocument.mutate(documentId)
  }

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('image')) return '🖼️'
    if (type.includes('dwg') || type.includes('cad')) return '📐'
    if (type.includes('word') || type.includes('doc')) return '📝'
    if (type.includes('excel') || type.includes('sheet')) return '📊'
    return '📎'
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Contract': return 'bg-blue-100 text-blue-800'
      case 'Drawing': return 'bg-green-100 text-green-800'
      case 'Report': return 'bg-yellow-100 text-yellow-800'
      case 'Invoice': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Project Documents</h1>
        <p className="text-gray-600 mt-1">
          Access and download all your project-related documents
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Projects</option>
              {projects?.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map(document => (
              <div key={document.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="text-2xl">
                      {getDocumentIcon(document.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.name}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                          {document.category}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{document.projectName}</span>
                        <span className="mx-2">•</span>
                        <span>{formatters.fileSize(document.size)}</span>
                        <span className="mx-2">•</span>
                        <span>Uploaded {formatters.date(document.uploadedAt)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(document.id)}
                    disabled={downloadDocument.isPending}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {downloadDocument.isPending ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <>
                        <span className="mr-2">📥</span>
                        Download
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
          <p className="text-gray-600 mb-4">
            {selectedProject !== 'all' || selectedCategory !== 'all'
              ? 'No documents match your current filters.'
              : 'No documents have been uploaded to your projects yet.'
            }
          </p>
          {(selectedProject !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedProject('all')
                setSelectedCategory('all')
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Summary */}
      {filteredDocuments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700">
              Showing {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''}
            </span>
            <span className="text-blue-600">
              Total size: {formatters.fileSize(filteredDocuments.reduce((sum, doc) => sum + doc.size, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}