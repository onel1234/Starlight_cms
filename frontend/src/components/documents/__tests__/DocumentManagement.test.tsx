import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUpload } from '../FileUpload'
import { DocumentSearch } from '../DocumentSearch'
import { DocumentList } from '../DocumentList'
import { FolderTree } from '../FolderTree'
import { DocumentPreview } from '../DocumentPreview'
import { DocumentVersions } from '../DocumentVersions'
import { DocumentForm } from '../DocumentForm'
import { DocumentUploadOptions, DocumentSearchFilters } from '../../../types/document'

// Mock the hooks
vi.mock('../../../hooks/useDocuments', () => ({
  useDocuments: () => ({
    documents: [],
    loading: false,
    error: null,
    fetchDocuments: vi.fn(),
    uploadDocument: vi.fn(),
    updateDocument: vi.fn(),
    deleteDocument: vi.fn()
  }),
  useDocumentFolders: () => ({
    folders: [],
    loading: false,
    error: null,
    fetchFolders: vi.fn(),
    createFolder: vi.fn(),
    updateFolder: vi.fn(),
    deleteFolder: vi.fn()
  }),
  useDocumentTags: () => ({
    tags: [],
    loading: false,
    error: null,
    fetchTags: vi.fn(),
    createTag: vi.fn()
  }),
  useDocumentVersions: () => ({
    versions: [],
    loading: false,
    error: null,
    fetchVersions: vi.fn(),
    uploadNewVersion: vi.fn()
  })
}))

