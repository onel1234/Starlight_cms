import { User } from './auth'

export type TenderStatus = 'Draft' | 'Published' | 'Closed' | 'Awarded'

export interface TenderDocument {
  id: number
  tenderId: number
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedBy: number
  uploadedAt: Date
}

export interface Tender {
  id: number
  title: string
  description: string
  requirements?: string
  submissionDeadline: Date
  status: TenderStatus
  publishedDate?: Date
  closedDate?: Date
  winnerId?: number
  createdBy: number
  createdAt: Date
  updatedAt: Date
  documents?: TenderDocument[]
  winner?: User
  submissions?: TenderSubmission[]
}

export interface TenderSubmission {
  id: number
  tenderId: number
  supplierId: number
  submissionDate: Date
  proposedAmount: number
  notes?: string
  status: 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected'
  evaluationScore?: number
  evaluationNotes?: string
  documents?: TenderSubmissionDocument[]
  tender?: Tender
  supplier?: User
}

export interface TenderSubmissionDocument {
  id: number
  submissionId: number
  fileName: string
  fileUrl: string
  fileSize: number
  uploadedAt: Date
}

export interface CreateTenderData {
  title: string
  description: string
  requirements?: string
  submissionDeadline: Date
}

export interface UpdateTenderData extends Partial<CreateTenderData> {
  status?: TenderStatus
  winnerId?: number
}

export interface CreateTenderSubmissionData {
  tenderId: number
  proposedAmount: number
  notes?: string
}