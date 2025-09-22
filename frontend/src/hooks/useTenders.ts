import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockTenderService } from '../services/mockTenderService'
import { CreateTenderData, UpdateTenderData, CreateTenderSubmissionData } from '../types/tender'
import { useToast } from '../contexts/ToastContext'

export const useTenders = () => {
  return useQuery({
    queryKey: ['tenders'],
    queryFn: () => mockTenderService.getTenders()
  })
}

export const usePublicTenders = () => {
  return useQuery({
    queryKey: ['tenders', 'public'],
    queryFn: () => mockTenderService.getPublicTenders()
  })
}

export const useTender = (id: number) => {
  return useQuery({
    queryKey: ['tenders', id],
    queryFn: () => mockTenderService.getTenderById(id),
    enabled: !!id
  })
}

export const useTenderSubmissions = (tenderId: number) => {
  return useQuery({
    queryKey: ['tenders', tenderId, 'submissions'],
    queryFn: () => mockTenderService.getTenderSubmissions(tenderId),
    enabled: !!tenderId
  })
}

export const useCreateTender = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTenderData) => mockTenderService.createTender(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] })
      showToast('Tender created successfully', 'success')
    },
    onError: () => {
      showToast('Failed to create tender', 'error')
    }
  })
}

export const useUpdateTender = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTenderData }) => 
      mockTenderService.updateTender(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] })
      queryClient.invalidateQueries({ queryKey: ['tenders', id] })
      showToast('Tender updated successfully', 'success')
    },
    onError: () => {
      showToast('Failed to update tender', 'error')
    }
  })
}

export const useDeleteTender = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: number) => mockTenderService.deleteTender(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] })
      showToast('Tender deleted successfully', 'success')
    },
    onError: () => {
      showToast('Failed to delete tender', 'error')
    }
  })
}

export const usePublishTender = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (id: number) => mockTenderService.publishTender(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] })
      queryClient.invalidateQueries({ queryKey: ['tenders', id] })
      queryClient.invalidateQueries({ queryKey: ['tenders', 'public'] })
      showToast('Tender published successfully', 'success')
    },
    onError: () => {
      showToast('Failed to publish tender', 'error')
    }
  })
}

export const useCloseTender = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, winnerId }: { id: number; winnerId?: number }) => 
      mockTenderService.closeTender(id, winnerId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] })
      queryClient.invalidateQueries({ queryKey: ['tenders', id] })
      queryClient.invalidateQueries({ queryKey: ['tenders', 'public'] })
      showToast('Tender closed successfully', 'success')
    },
    onError: () => {
      showToast('Failed to close tender', 'error')
    }
  })
}

export const useCreateTenderSubmission = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: CreateTenderSubmissionData) => 
      mockTenderService.createTenderSubmission(data),
    onSuccess: (_, data) => {
      queryClient.invalidateQueries({ queryKey: ['tenders', data.tenderId, 'submissions'] })
      queryClient.invalidateQueries({ queryKey: ['tenders', data.tenderId] })
      showToast('Submission created successfully', 'success')
    },
    onError: () => {
      showToast('Failed to create submission', 'error')
    }
  })
}

export const useUpdateSubmissionStatus = () => {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ 
      id, 
      status, 
      evaluationScore, 
      evaluationNotes 
    }: { 
      id: number
      status: string
      evaluationScore?: number
      evaluationNotes?: string 
    }) => mockTenderService.updateSubmissionStatus(id, status as any, evaluationScore, evaluationNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] })
      showToast('Submission status updated successfully', 'success')
    },
    onError: () => {
      showToast('Failed to update submission status', 'error')
    }
  })
}

export const useUploadTenderDocument = () => {
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ tenderId, file }: { tenderId: number; file: File }) => 
      mockTenderService.uploadTenderDocument(tenderId, file),
    onSuccess: () => {
      showToast('Document uploaded successfully', 'success')
    },
    onError: () => {
      showToast('Failed to upload document', 'error')
    }
  })
}