import { Document, DocumentFolder, DocumentTag, DocumentVersion } from '../types/document'

export const mockDocumentTags: DocumentTag[] = [
  { id: 1, name: 'Important', color: '#ef4444' },
  { id: 2, name: 'Contract', color: '#3b82f6' },
  { id: 3, name: 'Technical', color: '#10b981' },
  { id: 4, name: 'Financial', color: '#f59e0b' },
  { id: 5, name: 'Legal', color: '#8b5cf6' },
  { id: 6, name: 'Draft', color: '#6b7280' },
  { id: 7, name: 'Approved', color: '#059669' },
  { id: 8, name: 'Review', color: '#dc2626' }
]

export const mockDocumentFolders: DocumentFolder[] = [
  {
    id: 1,
    name: 'Projects',
    path: '/Projects',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    documentCount: 45,
    children: [
      {
        id: 2,
        name: 'Water Treatment Plant',
        parentId: 1,
        path: '/Projects/Water Treatment Plant',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        documentCount: 12
      },
      {
        id: 3,
        name: 'Sewerage System Upgrade',
        parentId: 1,
        path: '/Projects/Sewerage System Upgrade',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
        documentCount: 18
      }
    ]
  },
  {
    id: 4,
    name: 'Contracts',
    path: '/Contracts',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    documentCount: 23,
    children: [
      {
        id: 5,
        name: 'Supplier Contracts',
        parentId: 4,
        path: '/Contracts/Supplier Contracts',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        documentCount: 8
      },
      {
        id: 6,
        name: 'Client Contracts',
        parentId: 4,
        path: '/Contracts/Client Contracts',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
        documentCount: 15
      }
    ]
  },
  {
    id: 7,
    name: 'Financial Documents',
    path: '/Financial Documents',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    documentCount: 67
  },
  {
    id: 8,
    name: 'Technical Drawings',
    path: '/Technical Drawings',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    documentCount: 34
  }
]

export const mockDocumentVersions: DocumentVersion[] = [
  {
    id: 1,
    documentId: 1,
    version: '1.0',
    fileName: 'project-proposal-v1.pdf',
    fileSize: 2048576,
    uploadedBy: 1,
    uploadedAt: new Date('2024-01-15T10:00:00Z'),
    isActive: false
  },
  {
    id: 2,
    documentId: 1,
    version: '1.1',
    fileName: 'project-proposal-v1.1.pdf',
    fileSize: 2156789,
    uploadedBy: 1,
    uploadedAt: new Date('2024-01-20T14:30:00Z'),
    changeLog: 'Updated budget section and timeline',
    isActive: false
  },
  {
    id: 3,
    documentId: 1,
    version: '2.0',
    fileName: 'project-proposal-v2.pdf',
    fileSize: 2234567,
    uploadedBy: 2,
    uploadedAt: new Date('2024-02-01T09:15:00Z'),
    changeLog: 'Major revision with client feedback incorporated',
    isActive: true
  }
]