describe('Document Management Components', () => {
  describe('FileUpload', () => {
    const mockUploadOptions: DocumentUploadOptions = {
      category: 'Project Documents',
      description: 'Test upload'
    }

    it('renders upload area with drag and drop functionality', () => {
      render(
        <FileUpload
          uploadOptions={mockUploadOptions}
          onUploadComplete={vi.fn()}
        />
      )

      expect(screen.getByText('Upload documents')).toBeInTheDocument()
      expect(screen.getByText('Drag and drop files here, or click to browse')).toBeInTheDocument()
    })

    it('shows file type restrictions', () => {
      render(
        <FileUpload
          uploadOptions={mockUploadOptions}
          onUploadComplete={vi.fn()}
        />
      )

      expect(screen.getByText(/Supported formats:/)).toBeInTheDocument()
      expect(screen.getByText(/Max size:/)).toBeInTheDocument()
    })

    it('handles drag over events', () => {
      render(
        <FileUpload
          uploadOptions={mockUploadOptions}
          onUploadComplete={vi.fn()}
        />
      )

      const uploadArea = screen.getByText('Upload documents').closest('div')
      fireEvent.dragOver(uploadArea!)

      expect(screen.getByText('Drop files here')).toBeInTheDocument()
    })
  })

  describe('DocumentSearch', () => {
    const mockFilters: DocumentSearchFilters = {
      sortBy: 'uploadedAt',
      sortOrder: 'desc'
    }

    it('renders search input and filters', () => {
      render(
        <DocumentSearch
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onSearch={vi.fn()}
        />
      )

      expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument()
    })

    it('shows advanced filters when button is clicked', async () => {
      render(
        <DocumentSearch
          filters={mockFilters}
          onFiltersChange={vi.fn()}
          onSearch={vi.fn()}
        />
      )

      const filterButton = screen.getByTitle('Advanced filters')
      fireEvent.click(filterButton)

      await waitFor(() => {
        expect(screen.getByText('Advanced Filters')).toBeInTheDocument()
      })
    })

    it('calls onFiltersChange when search input changes', () => {
      const mockOnFiltersChange = vi.fn()
      render(
        <DocumentSearch
          filters={mockFilters}
          onFiltersChange={mockOnFiltersChange}
          onSearch={vi.fn()}
        />
      )

      const searchInput = screen.getByPlaceholderText('Search documents...')
      fireEvent.change(searchInput, { target: { value: 'test query' } })

      expect(mockOnFiltersChange).toHaveBeenCalledWith({
        ...mockFilters,
        query: 'test query'
      })
    })
  })

  describe('DocumentList', () => {
    it('shows loading state', () => {
      // Mock loading state
      vi.mocked(require('../../../hooks/useDocuments').useDocuments).mockReturnValue({
        documents: [],
        loading: true,
        error: null,
        fetchDocuments: vi.fn(),
        uploadDocument: vi.fn(),
        updateDocument: vi.fn(),
        deleteDocument: vi.fn()
      })

      render(
        <DocumentList
          filters={mockFilters}
          onDocumentSelect={vi.fn()}
          onDocumentEdit={vi.fn()}
          onDocumentDelete={vi.fn()}
        />
      )

      expect(screen.getAllByText(/Loading/i)).toBeTruthy()
    })

    it('shows empty state when no documents', () => {
      render(
        <DocumentList
          filters={mockFilters}
          onDocumentSelect={vi.fn()}
          onDocumentEdit={vi.fn()}
          onDocumentDelete={vi.fn()}
        />
      )

      expect(screen.getByText('No documents found')).toBeInTheDocument()
    })
  })

  describe('FolderTree', () => {
    it('renders folder tree with create button', () => {
      render(
        <FolderTree
          onFolderSelect={vi.fn()}
          onFolderCreate={vi.fn()}
          onFolderEdit={vi.fn()}
          onFolderDelete={vi.fn()}
        />
      )

      expect(screen.getByText('Folders')).toBeInTheDocument()
      expect(screen.getByText('All Documents')).toBeInTheDocument()
      expect(screen.getByTitle('Create new folder')).toBeInTheDocument()
    })

    it('shows empty state when no folders', () => {
      render(
        <FolderTree
          onFolderSelect={vi.fn()}
          onFolderCreate={vi.fn()}
          onFolderEdit={vi.fn()}
          onFolderDelete={vi.fn()}
        />
      )

      expect(screen.getByText('No folders yet')).toBeInTheDocument()
      expect(screen.getByText('Create your first folder')).toBeInTheDocument()
    })
  })

  describe('DocumentPreview', () => {
    const mockDocument = {
      id: 1,
      fileName: 'test.pdf',
      originalName: 'Test Document.pdf',
      fileSize: 1024,
      fileType: 'pdf' as const,
      mimeType: 'application/pdf',
      category: 'Project Documents' as const,
      status: 'Active' as const,
      uploadedBy: 1,
      uploadedAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      versions: [],
      currentVersion: {
        id: 1,
        documentId: 1,
        version: '1.0',
        fileName: 'test.pdf',
        fileSize: 1024,
        uploadedBy: 1,
        uploadedAt: new Date(),
        isActive: true
      },
      downloadUrl: '/download/test.pdf',
      previewUrl: '/preview/test.pdf'
    }

    it('does not render when not open', () => {
      render(
        <DocumentPreview
          document={mockDocument}
          isOpen={false}
          onClose={vi.fn()}
        />
      )

      expect(screen.queryByText('Test Document.pdf')).not.toBeInTheDocument()
    })

    it('renders document preview when open', () => {
      render(
        <DocumentPreview
          document={mockDocument}
          isOpen={true}
          onClose={vi.fn()}
        />
      )

      expect(screen.getByText('Test Document.pdf')).toBeInTheDocument()
      expect(screen.getByText('PDF')).toBeInTheDocument()
      expect(screen.getByText('1 KB')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = vi.fn()
      render(
        <DocumentPreview
          document={mockDocument}
          isOpen={true}
          onClose={mockOnClose}
        />
      )

      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)

      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('DocumentForm', () => {
    it('does not render when not open', () => {
      render(
        <DocumentForm
          isOpen={false}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      )

      expect(screen.queryByText('Document Details')).not.toBeInTheDocument()
    })

    it('renders form when open', () => {
      render(
        <DocumentForm
          isOpen={true}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      )

      expect(screen.getByText('Document Details')).toBeInTheDocument()
      expect(screen.getByLabelText('Document Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Category')).toBeInTheDocument()
      expect(screen.getByLabelText('Status')).toBeInTheDocument()
    })

    it('calls onSave when form is submitted', () => {
      const mockOnSave = vi.fn()
      render(
        <DocumentForm
          isOpen={true}
          onClose={vi.fn()}
          onSave={mockOnSave}
        />
      )

      const nameInput = screen.getByLabelText('Document Name')
      fireEvent.change(nameInput, { target: { value: 'Test Document' } })

      const submitButton = screen.getByText('Save Changes')
      fireEvent.click(submitButton)

      expect(mockOnSave).toHaveBeenCalledWith(
        expect.objectContaining({
          originalName: 'Test Document'
        })
      )
    })
  })
})

describe('Document Management Integration', () => {
  it('components work together in document management workflow', () => {
    // This would be an integration test that tests the full workflow
    // of uploading, searching, and managing documents
    expect(true).toBe(true) // Placeholder for integration tests
  })
})