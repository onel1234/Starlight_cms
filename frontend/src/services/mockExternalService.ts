import { 
  CustomerProject, 
  SupplierTender, 
  SupplierQuotation, 
  SupplierOrder, 
  ExternalMessage,
  MessageThread 
} from '../types/external'
import { 
  mockCustomerProjects, 
  mockSupplierTenders, 
  mockSupplierQuotations, 
  mockSupplierOrders,
  mockExternalMessages,
  mockMessageThreads 
} from '../data/mockExternal'

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockExternalService = {
  // Customer Portal Services
  async getCustomerProjects(customerId: number): Promise<CustomerProject[]> {
    await delay(800)
    // Filter projects by customer ID (in real implementation, this would be done by backend)
    // For demo purposes, show projects for customer IDs 101-103
    if ([101, 102, 103].includes(customerId)) {
      return mockCustomerProjects
    }
    return []
  },

  async getCustomerProject(customerId: number, projectId: number): Promise<CustomerProject | null> {
    await delay(600)
    // Verify customer has access to this project
    if ([101, 102, 103].includes(customerId)) {
      return mockCustomerProjects.find(p => p.id === projectId) || null
    }
    return null
  },

  async submitCustomerFeedback(projectId: number, feedback: {
    rating: number
    category: string
    message: string
  }): Promise<{ success: boolean; message: string }> {
    await delay(1000)
    console.log('Customer feedback submitted:', { projectId, feedback })
    return { success: true, message: 'Feedback submitted successfully' }
  },

  // Supplier Portal Services
  async getAvailableTenders(supplierId: number): Promise<SupplierTender[]> {
    await delay(800)
    // Show tenders for supplier IDs 201-204
    if ([201, 202, 203, 204].includes(supplierId)) {
      return mockSupplierTenders.filter(t => t.status === 'Open')
    }
    return []
  },

  async getTenderDetails(tenderId: number): Promise<SupplierTender | null> {
    await delay(600)
    return mockSupplierTenders.find(t => t.id === tenderId) || null
  },

  async submitQuotation(quotation: Omit<SupplierQuotation, 'id' | 'submittedAt'>): Promise<{ 
    success: boolean; 
    quotationId?: number; 
    message: string 
  }> {
    await delay(1200)
    console.log('Quotation submitted:', quotation)
    return { 
      success: true, 
      quotationId: Math.floor(Math.random() * 1000) + 100,
      message: 'Quotation submitted successfully' 
    }
  },

  async getSupplierQuotations(supplierId: number): Promise<SupplierQuotation[]> {
    await delay(700)
    return mockSupplierQuotations.filter(q => q.supplierId === supplierId)
  },

  async getSupplierOrders(supplierId: number): Promise<SupplierOrder[]> {
    await delay(800)
    return mockSupplierOrders.filter(o => o.supplierId === supplierId)
  },

  async updateOrderStatus(orderId: number, status: SupplierOrder['status'], trackingInfo?: {
    trackingNumber?: string
    notes?: string
  }): Promise<{ success: boolean; message: string }> {
    await delay(1000)
    console.log('Order status updated:', { orderId, status, trackingInfo })
    return { success: true, message: 'Order status updated successfully' }
  },

  // Communication Services
  async getMessageThreads(userId: number): Promise<MessageThread[]> {
    await delay(600)
    return mockMessageThreads.filter(thread => 
      thread.participants.includes(userId)
    )
  },

  async getThreadMessages(threadId: number): Promise<ExternalMessage[]> {
    await delay(500)
    const thread = mockMessageThreads.find(t => t.id === threadId)
    return thread?.messages || []
  },

  async sendMessage(message: Omit<ExternalMessage, 'id' | 'sentAt'>): Promise<{ 
    success: boolean; 
    messageId?: number; 
    message: string 
  }> {
    await delay(800)
    console.log('Message sent:', message)
    return { 
      success: true, 
      messageId: Math.floor(Math.random() * 1000) + 100,
      message: 'Message sent successfully' 
    }
  },

  async markMessageAsRead(messageId: number): Promise<{ success: boolean }> {
    await delay(300)
    console.log('Message marked as read:', messageId)
    return { success: true }
  },

  // Document Services
  async downloadDocument(documentId: number): Promise<{ success: boolean; url?: string; message: string }> {
    await delay(1000)
    console.log('Document download requested:', documentId)
    return { 
      success: true, 
      url: `/api/documents/download/${documentId}`,
      message: 'Document download started' 
    }
  },

  async uploadDocument(file: File, metadata: {
    projectId?: number
    tenderId?: number
    category: string
    description?: string
  }): Promise<{ success: boolean; documentId?: number; message: string }> {
    await delay(2000)
    console.log('Document uploaded:', { fileName: file.name, metadata })
    return { 
      success: true, 
      documentId: Math.floor(Math.random() * 1000) + 100,
      message: 'Document uploaded successfully' 
    }
  }
}