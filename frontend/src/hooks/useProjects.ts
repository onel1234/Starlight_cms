import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockProjectService as projectService, ProjectFilters } from '../services/mockProjectService'
import { CreateProjectData, UpdateProjectData, Project } from '../types/project'
import { useToast } from '../contexts/ToastContext'

export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectService.getProjects(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useProject = (id: number) => {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  })
}

export const useProjectStats = (id: number) => {
  return useQuery({
    queryKey: ['project-stats', id],
    queryFn: () => projectService.getProjectStats(id),
    enabled: !!id,
  })
}

export const useProjectTasks = (projectId: number) => {
  return useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: () => projectService.getProjectTasks(projectId),
    enabled: !!projectId,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: CreateProjectData) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      success('Project created successfully')
    },
    onError: (err: any) => {
      error('Failed to create project', err.message)
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProjectData }) =>
      projectService.updateProject(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['project-stats', id] })
      success('Project updated successfully')
    },
    onError: (err: any) => {
      error('Failed to update project', err.message)
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: number) => projectService.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      success('Project deleted successfully')
    },
    onError: (err: any) => {
      error('Failed to delete project', err.message)
    },
  })
}

export const useApproveProject = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: number) => projectService.approveProject(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      success('Project approved successfully')
    },
    onError: (err: any) => {
      error('Failed to approve project', err.message)
    },
  })
}