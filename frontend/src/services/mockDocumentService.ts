import { 
  Document, 
  DocumentFolder, 
  DocumentTag, 
  DocumentSearchFilters, 
  DocumentUploadOptions,
  DocumentUploadProgress,
  DocumentVersion
} from '../types/document'
import { mockDocuments, mockDocumentFolders, mockDocumentTags } from '../data/mockDocuments'

class MockDocumentService {
  private documents: Document[] = [...mockDocuments]
  private folders: DocumentFolder[] = [...mockDocumentFolders]
  private tags: DocumentTag[] = [...mockDocumentTags]

  // Document CRUD operations
  async getDocuments(filters?: DocumentSearchFilters): Promise<Document[]> {
    await this.delay(500)
    
    let filteredDocuments = [...this.documents]

    if (filters) {
      if (filters.query) {
        const query = filters.query.toLowerCase()
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.fileName.toLowerCase().includes(query) ||
          doc.originalName.toLowerCase().includes(query) ||
          doc.description?.toLowerCase().includes(query)
        )
      }

      if (filters.category) {
        filteredDocuments = filteredDocuments.filter(doc => doc.category === filters.category)
      }

      if (filters.fileType) {
        filteredDocuments = filteredDocuments.filter(doc => doc.fileType === filters.fileType)
      }

      if (filters.status) {
        filteredDocuments = filteredDocuments.filter(doc => doc.status === filters.status)
      }

      if (filters.folderId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.folderId === filters.folderId)
      }