export const mockDocuments: Document[] = [
  {
    id: 1,
    fileName: 'project-proposal-v2.pdf',
    originalName: 'Water Treatment Plant Proposal.pdf',
    fileSize: 2234567,
    fileType: 'pdf',
    mimeType: 'application/pdf',
    category: 'Project Documents',
    status: 'Active',
    description: 'Comprehensive project proposal for the new water treatment facility',
    folderId: 2,
    projectId: 1,
    uploadedBy: 1,
    uploadedAt: new Date('2024-02-01T09:15:00Z'),
    updatedAt: new Date('2024-02-01T09:15:00Z'),
    tags: [mockDocumentTags[0], mockDocumentTags[2], mockDocumentTags[6]],
    versions: mockDocumentVersions.filter(v => v.documentId === 1),
    currentVersion: mockDocumentVersions[2],
    downloadUrl: '/api/documents/1/download',
    previewUrl: '/api/documents/1/preview',
    thumbnailUrl: '/api/documents/1/thumbnail'
  },
  {
    id: 2,
    fileName: 'technical-specifications.docx',
    originalName: 'Technical Specifications Rev 3.docx',
    fileSize: 1456789,
    fileType: 'docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'Technical Drawings',
    status: 'Active',
    description: 'Detailed technical specifications for equipment and materials',
    folderId: 8,
    projectId: 1,
    uploadedBy: 3,
    uploadedAt: new Date('2024-01-25T16:45:00Z'),
    updatedAt: new Date('2024-01-25T16:45:00Z'),
    tags: [mockDocumentTags[2], mockDocumentTags[6]],
    versions: [
      {
        id: 4,
        documentId: 2,
        version: '1.0',
        fileName: 'technical-specifications.docx',
        fileSize: 1456789,
        uploadedBy: 3,
        uploadedAt: new Date('2024-01-25T16:45:00Z'),
        isActive: true
      }
    ],
    currentVersion: {
      id: 4,
      documentId: 2,
      version: '1.0',
      fileName: 'technical-specifications.docx',
      fileSize: 1456789,
      uploadedBy: 3,
      uploadedAt: new Date('2024-01-25T16:45:00Z'),
      isActive: true
    },
    downloadUrl: '/api/documents/2/download',
    previewUrl: '/api/documents/2/preview'
  },
  {
    id: 3,
    fileName: 'contract-abc-suppliers.pdf',
    originalName: 'ABC Suppliers Contract - Signed.pdf',
    fileSize: 987654,
    fileType: 'pdf',
    mimeType: 'application/pdf',
    category: 'Contracts',
    status: 'Active',
    description: 'Signed contract with ABC Suppliers for material supply',
    folderId: 5,
    uploadedBy: 4,
    uploadedAt: new Date('2024-01-18T11:20:00Z'),
    updatedAt: new Date('2024-01-18T11:20:00Z'),
    tags: [mockDocumentTags[1], mockDocumentTags[4], mockDocumentTags[6]],
    versions: [
      {
        id: 5,
        documentId: 3,
        version: '1.0',
        fileName: 'contract-abc-suppliers.pdf',
        fileSize: 987654,
        uploadedBy: 4,
        uploadedAt: new Date('2024-01-18T11:20:00Z'),
        isActive: true
      }
    ],
    currentVersion: {
      id: 5,
      documentId: 3,
      version: '1.0',
      fileName: 'contract-abc-suppliers.pdf',
      fileSize: 987654,
      uploadedBy: 4,
      uploadedAt: new Date('2024-01-18T11:20:00Z'),
      isActive: true
    },
    downloadUrl: '/api/documents/3/download',
    previewUrl: '/api/documents/3/preview',
    thumbnailUrl: '/api/documents/3/thumbnail'
  },
  {
    id: 4,
    fileName: 'site-photos-jan-2024.zip',
    originalName: 'Construction Site Photos - January 2024.zip',
    fileSize: 15678901,
    fileType: 'zip',
    mimeType: 'application/zip',
    category: 'Photos',
    status: 'Active',
    description: 'Monthly progress photos from construction site',
    folderId: 2,
    projectId: 1,
    uploadedBy: 5,
    uploadedAt: new Date('2024-02-01T08:30:00Z'),
    updatedAt: new Date('2024-02-01T08:30:00Z'),
    tags: [mockDocumentTags[2]],
    versions: [
      {
        id: 6,
        documentId: 4,
        version: '1.0',
        fileName: 'site-photos-jan-2024.zip',
        fileSize: 15678901,
        uploadedBy: 5,
        uploadedAt: new Date('2024-02-01T08:30:00Z'),
        isActive: true
      }
    ],
    currentVersion: {
      id: 6,
      documentId: 4,
      version: '1.0',
      fileName: 'site-photos-jan-2024.zip',
      fileSize: 15678901,
      uploadedBy: 5,
      uploadedAt: new Date('2024-02-01T08:30:00Z'),
      isActive: true
    },
    downloadUrl: '/api/documents/4/download'
  },
  {
    id: 5,
    fileName: 'invoice-inv-2024-001.pdf',
    originalName: 'Invoice INV-2024-001.pdf',
    fileSize: 234567,
    fileType: 'pdf',
    mimeType: 'application/pdf',
    category: 'Invoices',
    status: 'Active',
    description: 'Invoice for materials delivered in January 2024',
    folderId: 7,
    uploadedBy: 6,
    uploadedAt: new Date('2024-01-31T17:00:00Z'),
    updatedAt: new Date('2024-01-31T17:00:00Z'),
    tags: [mockDocumentTags[3], mockDocumentTags[6]],
    versions: [
      {
        id: 7,
        documentId: 5,
        version: '1.0',
        fileName: 'invoice-inv-2024-001.pdf',
        fileSize: 234567,
        uploadedBy: 6,
        uploadedAt: new Date('2024-01-31T17:00:00Z'),
        isActive: true
      }
    ],
    currentVersion: {
      id: 7,
      documentId: 5,
      version: '1.0',
      fileName: 'invoice-inv-2024-001.pdf',
      fileSize: 234567,
      uploadedBy: 6,
      uploadedAt: new Date('2024-01-31T17:00:00Z'),
      isActive: true
    },
    downloadUrl: '/api/documents/5/download',
    previewUrl: '/api/documents/5/preview',
    thumbnailUrl: '/api/documents/5/thumbnail'
  }
]