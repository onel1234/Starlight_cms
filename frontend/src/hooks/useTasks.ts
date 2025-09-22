import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockTaskService as taskService, TaskFilters } from '../services/mockTaskService'
import { CreateTaskData, UpdateTaskData } from '../types/project'
import { useToast } from '../contexts/ToastContext'

export const useTasks = (filters?: TaskFilters) => {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useTask = (id: number) => {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getTask(id),
    enabled: !!id,
  })
}

export const useTaskDependencies = (taskId: number) => {
  return useQuery({
    queryKey: ['task-dependencies', taskId],
    queryFn: () => taskService.getTaskDependencies(taskId),
    enabled: !!taskId,
  })
}

export const useTimeLogs = (taskId: number) => {
  return useQuery({
    queryKey: ['time-logs', taskId],
    queryFn: () => taskService.getTimeLogs(taskId),
    enabled: !!taskId,
  })
}

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => taskService.getUsers(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (data: CreateTaskData) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      success('Task created successfully')
    },
    onError: (err: any) => {
      error('Failed to create task', err.message)
    },
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskData }) =>
      taskService.updateTask(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      success('Task updated successfully')
    },
    onError: (err: any) => {
      error('Failed to update task', err.message)
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['project-tasks'] })
      success('Task deleted successfully')
    },
    onError: (err: any) => {
      error('Failed to delete task', err.message)
    },
  })
}

export const useAddTaskDependency = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ taskId, dependsOnTaskId }: { taskId: number; dependsOnTaskId: number }) =>
      taskService.addTaskDependency(taskId, dependsOnTaskId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies', taskId] })
      success('Task dependency added successfully')
    },
    onError: (err: any) => {
      error('Failed to add task dependency', err.message)
    },
  })
}

export const useRemoveTaskDependency = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: number) => taskService.removeTaskDependency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-dependencies'] })
      success('Task dependency removed successfully')
    },
    onError: (err: any) => {
      error('Failed to remove task dependency', err.message)
    },
  })
}

export const useStartTimeLog = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ taskId, userId, description }: { taskId: number; userId: number; description?: string }) =>
      taskService.startTimeLog(taskId, userId, description),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ['time-logs', taskId] })
      success('Time tracking started')
    },
    onError: (err: any) => {
      error('Failed to start time tracking', err.message)
    },
  })
}

export const useStopTimeLog = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: (id: number) => taskService.stopTimeLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-logs'] })
      success('Time tracking stopped')
    },
    onError: (err: any) => {
      error('Failed to stop time tracking', err.message)
    },
  })
}

export const useApproveTask = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment?: string }) =>
      taskService.approveTask(id, comment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      success('Task approved successfully')
    },
    onError: (err: any) => {
      error('Failed to approve task', err.message)
    },
  })
}

export const useDeclineTask = () => {
  const queryClient = useQueryClient()
  const { success, error } = useToast()

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      taskService.declineTask(id, comment),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['task', id] })
      success('Task declined')
    },
    onError: (err: any) => {
      error('Failed to decline task', err.message)
    },
  })
}