      if (filters.projectId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.projectId === filters.projectId)
      }

      if (filters.uploadedBy) {
        filteredDocuments = filteredDocuments.filter(doc => doc.uploadedBy === filters.uploadedBy)
      }

      if (filters.dateFrom) {
        filteredDocuments = filteredDocuments.filter(doc => 
          new Date(doc.uploadedAt) >= filters.dateFrom!
        )
      }

      if (filters.dateTo) {
        filteredDocuments = filteredDocuments.filter(doc => 
          new Date(doc.uploadedAt) <= filters.dateTo!
        )
      }

      if (filters.tags && filters.tags.length > 0) {
        filteredDocuments = filteredDocuments.filter(doc => 
          doc.tags.some(tag => filters.tags!.includes(tag.id))
        )
      }

      // Sorting
      if (filters.sortBy) {
        filteredDocuments.sort((a, b) => {
          let aValue: any, bValue: any

          switch (filters.sortBy) {
            case 'name':
              aValue = a.fileName.toLowerCase()
              bValue = b.fileName.toLowerCase()
              break
            case 'uploadedAt':
              aValue = new Date(a.uploadedAt).getTime()
              bValue = new Date(b.uploadedAt).getTime()
              break
            case 'fileSize':
              aValue = a.fileSize
              bValue = b.fileSize
              break
            case 'category':
              aValue = a.category
              bValue = b.category
              break
            default:
              return 0
          }

          if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1
          if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1
          return 0
        })
      }
    }

    return filteredDocuments
  }

  async getDocument(id: number): Promise<Document | null> {
    await this.delay(300)
    return this.documents.find(doc => doc.id === id) || null
  }

  async uploadDocument(
    file: File, 
    options: DocumentUploadOptions,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<Document> {
    // Simulate upload progress
    const progressCallback = onProgress || (() => {})
    
    progressCallback({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    })

    // Simulate upload chunks
    for (let i = 1; i <= 10; i++) {
      await this.delay(200)
      progressCallback({
        fileName: file.name,
        progress: i * 10,
        status: 'uploading'
      })
    }

    progressCallback({
      fileName: file.name,
      progress: 100,
      status: 'processing'
    })

    await this.delay(500)

    // Create new document
    const newDocument: Document = {
      id: Math.max(...this.documents.map(d => d.id)) + 1,
      fileName: `${Date.now()}-${file.name}`,
      originalName: file.name,
      fileSize: file.size,
      fileType: this.getFileType(file.name),
      mimeType: file.type,
      category: options.category,
      status: 'Active',
      description: options.description,
      folderId: options.folderId,
      projectId: options.projectId,
      uploadedBy: 1, // Current user
      uploadedAt: new Date(),
      updatedAt: new Date(),
      tags: options.tags ? this.tags.filter(tag => options.tags!.includes(tag.id)) : [],
      versions: [],
      currentVersion: {
        id: Math.max(...this.documents.flatMap(d => d.versions.map(v => v.id))) + 1,
        documentId: 0, // Will be set after document creation
        version: '1.0',
        fileName: `${Date.now()}-${file.name}`,
        fileSize: file.size,
        uploadedBy: 1,
        uploadedAt: new Date(),
        isActive: true
      },
      downloadUrl: `/api/documents/${Math.max(...this.documents.map(d => d.id)) + 1}/download`,
      previewUrl: this.canPreview(file.name) ? `/api/documents/${Math.max(...this.documents.map(d => d.id)) + 1}/preview` : undefined,
      thumbnailUrl: this.canThumbnail(file.name) ? `/api/documents/${Math.max(...this.documents.map(d => d.id)) + 1}/thumbnail` : undefined
    }

    newDocument.currentVersion.documentId = newDocument.id
    newDocument.versions = [newDocument.currentVersion]

    this.documents.push(newDocument)

    progressCallback({
      fileName: file.name,
      progress: 100,
      status: 'completed'
    })

    return newDocument
  }

  async updateDocument(id: number, updates: Partial<Document>): Promise<Document> {
    await this.delay(300)
    
    const index = this.documents.findIndex(doc => doc.id === id)
    if (index === -1) {
      throw new Error('Document not found')
    }

    this.documents[index] = {
      ...this.documents[index],
      ...updates,
      updatedAt: new Date()
    }

    return this.documents[index]
  }

  async deleteDocument(id: number): Promise<void> {
    await this.delay(300)
    
    const index = this.documents.findIndex(doc => doc.id === id)
    if (index === -1) {
      throw new Error('Document not found')
    }

    this.documents.splice(index, 1)
  }

  // Folder operations
  async getFolders(): Promise<DocumentFolder[]> {
    await this.delay(300)
    return this.folders
  }

  async createFolder(name: string, parentId?: number): Promise<DocumentFolder> {
    await this.delay(300)
    
    const parentPath = parentId 
      ? this.folders.find(f => f.id === parentId)?.path || ''
      : ''
    
    const newFolder: DocumentFolder = {
      id: Math.max(...this.folders.map(f => f.id)) + 1,
      name,
      parentId,
      path: `${parentPath}/${name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      documentCount: 0
    }

    this.folders.push(newFolder)
    return newFolder
  }

  async updateFolder(id: number, updates: Partial<DocumentFolder>): Promise<DocumentFolder> {
    await this.delay(300)
    
    const index = this.folders.findIndex(folder => folder.id === id)
    if (index === -1) {
      throw new Error('Folder not found')
    }

    this.folders[index] = {
      ...this.folders[index],
      ...updates,
      updatedAt: new Date()
    }

    return this.folders[index]
  }

  async deleteFolder(id: number): Promise<void> {
    await this.delay(300)
    
    // Check if folder has documents
    const hasDocuments = this.documents.some(doc => doc.folderId === id)
    if (hasDocuments) {
      throw new Error('Cannot delete folder with documents')
    }

    // Check if folder has subfolders
    const hasSubfolders = this.folders.some(folder => folder.parentId === id)
    if (hasSubfolders) {
      throw new Error('Cannot delete folder with subfolders')
    }

    const index = this.folders.findIndex(folder => folder.id === id)
    if (index === -1) {
      throw new Error('Folder not found')
    }

    this.folders.splice(index, 1)
  }

  // Tag operations
  async getTags(): Promise<DocumentTag[]> {
    await this.delay(200)
    return this.tags
  }

  async createTag(name: string, color: string): Promise<DocumentTag> {
    await this.delay(300)
    
    const newTag: DocumentTag = {
      id: Math.max(...this.tags.map(t => t.id)) + 1,
      name,
      color
    }

    this.tags.push(newTag)
    return newTag
  }

  // Version operations
  async getDocumentVersions(documentId: number): Promise<DocumentVersion[]> {
    await this.delay(300)
    
    const document = this.documents.find(doc => doc.id === documentId)
    return document?.versions || []
  }

  async uploadNewVersion(
    documentId: number, 
    file: File, 
    changeLog?: string,
    onProgress?: (progress: DocumentUploadProgress) => void
  ): Promise<DocumentVersion> {
    const document = this.documents.find(doc => doc.id === documentId)
    if (!document) {
      throw new Error('Document not found')
    }

    // Simulate upload progress
    const progressCallback = onProgress || (() => {})
    
    progressCallback({
      fileName: file.name,
      progress: 0,
      status: 'uploading'
    })

    for (let i = 1; i <= 10; i++) {
      await this.delay(100)
      progressCallback({
        fileName: file.name,
        progress: i * 10,
        status: 'uploading'
      })
    }

    // Deactivate current version
    document.versions.forEach(v => v.isActive = false)

    // Create new version
    const currentVersion = parseFloat(document.currentVersion.version)
    const newVersionNumber = (currentVersion + 0.1).toFixed(1)

    const newVersion: DocumentVersion = {
      id: Math.max(...this.documents.flatMap(d => d.versions.map(v => v.id))) + 1,
      documentId,
      version: newVersionNumber,
      fileName: `${Date.now()}-${file.name}`,
      fileSize: file.size,
      uploadedBy: 1,
      uploadedAt: new Date(),
      changeLog,
      isActive: true
    }

    document.versions.push(newVersion)
    document.currentVersion = newVersion
    document.fileName = newVersion.fileName
    document.fileSize = newVersion.fileSize
    document.updatedAt = new Date()

    progressCallback({
      fileName: file.name,
      progress: 100,
      status: 'completed'
    })

    return newVersion
  }

  // Utility methods
  private getFileType(fileName: string): any {
    const extension = fileName.split('.').pop()?.toLowerCase()
    return extension || 'unknown'
  }

  private canPreview(fileName: string): boolean {
    const previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'txt', 'doc', 'docx']
    const extension = fileName.split('.').pop()?.toLowerCase()
    return previewableTypes.includes(extension || '')
  }

  private canThumbnail(fileName: string): boolean {
    const thumbnailTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'doc', 'docx']
    const extension = fileName.split('.').pop()?.toLowerCase()
    return thumbnailTypes.includes(extension || '')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const documentService = new MockDocumentService()