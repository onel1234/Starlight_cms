import { 
  Quotation, 
  PurchaseOrder, 
  Invoice, 
  Payment, 
  QuotationItem,
  PurchaseOrderItem,
  InvoiceItem,
  CreateQuotationData,
  CreatePurchaseOrderData,
  CreateInvoiceData
} from '../types/financial';
import { 
  mockQuotations, 
  mockPurchaseOrders, 
  mockInvoices, 
  mockPayments,
  mockFinancialAnalytics 
} from '../data/mockFinancial';

class MockFinancialService {
  private quotations: Quotation[] = [...mockQuotations];
  private purchaseOrders: PurchaseOrder[] = [...mockPurchaseOrders];
  private invoices: Invoice[] = [...mockInvoices];
  private payments: Payment[] = [...mockPayments];

  // Quotation methods
  async getQuotations(): Promise<Quotation[]> {
    await this.delay(500);
    return this.quotations;
  }

  async getQuotation(id: number): Promise<Quotation | null> {
    await this.delay(300);
    return this.quotations.find(q => q.id === id) || null;
  }

  async createQuotation(data: CreateQuotationData): Promise<Quotation> {
    await this.delay(800);
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = totalAmount * 0.1; // 10% tax
    
    const newQuotation: Quotation = {
      id: Math.max(...this.quotations.map(q => q.id)) + 1,
      quotationNumber: `QUO-2024-${String(this.quotations.length + 1).padStart(3, '0')}`,
      ...data,
      totalAmount: totalAmount + taxAmount,
      taxAmount,
      discountAmount: 0,
      status: 'Draft',
      createdBy: 1, // Mock user ID
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    };
    this.quotations.push(newQuotation);
    return newQuotation;
  }

  async updateQuotation(id: number, data: Partial<Quotation>): Promise<Quotation> {
    await this.delay(600);
    const index = this.quotations.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Quotation not found');
    
    this.quotations[index] = {
      ...this.quotations[index],
      ...data,
      updatedAt: new Date()
    };
    return this.quotations[index];
  }

  async deleteQuotation(id: number): Promise<void> {
    await this.delay(400);
    this.quotations = this.quotations.filter(q => q.id !== id);
  }

  async addQuotationItem(quotationId: number, item: Omit<QuotationItem, 'id' | 'quotationId'>): Promise<QuotationItem> {
    await this.delay(400);
    const quotation = this.quotations.find(q => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const newItem: QuotationItem = {
      id: Math.max(...(quotation.items?.map(i => i.id) || [0])) + 1,
      quotationId,
      ...item
    };

    if (!quotation.items) quotation.items = [];
    quotation.items.push(newItem);

    // Recalculate totals
    const subtotal = quotation.items.reduce((sum, item) => sum + item.totalPrice, 0);
    quotation.totalAmount = subtotal + quotation.taxAmount - quotation.discountAmount;
    quotation.updatedAt = new Date();

    return newItem;
  }

  // Purchase Order methods
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    await this.delay(500);
    return this.purchaseOrders;
  }

  async getPurchaseOrder(id: number): Promise<PurchaseOrder | null> {
    await this.delay(300);
    return this.purchaseOrders.find(po => po.id === id) || null;
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData): Promise<PurchaseOrder> {
    await this.delay(800);
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = totalAmount * 0.1; // 10% tax
    
    const newPO: PurchaseOrder = {
      id: Math.max(...this.purchaseOrders.map(po => po.id)) + 1,
      purchaseOrderNumber: `PO-2024-${String(this.purchaseOrders.length + 1).padStart(3, '0')}`,
      ...data,
      totalAmount: totalAmount + taxAmount,
      taxAmount,
      status: 'Pending',
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    };
    this.purchaseOrders.push(newPO);
    return newPO;
  }

  async updatePurchaseOrder(id: number, data: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    await this.delay(600);
    const index = this.purchaseOrders.findIndex(po => po.id === id);
    if (index === -1) throw new Error('Purchase Order not found');
    
    this.purchaseOrders[index] = {
      ...this.purchaseOrders[index],
      ...data,
      updatedAt: new Date()
    };
    return this.purchaseOrders[index];
  }

  // Invoice methods
  async getInvoices(): Promise<Invoice[]> {
    await this.delay(500);
    return this.invoices;
  }

  async getInvoice(id: number): Promise<Invoice | null> {
    await this.delay(300);
    return this.invoices.find(inv => inv.id === id) || null;
  }

  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    await this.delay(800);
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = totalAmount * 0.1; // 10% tax
    
    const newInvoice: Invoice = {
      id: Math.max(...this.invoices.map(inv => inv.id)) + 1,
      invoiceNumber: `INV-2024-${String(this.invoices.length + 1).padStart(3, '0')}`,
      ...data,
      totalAmount: totalAmount + taxAmount,
      taxAmount,
      discountAmount: 0,
      status: 'Draft',
      createdBy: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: []
    };
    this.invoices.push(newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: number, data: Partial<Invoice>): Promise<Invoice> {
    await this.delay(600);
    const index = this.invoices.findIndex(inv => inv.id === id);
    if (index === -1) throw new Error('Invoice not found');
    
    this.invoices[index] = {
      ...this.invoices[index],
      ...data,
      updatedAt: new Date()
    };
    return this.invoices[index];
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    await this.delay(500);
    return this.payments;
  }

  async createPayment(data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    await this.delay(600);
    const newPayment: Payment = {
      id: Math.max(...this.payments.map(p => p.id)) + 1,
      ...data,
      status: 'Paid',
      createdAt: new Date()
    };
    this.payments.push(newPayment);

    // Update invoice status
    const invoice = this.invoices.find(inv => inv.id === data.invoiceId);
    if (invoice) {
      const totalPaid = this.payments
        .filter(p => p.invoiceId === data.invoiceId && p.status === 'Paid')
        .reduce((sum, p) => sum + p.amount, 0);
      
      if (totalPaid >= invoice.totalAmount) {
        invoice.status = 'Paid';
        invoice.paidDate = new Date();
      } else if (totalPaid > 0) {
        invoice.status = 'Partial';
      }
      invoice.updatedAt = new Date();
    }

    return newPayment;
  }

  // Analytics methods
  async getFinancialAnalytics() {
    await this.delay(700);
    return mockFinancialAnalytics;
  }

  async generatePDF(type: 'quotation' | 'invoice', id: number): Promise<Blob> {
    await this.delay(1000);
    // Mock PDF generation
    const content = `Mock ${type.toUpperCase()} PDF for ID: ${id}`;
    return new Blob([content], { type: 'application/pdf' });
  }

  async sendEmail(type: 'quotation' | 'invoice', id: number, email: string): Promise<void> {
    await this.delay(800);
    console.log(`Mock email sent: ${type} ${id} to ${email}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const mockFinancialService = new MockFinancialService();