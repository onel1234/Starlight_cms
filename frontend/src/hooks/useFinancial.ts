import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockFinancialService } from '../services/mockFinancialService';
import { 
  Quotation, 
  PurchaseOrder, 
  Invoice, 
  Payment,
  CreateQuotationData,
  CreatePurchaseOrderData,
  CreateInvoiceData
} from '../types/financial';

// Quotation hooks
export const useQuotations = () => {
  return useQuery({
    queryKey: ['quotations'],
    queryFn: () => mockFinancialService.getQuotations(),
  });
};

export const useQuotation = (id: number) => {
  return useQuery({
    queryKey: ['quotation', id],
    queryFn: () => mockFinancialService.getQuotation(id),
    enabled: !!id,
  });
};

export const useCreateQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateQuotationData) => mockFinancialService.createQuotation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Quotation> }) => 
      mockFinancialService.updateQuotation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', id] });
    },
  });
};

export const useDeleteQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => mockFinancialService.deleteQuotation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
  });
};

// Purchase Order hooks
export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => mockFinancialService.getPurchaseOrders(),
  });
};

export const usePurchaseOrder = (id: number) => {
  return useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => mockFinancialService.getPurchaseOrder(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderData) => mockFinancialService.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PurchaseOrder> }) => 
      mockFinancialService.updatePurchaseOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] });
    },
  });
};

// Invoice hooks
export const useInvoices = () => {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: () => mockFinancialService.getInvoices(),
  });
};

export const useInvoice = (id: number) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => mockFinancialService.getInvoice(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateInvoiceData) => mockFinancialService.createInvoice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Invoice> }) => 
      mockFinancialService.updateInvoice(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoice', id] });
    },
  });
};

// Payment hooks
export const usePayments = () => {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => mockFinancialService.getPayments(),
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Payment, 'id' | 'createdAt'>) => mockFinancialService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });
};

// Analytics hooks
export const useFinancialAnalytics = () => {
  return useQuery({
    queryKey: ['financialAnalytics'],
    queryFn: () => mockFinancialService.getFinancialAnalytics(),
  });
};

// PDF and Email hooks
export const useGeneratePDF = () => {
  return useMutation({
    mutationFn: ({ type, id }: { type: 'quotation' | 'invoice'; id: number }) => 
      mockFinancialService.generatePDF(type, id),
  });
};

export const useSendEmail = () => {
  return useMutation({
    mutationFn: ({ type, id, email }: { type: 'quotation' | 'invoice'; id: number; email: string }) => 
      mockFinancialService.sendEmail(type, id, email),
  });
};