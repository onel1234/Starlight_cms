export type DocumentCategory = 
  | 'Project Documents'
  | 'Contracts'
  | 'Invoices'
  | 'Quotations'
  | 'Purchase Orders'
  | 'Technical Drawings'
  | 'Permits'
  | 'Reports'
  | 'Photos'
  | 'Other'

export type DocumentStatus = 'Active' | 'Archived' | 'Draft'

export type FileType = 
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'gif'
  | 'dwg'
  | 'zip'
  | 'rar'

export interface DocumentTag {
  id: number
  name: string
  color: string
}

export interface DocumentFolder {
  id: number
  name: string
  parentId?: number
  path: string
  createdAt: Date
  updatedAt: Date
  children?: DocumentFolder[]
  documentCount?: number
}

export interface DocumentVersion {
  id: number
  documentId: number
  version: string
  fileName: string
  fileSize: number
  uploadedBy: number
  uploadedAt: Date
  changeLog?: string
  isActive: boolean
}

export interface Document {
  id: number
  fileName: string
  originalName: string
  fileSize: number
  fileType: FileType
  mimeType: string
  category: DocumentCategory
  status: DocumentStatus
  description?: string
  folderId?: number
  projectId?: number
  uploadedBy: number
  uploadedAt: Date
  updatedAt: Date
  tags: DocumentTag[]
  versions: DocumentVersion[]
  currentVersion: DocumentVersion
  downloadUrl: string
  previewUrl?: string
  thumbnailUrl?: string
  metadata?: Record<string, any>
}

export interface DocumentUploadProgress {
  fileName: string
  progress: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  error?: string
}

export interface DocumentSearchFilters {
  query?: string
  category?: DocumentCategory
  fileType?: FileType
  status?: DocumentStatus
  folderId?: number
  projectId?: number
  uploadedBy?: number
  dateFrom?: Date
  dateTo?: Date
  tags?: number[]
  sortBy?: 'name' | 'uploadedAt' | 'fileSize' | 'category'
  sortOrder?: 'asc' | 'desc'
}

export interface DocumentUploadOptions {
  folderId?: number
  projectId?: number
  category: DocumentCategory
  description?: string
  tags?: number[]
  replaceExisting?: boolean
}

export interface DocumentPermission {
  userId: number
  documentId: number
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canShare: boolean
}