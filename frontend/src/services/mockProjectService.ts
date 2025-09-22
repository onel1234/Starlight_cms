import { Project, CreateProjectData, UpdateProjectData, Task } from '../types/project'
import { ApiResponse } from '../types/api'
import { mockProjects, mockTasks } from '../data/mockProjects'

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

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

class MockProjectService {
  private projects: Project[] = [...mockProjects]
  private tasks: Task[] = [...mockTasks]
  private nextId = Math.max(...this.projects.map(p => p.id)) + 1

  async getProjects(filters?: ProjectFilters): Promise<ApiResponse<ProjectListResponse>> {
    await delay(500) // Simulate network delay

    let filteredProjects = [...this.projects]

    // Apply filters
    if (filters?.status) {
      filteredProjects = filteredProjects.filter(p => p.status === filters.status)
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProjects = filteredProjects.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.projectType?.toLowerCase().includes(searchLower) ||
        p.location?.toLowerCase().includes(searchLower)
      )
    }

    if (filters?.projectManagerId) {
      filteredProjects = filteredProjects.filter(p => p.projectManagerId === filters.projectManagerId)
    }

    if (filters?.clientId) {
      filteredProjects = filteredProjects.filter(p => p.clientId === filters.clientId)
    }

    // Apply sorting
    if (filters?.sortBy) {
      filteredProjects.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof Project]
        const bValue = b[filters.sortBy as keyof Project]
        
        if (aValue < bValue) return filters.sortOrder === 'desc' ? 1 : -1
        if (aValue > bValue) return filters.sortOrder === 'desc' ? -1 : 1
        return 0
      })
    }

    // Apply pagination
    const page = filters?.page || 1
    const limit = filters?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

    return {
      success: true,
      data: {
        projects: paginatedProjects,
        total: filteredProjects.length,
        page,
        limit,
        totalPages: Math.ceil(filteredProjects.length / limit)
      }
    }
  }

  async getProject(id: number): Promise<ApiResponse<Project>> {
    await delay(300)

    const project = this.projects.find(p => p.id === id)
    if (!project) {
      throw new Error(`Project with id ${id} not found`)
    }

    return {
      success: true,
      data: project
    }
  }

  async createProject(data: CreateProjectData): Promise<ApiResponse<Project>> {
    await delay(800)

    const newProject: Project = {
      id: this.nextId++,
      ...data,
      actualCost: 0,
      status: 'Planning',
      createdBy: 1, // Mock current user ID
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.projects.push(newProject)

    return {
      success: true,
      data: newProject
    }
  }

  async updateProject(id: number, data: UpdateProjectData): Promise<ApiResponse<Project>> {
    await delay(600)

    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) {
      throw new Error(`Project with id ${id} not found`)
    }

    const updatedProject = {
      ...this.projects[projectIndex],
      ...data,
      updatedAt: new Date()
    }

    this.projects[projectIndex] = updatedProject

    return {
      success: true,
      data: updatedProject
    }
  }

  async deleteProject(id: number): Promise<ApiResponse<void>> {
    await delay(400)

    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) {
      throw new Error(`Project with id ${id} not found`)
    }

    this.projects.splice(projectIndex, 1)

    return {
      success: true,
      data: undefined
    }
  }

  async approveProject(id: number): Promise<ApiResponse<Project>> {
    await delay(500)

    const projectIndex = this.projects.findIndex(p => p.id === id)
    if (projectIndex === -1) {
      throw new Error(`Project with id ${id} not found`)
    }

    const updatedProject = {
      ...this.projects[projectIndex],
      status: 'In Progress' as const,
      updatedAt: new Date()
    }

    this.projects[projectIndex] = updatedProject

    return {
      success: true,
      data: updatedProject
    }
  }

  async getProjectTasks(projectId: number): Promise<ApiResponse<Task[]>> {
    await delay(300)

    const projectTasks = this.tasks.filter(t => t.projectId === projectId)

    return {
      success: true,
      data: projectTasks
    }
  }

  async getProjectStats(id: number): Promise<ApiResponse<{
    totalTasks: number
    completedTasks: number
    budgetUtilization: number
    daysRemaining: number
    progressPercentage: number
  }>> {
    await delay(400)

    const project = this.projects.find(p => p.id === id)
    if (!project) {
      throw new Error(`Project with id ${id} not found`)
    }

    const projectTasks = this.tasks.filter(t => t.projectId === id)
    const completedTasks = projectTasks.filter(t => t.status === 'Completed')
    const budgetUtilization = project.budget > 0 ? (project.actualCost / project.budget) * 100 : 0
    
    const now = new Date()
    const endDate = new Date(project.endDate)
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    const progressPercentage = projectTasks.length > 0 
      ? (completedTasks.length / projectTasks.length) * 100 
      : 0

    return {
      success: true,
      data: {
        totalTasks: projectTasks.length,
        completedTasks: completedTasks.length,
        budgetUtilization,
        daysRemaining,
        progressPercentage
      }
    }
  }
}

export const mockProjectService = new MockProjectService()
export { ProjectFilters, ProjectListResponse }