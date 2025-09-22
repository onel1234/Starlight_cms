import { Quotation, PurchaseOrder, Invoice, Payment } from '../types/financial';

// Mock quotations data
export const mockQuotations: Quotation[] = [
  {
    id: 1,
    quotationNumber: 'QUO-2024-001',
    customerId: 1,
    projectId: 1,
    projectName: 'Water Treatment Plant',
    totalAmount: 125000,
    taxAmount: 12500,
    discountAmount: 2500,
    status: 'Sent',
    validUntil: new Date('2024-12-31'),
    notes: 'Standard construction materials package',
    createdBy: 1,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    items: [
      {
        id: 1,
        quotationId: 1,
        productId: 1,
        quantity: 100,
        unitPrice: 850,
        totalPrice: 85000,
        description: '6-inch steel pipes for main water line'
      },
      {
        id: 2,
        quotationId: 1,
        productId: 2,
        quantity: 50,
        unitPrice: 800,
        totalPrice: 40000,
        description: 'High-grade concrete for foundation'
      }
    ]
  },
  {
    id: 2,
    quotationNumber: 'QUO-2024-002',
    customerId: 2,
    projectId: 2,
    projectName: 'Sewerage System Upgrade',
    totalAmount: 89500,
    taxAmount: 8950,
    discountAmount: 0,
    status: 'Approved',
    validUntil: new Date('2024-11-30'),
    notes: 'Urgent project - expedited delivery required',
    createdBy: 1,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    items: []
  }
];

// Mock purchase orders data
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 1,
    purchaseOrderNumber: 'PO-2024-001',
    quotationId: 2,
    supplierId: 1,
    totalAmount: 89500,
    taxAmount: 8950,
    status: 'Approved',
    orderDate: new Date('2024-02-06'),
    expectedDeliveryDate: new Date('2024-02-20'),
    actualDeliveryDate: new Date('2024-02-18'),
    notes: 'Delivered ahead of schedule',
    createdBy: 1,
    createdAt: new Date('2024-02-06'),
    updatedAt: new Date('2024-02-18'),
    items: [
      {
        id: 1,
        purchaseOrderId: 1,
        productId: 1,
        productName: 'Steel Pipes',
        quantity: 80,
        unitPrice: 850,
        totalPrice: 68000,
        description: '6-inch steel pipes'
      }
    ]
  },
  {
    id: 2,
    purchaseOrderNumber: 'PO-2024-002',
    quotationId: 1,
    supplierId: 2,
    totalAmount: 45000,
    taxAmount: 4500,
    status: 'Pending',
    orderDate: new Date('2024-02-10'),
    expectedDeliveryDate: new Date('2024-02-25'),
    notes: 'Awaiting supplier confirmation',
    createdBy: 1,
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-10'),
    items: []
  }
];

// Mock invoices data
export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2024-001',
    purchaseOrderId: 1,
    customerId: 2,
    customerName: 'City Water Works',
    totalAmount: 89500,
    taxAmount: 8950,
    discountAmount: 0,
    status: 'Paid',
    issueDate: new Date('2024-02-20'),
    dueDate: new Date('2024-03-20'),
    paidDate: new Date('2024-03-15'),
    notes: 'Payment received on time',
    createdBy: 1,
    createdAt: new Date('2024-02-20'),
    updatedAt: new Date('2024-03-15'),
    items: [
      {
        id: 1,
        invoiceId: 1,
        productId: 1,
        productName: 'Steel Pipes',
        quantity: 80,
        unitPrice: 850,
        totalPrice: 68000,
        description: '6-inch steel pipes - delivered'
      }
    ]
  },
  {
    id: 2,
    invoiceNumber: 'INV-2024-002',
    purchaseOrderId: 2,
    customerId: 1,
    customerName: 'ABC Construction Ltd',
    totalAmount: 125000,
    taxAmount: 12500,
    discountAmount: 2500,
    status: 'Overdue',
    issueDate: new Date('2024-01-20'),
    dueDate: new Date('2024-02-20'),
    notes: 'Payment reminder sent',
    createdBy: 1,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-25'),
    items: []
  }
];

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: 1,
    invoiceId: 1,
    amount: 89500,
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date('2024-03-15'),
    transactionId: 'TXN-2024-001',
    status: 'Paid',
    notes: 'Full payment received',
    createdBy: 1,
    createdAt: new Date('2024-03-15')
  },
  {
    id: 2,
    invoiceId: 2,
    amount: 62500,
    paymentMethod: 'Check',
    paymentDate: new Date('2024-02-28'),
    transactionId: 'CHK-001234',
    status: 'Paid',
    notes: 'Partial payment - 50% of total',
    createdBy: 1,
    createdAt: new Date('2024-02-28')
  }
];

// Mock financial analytics data
export const mockFinancialAnalytics = {
  totalRevenue: 2450000,
  totalExpenses: 1890000,
  netProfit: 560000,
  profitMargin: 22.9,
  outstandingInvoices: 187500,
  overdueInvoices: 62500,
  monthlyRevenue: [
    { month: 'Jan', revenue: 185000, expenses: 142000 },
    { month: 'Feb', revenue: 220000, expenses: 168000 },
    { month: 'Mar', revenue: 195000, expenses: 155000 },
    { month: 'Apr', revenue: 240000, expenses: 185000 },
    { month: 'May', revenue: 210000, expenses: 162000 },
    { month: 'Jun', revenue: 225000, expenses: 175000 }
  ],
  paymentStatus: [
    { status: 'Paid', count: 45, amount: 1250000 },
    { status: 'Pending', count: 12, amount: 325000 },
    { status: 'Overdue', count: 8, amount: 187500 },
    { status: 'Partial', count: 5, amount: 125000 }
  ]
};