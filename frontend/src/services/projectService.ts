import { apiService } from './api'
import { Project, CreateProjectData, UpdateProjectData, Task } from '../types/project'
import { ApiResponse } from '../types/api'

export interface ProjectFilters {
  status?: string
  projectManagerId?: number
  clientId?: number
  search?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProjectListResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

class ProjectService {
  async getProjects(filters?: ProjectFilters): Promise<ApiResponse<ProjectListResponse>> {
    return apiService.get<ProjectListResponse>('/projects', filters)
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    return apiService.get<Project>(`/projects/${id}`)
  }

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    return apiService.post<Project>('/projects', data)
  }

  async updateProject(id: number, data: UpdateProjectData): Promise<ApiResponse<Project>> {
    return apiService.put<Project>(`/projects/${id}`, data)
  }

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`/projects/${id}`)
  }

  async approveProject(id: number): Promise<ApiResponse<Project>> {
    return apiService.patch<Project>(`/projects/${id}/approve`)
  }

  async getProjectTasks(projectId: number): Promise<ApiResponse<Task[]>> {
    return apiService.get<Task[]>(`/projects/${projectId}/tasks`)
  }

  async getProjectStats(id: number): Promise<ApiResponse<{
    totalTasks: number
    completedTasks: number
    budgetUtilization: number
    daysRemaining: number
    progressPercentage: number
  }>> {
    return apiService.get(`/projects/${id}/stats`)
  }
}

export const projectService = new ProjectService()