import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockExternalService } from '../services/mockExternalService'
import { useToast } from '../contexts/ToastContext'
import { 
  CustomerProject, 
  SupplierTender, 
  SupplierQuotation, 
  SupplierOrder, 
  ExternalMessage,
  MessageThread 
} from '../types/external'

// Customer Portal Hooks
export const useCustomerProjects = (customerId: number) => {
  return useQuery({
    queryKey: ['customer-projects', customerId],
    queryFn: () => mockExternalService.getCustomerProjects(customerId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCustomerProject = (customerId: number, projectId: number) => {
  return useQuery({
    queryKey: ['customer-project', customerId, projectId],
    queryFn: () => mockExternalService.getCustomerProject(customerId, projectId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useSubmitCustomerFeedback = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ projectId, feedback }: {
      projectId: number
      feedback: { rating: number; category: string; message: string }
    }) => mockExternalService.submitCustomerFeedback(projectId, feedback),
    onSuccess: (data) => {
      success(data.message)
      queryClient.invalidateQueries({ queryKey: ['customer-projects'] })
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to submit feedback')
    }
  })
}

// Supplier Portal Hooks
export const useAvailableTenders = (supplierId: number) => {
  return useQuery({
    queryKey: ['available-tenders', supplierId],
    queryFn: () => mockExternalService.getAvailableTenders(supplierId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useTenderDetails = (tenderId: number) => {
  return useQuery({
    queryKey: ['tender-details', tenderId],
    queryFn: () => mockExternalService.getTenderDetails(tenderId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSubmitQuotation = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (quotation: Omit<SupplierQuotation, 'id' | 'submittedAt'>) => 
      mockExternalService.submitQuotation(quotation),
    onSuccess: (data) => {
      success(data.message)
      queryClient.invalidateQueries({ queryKey: ['supplier-quotations'] })
      queryClient.invalidateQueries({ queryKey: ['available-tenders'] })
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to submit quotation')
    }
  })
}

export const useSupplierQuotations = (supplierId: number) => {
  return useQuery({
    queryKey: ['supplier-quotations', supplierId],
    queryFn: () => mockExternalService.getSupplierQuotations(supplierId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useSupplierOrders = (supplierId: number) => {
  return useQuery({
    queryKey: ['supplier-orders', supplierId],
    queryFn: () => mockExternalService.getSupplierOrders(supplierId),
    staleTime: 3 * 60 * 1000, // 3 minutes
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ orderId, status, trackingInfo }: {
      orderId: number
      status: SupplierOrder['status']
      trackingInfo?: { trackingNumber?: string; notes?: string }
    }) => mockExternalService.updateOrderStatus(orderId, status, trackingInfo),
    onSuccess: (data) => {
      success(data.message)
      queryClient.invalidateQueries({ queryKey: ['supplier-orders'] })
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to update order status')
    }
  })
}

// Communication Hooks
export const useMessageThreads = (userId: number) => {
  return useQuery({
    queryKey: ['message-threads', userId],
    queryFn: () => mockExternalService.getMessageThreads(userId),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

export const useThreadMessages = (threadId: number) => {
  return useQuery({
    queryKey: ['thread-messages', threadId],
    queryFn: () => mockExternalService.getThreadMessages(threadId),
    staleTime: 30 * 1000, // 30 seconds
  })
}

export const useSendMessage = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (message: Omit<ExternalMessage, 'id' | 'sentAt'>) => 
      mockExternalService.sendMessage(message),
    onSuccess: (data) => {
      success(data.message)
      queryClient.invalidateQueries({ queryKey: ['message-threads'] })
      queryClient.invalidateQueries({ queryKey: ['thread-messages'] })
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to send message')
    }
  })
}

export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (messageId: number) => mockExternalService.markMessageAsRead(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-threads'] })
      queryClient.invalidateQueries({ queryKey: ['thread-messages'] })
    }
  })
}

// Document Hooks
export const useDownloadDocument = () => {
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (documentId: number) => mockExternalService.downloadDocument(documentId),
    onSuccess: (data) => {
      if (data.success && data.url) {
        // In a real app, this would trigger the download
        window.open(data.url, '_blank')
        success(data.message)
      }
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to download document')
    }
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ file, metadata }: {
      file: File
      metadata: {
        projectId?: number
        tenderId?: number
        category: string
        description?: string
      }
    }) => mockExternalService.uploadDocument(file, metadata),
    onSuccess: (data) => {
      success(data.message)
      queryClient.invalidateQueries({ queryKey: ['customer-projects'] })
      queryClient.invalidateQueries({ queryKey: ['available-tenders'] })
    },
    onError: (err: Error) => {
      error(err.message || 'Failed to upload document')
    }
  })
}