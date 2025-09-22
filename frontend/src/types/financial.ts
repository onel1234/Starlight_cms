import { User } from './auth'
import { Project } from './project'
import { Product } from './inventory'

export type QuotationStatus = 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'
export type PurchaseOrderStatus = 'Pending' | 'Approved' | 'Delivered' | 'Completed'
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partial' | 'Overdue'
export type PaymentStatus = 'Pending' | 'Paid' | 'Partial' | 'Overdue' | 'Cancelled'

export interface QuotationItem {
  id: number
  quotationId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  description?: string
  product?: Product
}

export interface Quotation {
  id: number
  quotationNumber: string
  customerId: number
  projectId?: number
  totalAmount: number
  taxAmount: number
  discountAmount: number
  status: QuotationStatus
  validUntil?: Date
  notes?: string
  createdBy: number
  createdAt: Date
  updatedAt: Date
  customer?: User
  project?: Project
  items?: QuotationItem[]
}

export interface PurchaseOrderItem {
  id: number
  purchaseOrderId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  description?: string
  product?: Product
}

export interface PurchaseOrder {
  id: number
  purchaseOrderNumber: string
  supplierId: number
  quotationId?: number
  totalAmount: number
  taxAmount: number
  status: PurchaseOrderStatus
  orderDate: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  notes?: string
  createdBy: number
  createdAt: Date
  updatedAt: Date
  supplier?: User
  quotation?: Quotation
  items?: PurchaseOrderItem[]
}

export interface InvoiceItem {
  id: number
  invoiceId: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  description?: string
  product?: Product
}

export interface Invoice {
  id: number
  invoiceNumber: string
  customerId: number
  purchaseOrderId?: number
  totalAmount: number
  taxAmount: number
  discountAmount: number
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  notes?: string
  createdBy: number
  createdAt: Date
  updatedAt: Date
  customer?: User
  purchaseOrder?: PurchaseOrder
  items?: InvoiceItem[]
}

export interface Payment {
  id: number
  invoiceId: number
  amount: number
  paymentMethod: string
  paymentDate: Date
  status: PaymentStatus
  transactionId?: string
  notes?: string
  createdBy: number
  createdAt: Date
  invoice?: Invoice
}

export interface CreateQuotationData {
  customerId: number
  projectId?: number
  validUntil?: Date
  notes?: string
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
    description?: string
  }>
}

export interface CreatePurchaseOrderData {
  supplierId: number
  quotationId?: number
  orderDate: Date
  expectedDeliveryDate?: Date
  notes?: string
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
    description?: string
  }>
}

export interface CreateInvoiceData {
  customerId: number
  purchaseOrderId?: number
  issueDate: Date
  dueDate: Date
  notes?: string
  items: Array<{
    productId: number
    quantity: number
    unitPrice: number
    description?: string
  }>
}