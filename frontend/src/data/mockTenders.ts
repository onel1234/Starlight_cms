import { Tender, TenderSubmission, TenderDocument } from '../types/tender'

export const mockTenderDocuments: TenderDocument[] = [
  {
    id: 1,
    tenderId: 1,
    fileName: 'tender_specifications.pdf',
    fileUrl: '/documents/tender_specifications.pdf',
    fileSize: 2048576,
    uploadedBy: 1,
    uploadedAt: new Date('2024-01-15T10:00:00Z')
  },
  {
    id: 2,
    tenderId: 1,
    fileName: 'technical_requirements.docx',
    fileUrl: '/documents/technical_requirements.docx',
    fileSize: 1024000,
    uploadedBy: 1,
    uploadedAt: new Date('2024-01-15T10:30:00Z')
  }
]

export const mockTenderSubmissions: TenderSubmission[] = [
  {
    id: 1,
    tenderId: 1,
    supplierId: 8,
    submissionDate: new Date('2024-01-20T14:30:00Z'),
    proposedAmount: 150000,
    notes: 'We can complete this project within the specified timeline with high quality materials.',
    status: 'Under Review',
    evaluationScore: 85,
    evaluationNotes: 'Good proposal with competitive pricing'
  },
  {
    id: 2,
    tenderId: 1,
    supplierId: 9,
    submissionDate: new Date('2024-01-22T09:15:00Z'),
    proposedAmount: 145000,
    notes: 'Experienced team with similar project portfolio. Can provide additional warranty.',
    status: 'Accepted',
    evaluationScore: 92,
    evaluationNotes: 'Excellent proposal with best value for money'
  }
]

export const mockTenders: Tender[] = [
  {
    id: 1,
    title: 'Water Treatment Plant Construction',
    description: 'Construction of a new water treatment facility with capacity for 50,000 residents. Includes all civil works, mechanical installations, and electrical systems.',
    requirements: 'Minimum 5 years experience in water treatment projects. ISO 9001 certification required. Must provide 2-year warranty.',
    submissionDeadline: new Date('2024-02-15T23:59:59Z'),
    status: 'Published',
    publishedDate: new Date('2024-01-15T08:00:00Z'),
    createdBy: 1,
    createdAt: new Date('2024-01-10T10:00:00Z'),
    updatedAt: new Date('2024-01-15T08:00:00Z'),
    documents: mockTenderDocuments.filter(doc => doc.tenderId === 1),
    submissions: mockTenderSubmissions.filter(sub => sub.tenderId === 1)
  },
  {
    id: 2,
    title: 'Sewerage System Upgrade',
    description: 'Upgrade existing sewerage infrastructure including pipe replacement and pump station modernization.',
    requirements: 'Experience with underground utilities. Environmental compliance certification required.',
    submissionDeadline: new Date('2024-03-01T23:59:59Z'),
    status: 'Published',
    publishedDate: new Date('2024-01-20T08:00:00Z'),
    createdBy: 1,
    createdAt: new Date('2024-01-18T14:00:00Z'),
    updatedAt: new Date('2024-01-20T08:00:00Z'),
    documents: [],
    submissions: []
  },
  {
    id: 3,
    title: 'Environmental Monitoring System',
    description: 'Installation of comprehensive environmental monitoring equipment across multiple sites.',
    requirements: 'Technical expertise in environmental monitoring. Equipment certification required.',
    submissionDeadline: new Date('2024-01-25T23:59:59Z'),
    status: 'Closed',
    publishedDate: new Date('2024-01-05T08:00:00Z'),
    closedDate: new Date('2024-01-25T23:59:59Z'),
    winnerId: 9,
    createdBy: 1,
    createdAt: new Date('2024-01-02T10:00:00Z'),
    updatedAt: new Date('2024-01-26T09:00:00Z'),
    documents: [],
    submissions: []
  },
  {
    id: 4,
    title: 'Bridge Construction Project',
    description: 'Construction of a concrete bridge over the main river crossing. Includes foundation work, structural elements, and safety features.',
    requirements: 'Minimum 10 years experience in bridge construction. Structural engineering certification required.',
    submissionDeadline: new Date('2023-12-15T23:59:59Z'),
    status: 'Awarded',
    publishedDate: new Date('2023-11-01T08:00:00Z'),
    closedDate: new Date('2023-12-20T10:00:00Z'),
    winnerId: 8,
    createdBy: 1,
    createdAt: new Date('2023-10-25T10:00:00Z'),
    updatedAt: new Date('2023-12-20T10:00:00Z'),
    documents: [],
    submissions: []
  },
  {
    id: 5,
    title: 'Road Rehabilitation Phase 2',
    description: 'Complete rehabilitation of 15km of main access road including drainage improvements and signage.',
    requirements: 'Road construction experience. Traffic management certification required.',
    submissionDeadline: new Date('2023-11-30T23:59:59Z'),
    status: 'Closed',
    publishedDate: new Date('2023-10-15T08:00:00Z'),
    closedDate: new Date('2023-12-01T09:00:00Z'),
    createdBy: 1,
    createdAt: new Date('2023-10-10T14:00:00Z'),
    updatedAt: new Date('2023-12-01T09:00:00Z'),
    documents: [],
    submissions: []
  },
  {
    id: 6,
    title: 'Waste Management Facility',
    description: 'Design and construction of modern waste processing facility with recycling capabilities.',
    requirements: 'Environmental engineering expertise. Waste management certification required.',
    submissionDeadline: new Date('2023-09-30T23:59:59Z'),
    status: 'Awarded',
    publishedDate: new Date('2023-08-01T08:00:00Z'),
    closedDate: new Date('2023-10-05T11:00:00Z'),
    winnerId: 9,
    createdBy: 1,
    createdAt: new Date('2023-07-20T10:00:00Z'),
    updatedAt: new Date('2023-10-05T11:00:00Z'),
    documents: [],
    submissions: []
  }
]