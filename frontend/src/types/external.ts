export interface CustomerProject {
  id: number
  name: string
  description?: string
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed'
  startDate: Date
  endDate: Date
  budget: number
  actualCost: number
  location?: string
  projectType?: string
  progress: number
  milestones: ProjectMilestone[]
  documents: ProjectDocument[]
  timeline: TimelineEvent[]
}

export interface ProjectMilestone {
  id: number
  projectId: number
  title: string
  description?: string
  dueDate: Date
  completedDate?: Date
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
  progress: number
}

export interface ProjectDocument {
  id: number
  projectId: number
  name: string
  type: string
  url: string
  uploadedAt: Date
  size: number
  category: 'Contract' | 'Drawing' | 'Report' | 'Invoice' | 'Other'
}

export interface TimelineEvent {
  id: number
  projectId: number
  title: string
  description?: string
  date: Date
  type: 'milestone' | 'task' | 'meeting' | 'delivery' | 'payment'
  status: 'completed' | 'upcoming' | 'overdue'
}

export interface SupplierTender {
  id: number
  title: string
  description: string
  category: string
  submissionDeadline: Date
  status: 'Open' | 'Closed' | 'Awarded'
  requirements: string[]
  documents: TenderDocument[]
  estimatedValue?: number
  contactPerson: string
  contactEmail: string
}

export interface TenderDocument {
  id: number
  tenderId: number
  name: string
  type: string
  url: string
  required: boolean
  description?: string
}

export interface SupplierQuotation {
  id: number
  tenderId: number
  supplierId: number
  quotationNumber: string
  totalAmount: number
  validUntil: Date
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Accepted' | 'Rejected'
  items: QuotationItem[]
  notes?: string
  submittedAt?: Date
}

export interface QuotationItem {
  id: number
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specifications?: string
}

export interface SupplierOrder {
  id: number
  orderNumber: string
  supplierId: number
  totalAmount: number
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Shipped' | 'Delivered' | 'Completed'
  orderDate: Date
  expectedDeliveryDate: Date
  actualDeliveryDate?: Date
  items: OrderItem[]
  deliveryAddress: string
  trackingNumber?: string
  notes?: string
}

export interface OrderItem {
  id: number
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  status: 'Pending' | 'Confirmed' | 'In Production' | 'Shipped' | 'Delivered'
}

export interface ExternalMessage {
  id: number
  senderId: number
  receiverId: number
  subject: string
  content: string
  sentAt: Date
  readAt?: Date
  attachments?: MessageAttachment[]
  threadId?: number
  type: 'inquiry' | 'update' | 'notification' | 'support'
}

export interface MessageAttachment {
  id: number
  messageId: number
  name: string
  url: string
  size: number
  type: string
}

export interface MessageThread {
  id: number
  subject: string
  participants: number[]
  lastMessageAt: Date
  unreadCount: number
  messages: ExternalMessage[]
}