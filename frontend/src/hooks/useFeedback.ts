import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockFeedbackService } from '../services/mockFeedbackService'
import { CreateFeedbackData, UpdateFeedbackData } from '../types/feedback'
import { useToast } from '../contexts/ToastContext'

export const useFeedback = () => {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => mockFeedbackService.getFeedback()
  })
}

export const useFeedbackById = (id: number) => {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => mockFeedbackService.getFeedbackById(id),
    enabled: !!id
  })
}

export const useFeedbackByCustomer = (customerId: number) => {
  return useQuery({
    queryKey: ['feedback', 'customer', customerId],
    queryFn: () => mockFeedbackService.getFeedbackByCustomer(customerId),
    enabled: !!customerId
  })
}

export const useFeedbackByProject = (projectId: number) => {
  return useQuery({
    queryKey: ['feedback', 'project', projectId],
    queryFn: () => mockFeedbackService.getFeedbackByProject(projectId),
    enabled: !!projectId
  })
}

export const useFeedbackAnalytics = () => {
  return useQuery({
    queryKey: ['feedback', 'analytics'],
    queryFn: () => mockFeedbackService.getFeedbackAnalytics()
  })
}

export const useSearchFeedback = (query: string) => {
  return useQuery({
    queryKey: ['feedback', 'search', query],
    queryFn: () => mockFeedbackService.searchFeedback(query),
    enabled: !!query && query.length > 2
  })
}

export const useCreateFeedback = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: CreateFeedbackData) => mockFeedbackService.createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({ queryKey: ['feedback', 'analytics'] })
      showToast('Feedback submitted successfully', 'success')
    },
    onError: () => {
      showToast('Failed to submit feedback', 'error')
    }
  })
}

export const useUpdateFeedback = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFeedbackData }) => 
      mockFeedbackService.updateFeedback(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({ queryKey: ['feedback', id] })
      queryClient.invalidateQueries({ queryKey: ['feedback', 'analytics'] })
      showToast('Feedback updated successfully', 'success')
    },
    onError: () => {
      showToast('Failed to update feedback', 'error')
    }
  })
}

export const useRespondToFeedback = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, responseText }: { id: number; responseText: string }) => 
      mockFeedbackService.respondToFeedback(id, responseText),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({ queryKey: ['feedback', id] })
      queryClient.invalidateQueries({ queryKey: ['feedback', 'analytics'] })
      showToast('Response sent successfully', 'success')
    },
    onError: () => {
      showToast('Failed to send response', 'error')
    }
  })
}

export const useDeleteFeedback = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: number) => mockFeedbackService.deleteFeedback(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] })
      queryClient.invalidateQueries({ queryKey: ['feedback', 'analytics'] })
      showToast('Feedback deleted successfully', 'success')
    },
    onError: () => {
      showToast('Failed to delete feedback', 'error')
    }
  })
}