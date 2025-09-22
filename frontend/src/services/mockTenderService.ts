import { 
  Tender, 
  TenderSubmission, 
  CreateTenderData, 
  UpdateTenderData, 
  CreateTenderSubmissionData 
} from '../types/tender'
import { mockTenders, mockTenderSubmissions } from '../data/mockTenders'

class MockTenderService {
  private tenders: Tender[] = [...mockTenders]
  private submissions: TenderSubmission[] = [...mockTenderSubmissions]
  private nextTenderId = Math.max(...this.tenders.map(t => t.id)) + 1
  private nextSubmissionId = Math.max(...this.submissions.map(s => s.id)) + 1

  // Tender Management
  async getTenders(): Promise<Tender[]> {
    await this.delay()
    return this.tenders.map(tender => ({
      ...tender,
      submissions: this.submissions.filter(s => s.tenderId === tender.id)
    }))
  }

  async getTenderById(id: number): Promise<Tender | null> {
    await this.delay()
    const tender = this.tenders.find(t => t.id === id)
    if (!tender) return null
    
    return {
      ...tender,
      submissions: this.submissions.filter(s => s.tenderId === id)
    }
  }

  async getPublicTenders(): Promise<Tender[]> {
    await this.delay()
    return this.tenders
      .filter(t => t.status === 'Published')
      .map(tender => ({
        ...tender,
        submissions: undefined // Don't expose submissions in public view
      }))
  }

  async createTender(data: CreateTenderData): Promise<Tender> {
    await this.delay()
    const newTender: Tender = {
      id: this.nextTenderId++,
      ...data,
      status: 'Draft',
      createdBy: 1, // Mock current user
      createdAt: new Date(),
      updatedAt: new Date(),
      documents: [],
      submissions: []
    }
    this.tenders.push(newTender)
    return newTender
  }

  async updateTender(id: number, data: UpdateTenderData): Promise<Tender | null> {
    await this.delay()
    const index = this.tenders.findIndex(t => t.id === id)
    if (index === -1) return null

    this.tenders[index] = {
      ...this.tenders[index],
      ...data,
      updatedAt: new Date()
    }

    return {
      ...this.tenders[index],
      submissions: this.submissions.filter(s => s.tenderId === id)
    }
  }

  async deleteTender(id: number): Promise<boolean> {
    await this.delay()
    const index = this.tenders.findIndex(t => t.id === id)
    if (index === -1) return false

    this.tenders.splice(index, 1)
    // Also remove related submissions
    this.submissions = this.submissions.filter(s => s.tenderId !== id)
    return true
  }

  async publishTender(id: number): Promise<Tender | null> {
    await this.delay()
    return this.updateTender(id, { 
      status: 'Published', 
      publishedDate: new Date() 
    })
  }

  async closeTender(id: number, winnerId?: number): Promise<Tender | null> {
    await this.delay()
    return this.updateTender(id, { 
      status: 'Closed', 
      closedDate: new Date(),
      winnerId 
    })
  }

  // Tender Submissions
  async getTenderSubmissions(tenderId: number): Promise<TenderSubmission[]> {
    await this.delay()
    return this.submissions.filter(s => s.tenderId === tenderId)
  }

  async createTenderSubmission(data: CreateTenderSubmissionData): Promise<TenderSubmission> {
    await this.delay()
    const newSubmission: TenderSubmission = {
      id: this.nextSubmissionId++,
      ...data,
      supplierId: 8, // Mock current supplier user
      submissionDate: new Date(),
      status: 'Submitted'
    }
    this.submissions.push(newSubmission)
    return newSubmission
  }

  async updateSubmissionStatus(
    id: number, 
    status: TenderSubmission['status'],
    evaluationScore?: number,
    evaluationNotes?: string
  ): Promise<TenderSubmission | null> {
    await this.delay()
    const index = this.submissions.findIndex(s => s.id === id)
    if (index === -1) return null

    this.submissions[index] = {
      ...this.submissions[index],
      status,
      evaluationScore,
      evaluationNotes
    }

    return this.submissions[index]
  }

  // File Upload Mock
  async uploadTenderDocument(tenderId: number, file: File): Promise<{ fileUrl: string }> {
    await this.delay(1000) // Simulate upload time
    return {
      fileUrl: `/documents/${file.name}`
    }
  }

  async uploadSubmissionDocument(submissionId: number, file: File): Promise<{ fileUrl: string }> {
    await this.delay(1000) // Simulate upload time
    return {
      fileUrl: `/submissions/${file.name}`
    }
  }

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const mockTenderService = new MockTenderService()