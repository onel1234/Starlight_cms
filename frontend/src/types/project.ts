import { User } from './auth'

export type ProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed'

export interface Project {
  id: number
  name: string
  description?: string
  clientId?: number
  projectManagerId?: number
  startDate: Date
  endDate: Date
  budget: number
  actualCost: number
  status: ProjectStatus
  location?: string
  projectType?: string
  createdBy: number
  createdAt: Date
  updatedAt: Date
  client?: User
  projectManager?: User
  tasks?: Task[]
}

export interface CreateProjectData {
  name: string
  description?: string
  clientId?: number
  projectManagerId?: number
  startDate: Date
  endDate: Date
  budget: number
  location?: string
  projectType?: string
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  status?: ProjectStatus
  actualCost?: number
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed' | 'On Hold'
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical'

export interface Task {
  id: number
  projectId: number
  assignedTo?: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  startDate?: Date
  dueDate?: Date
  completionPercentage: number
  estimatedHours?: number
  actualHours: number
  createdBy: number
  createdAt: Date
  updatedAt: Date
  project?: Project
  assignee?: User
}

export interface CreateTaskData {
  projectId: number
  assignedTo?: number
  title: string
  description?: string
  priority: TaskPriority
  startDate?: Date
  dueDate?: Date
  estimatedHours?: number
}

export interface UpdateTaskData extends Partial<CreateTaskData> {
  status?: TaskStatus
  completionPercentage?: number
  actualHours?: number
}