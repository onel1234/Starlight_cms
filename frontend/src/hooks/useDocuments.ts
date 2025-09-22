import { useState, useCallback } from 'react'
import { 
  Document, 
  DocumentFolder, 
  DocumentTag, 
  DocumentSearchFilters, 
  DocumentUploadOptions,
  DocumentUploadProgress,
  DocumentVersion
} from '../types/document'
import { documentService } from '../services/mockDocumentService'

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async (filters?: DocumentSearchFilters) => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentService.getDocuments(filters)
      setDocuments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents')
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadDocument = useCallback(async (
    file: File, 
    options: DocumentUploadOptions,
    onProgress?: (progress: DocumentUploadProgress) => void
  ) => {
    setError(null)
    try {
      const newDocument = await documentService.uploadDocument(file, options, onProgress)
      setDocuments(prev => [newDocument, ...prev])
      return newDocument
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document')
      throw err
    }
  }, [])

  const updateDocument = useCallback(async (id: number, updates: Partial<Document>) => {
    setError(null)
    try {
      const updatedDocument = await documentService.updateDocument(id, updates)
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDocument : doc))
      return updatedDocument
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update document')
      throw err
    }
  }, [])

  const deleteDocument = useCallback(async (id: number) => {
    setError(null)
    try {
      await documentService.deleteDocument(id)
      setDocuments(prev => prev.filter(doc => doc.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document')
      throw err
    }
  }, [])

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    updateDocument,
    deleteDocument
  }
}

export const useDocumentFolders = () => {
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFolders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentService.getFolders()
      setFolders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders')
    } finally {
      setLoading(false)
    }
  }, [])

  const createFolder = useCallback(async (name: string, parentId?: number) => {
    setError(null)
    try {
      const newFolder = await documentService.createFolder(name, parentId)
      setFolders(prev => [...prev, newFolder])
      return newFolder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
      throw err
    }
  }, [])

  const updateFolder = useCallback(async (id: number, updates: Partial<DocumentFolder>) => {
    setError(null)
    try {
      const updatedFolder = await documentService.updateFolder(id, updates)
      setFolders(prev => prev.map(folder => folder.id === id ? updatedFolder : folder))
      return updatedFolder
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update folder')
      throw err
    }
  }, [])

  const deleteFolder = useCallback(async (id: number) => {
    setError(null)
    try {
      await documentService.deleteFolder(id)
      setFolders(prev => prev.filter(folder => folder.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder')
      throw err
    }
  }, [])

  return {
    folders,
    loading,
    error,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder
  }
}

export const useDocumentTags = () => {
  const [tags, setTags] = useState<DocumentTag[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchTags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentService.getTags()
      setTags(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tags')
    } finally {
      setLoading(false)
    }
  }, [])

  const createTag = useCallback(async (name: string, color: string) => {
    setError(null)
    try {
      const newTag = await documentService.createTag(name, color)
      setTags(prev => [...prev, newTag])
      return newTag
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tag')
      throw err
    }
  }, [])

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag
  }
}

export const useDocumentVersions = () => {
  const [versions, setVersions] = useState<DocumentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchVersions = useCallback(async (documentId: number) => {
    setLoading(true)
    setError(null)
    try {
      const data = await documentService.getDocumentVersions(documentId)
      setVersions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch versions')
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadNewVersion = useCallback(async (
    documentId: number, 
    file: File, 
    changeLog?: string,
    onProgress?: (progress: DocumentUploadProgress) => void
  ) => {
    setError(null)
    try {
      const newVersion = await documentService.uploadNewVersion(documentId, file, changeLog, onProgress)
      setVersions(prev => [...prev, newVersion])
      return newVersion
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload new version')
      throw err
    }
  }, [])

  return {
    versions,
    loading,
    error,
    fetchVersions,
    uploadNewVersion
  }
}