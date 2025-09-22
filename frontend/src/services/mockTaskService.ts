import { Task, CreateTaskData, UpdateTaskData, TaskStatus, TaskPriority } from '../types/project'
import { mockTasks } from '../data/mockProjects'
import { User } from '../types/auth'

export interface TaskFilters {
  search?: string
  projectId?: number
  assignedTo?: number
  status?: TaskStatus
  priority?: TaskPriority
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface TasksResponse {
  tasks: Task[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface TaskDependency {
  id: number
  taskId: number
  dependsOnTaskId: number
  createdAt: Date
}

export interface TimeLog {
  id: number
  taskId: number
  userId: number
  startTime: Date
  endTime?: Date
  duration?: number // in minutes
  description?: string
  createdAt: Date
}

// Mock users for assignment
const mockUsers: User[] = [
  {
    id: 5,
    email: 'engineer1@starlight.com',
    role: 'Employee',
    isActive: true,
    profile: { firstName: 'Alex', lastName: 'Thompson', phone: '+1-555-1001' }
  },
  {
    id: 6,
    email: 'engineer2@starlight.com',
    role: 'Employee',
    isActive: true,
    profile: { firstName: 'Maria', lastName: 'Garcia', phone: '+1-555-1002' }
  },
  {
    id: 7,
    email: 'engineer3@starlight.com',
    role: 'Employee',
    isActive: true,
    profile: { firstName: 'James', lastName: 'Wilson', phone: '+1-555-1003' }
  },
  {
    id: 8,
    email: 'engineer4@starlight.com',
    role: 'Employee',
    isActive: true,
    profile: { firstName: 'Emma', lastName: 'Davis', phone: '+1-555-1004' }
  }
]

// Mock task dependencies
let mockTaskDependencies: TaskDependency[] = [
  {
    id: 1,
    taskId: 2,
    dependsOnTaskId: 1,
    createdAt: new Date('2024-01-15')
  }
]

// Mock time logs
let mockTimeLogs: TimeLog[] = [
  {
    id: 1,
    taskId: 1,
    userId: 5,
    startTime: new Date('2024-01-15T09:00:00'),
    endTime: new Date('2024-01-15T17:00:00'),
    duration: 480,
    description: 'Site survey work',
    createdAt: new Date('2024-01-15T17:00:00')
  },
  {
    id: 2,
    taskId: 2,
    userId: 6,
    startTime: new Date('2024-03-15T08:30:00'),
    endTime: new Date('2024-03-15T16:30:00'),
    duration: 480,
    description: 'Equipment research and procurement',
    createdAt: new Date('2024-03-15T16:30:00')
  }
]

// In-memory storage
let tasks = [...mockTasks]
let nextTaskId = Math.max(...tasks.map(t => t.id)) + 1
let nextDependencyId = Math.max(...mockTaskDependencies.map(d => d.id)) + 1
let nextTimeLogId = Math.max(...mockTimeLogs.map(l => l.id)) + 1

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const mockTaskService = {
  async getTasks(filters: TaskFilters = {}): Promise<TasksResponse> {
    await delay(300)

    let filteredTasks = [...tasks]

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredTasks = filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === filters.projectId)
    }

    if (filters.assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === filters.assignedTo)
    }

    if (filters.status) {
      filteredTasks = filteredTasks.filter(task => task.status === filters.status)
    }

    if (filters.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === filters.priority)
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortOrder = filters.sortOrder || 'desc'

    filteredTasks.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Task]
      let bValue: any = b[sortBy as keyof Task]

      if (aValue instanceof Date) aValue = aValue.getTime()
      if (bValue instanceof Date) bValue = bValue.getTime()

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Apply pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex)

    // Add assignee information
    const tasksWithAssignee = paginatedTasks.map(task => ({
      ...task,
      assignee: task.assignedTo ? mockUsers.find(u => u.id === task.assignedTo) : undefined
    }))

    return {
      tasks: tasksWithAssignee,
      total: filteredTasks.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTasks.length / limit)
    }
  },

  async getTask(id: number): Promise<Task> {
    await delay(200)
    const task = tasks.find(t => t.id === id)
    if (!task) {
      throw new Error('Task not found')
    }

    return {
      ...task,
      assignee: task.assignedTo ? mockUsers.find(u => u.id === task.assignedTo) : undefined
    }
  },

  async createTask(data: CreateTaskData): Promise<Task> {
    await delay(500)

    const newTask: Task = {
      id: nextTaskId++,
      ...data,
      status: 'Not Started',
      completionPercentage: 0,
      actualHours: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    tasks.push(newTask)
    return newTask
  },

  async updateTask(id: number, data: UpdateTaskData): Promise<Task> {
    await delay(500)

    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    const updatedTask = {
      ...tasks[taskIndex],
      ...data,
      updatedAt: new Date()
    }

    tasks[taskIndex] = updatedTask
    return updatedTask
  },

  async deleteTask(id: number): Promise<void> {
    await delay(300)

    const taskIndex = tasks.findIndex(t => t.id === id)
    if (taskIndex === -1) {
      throw new Error('Task not found')
    }

    tasks.splice(taskIndex, 1)
  },

  async getTaskDependencies(taskId: number): Promise<TaskDependency[]> {
    await delay(200)
    return mockTaskDependencies.filter(d => d.taskId === taskId)
  },

  async addTaskDependency(taskId: number, dependsOnTaskId: number): Promise<TaskDependency> {
    await delay(300)

    const newDependency: TaskDependency = {
      id: nextDependencyId++,
      taskId,
      dependsOnTaskId,
      createdAt: new Date()
    }

    mockTaskDependencies.push(newDependency)
    return newDependency
  },

  async removeTaskDependency(id: number): Promise<void> {
    await delay(300)
    const index = mockTaskDependencies.findIndex(d => d.id === id)
    if (index !== -1) {
      mockTaskDependencies.splice(index, 1)
    }
  },

  async getTimeLogs(taskId: number): Promise<TimeLog[]> {
    await delay(200)
    return mockTimeLogs.filter(l => l.taskId === taskId)
  },

  async startTimeLog(taskId: number, userId: number, description?: string): Promise<TimeLog> {
    await delay(300)

    const newTimeLog: TimeLog = {
      id: nextTimeLogId++,
      taskId,
      userId,
      startTime: new Date(),
      description,
      createdAt: new Date()
    }

    mockTimeLogs.push(newTimeLog)
    return newTimeLog
  },

  async stopTimeLog(id: number): Promise<TimeLog> {
    await delay(300)

    const timeLogIndex = mockTimeLogs.findIndex(l => l.id === id)
    if (timeLogIndex === -1) {
      throw new Error('Time log not found')
    }

    const timeLog = mockTimeLogs[timeLogIndex]
    const endTime = new Date()
    const duration = Math.floor((endTime.getTime() - timeLog.startTime.getTime()) / (1000 * 60))

    const updatedTimeLog = {
      ...timeLog,
      endTime,
      duration
    }

    mockTimeLogs[timeLogIndex] = updatedTimeLog
    return updatedTimeLog
  },

  async getUsers(): Promise<User[]> {
    await delay(200)
    return mockUsers
  },

  async approveTask(id: number, comment?: string): Promise<Task> {
    await delay(300)
    return this.updateTask(id, { status: 'Completed' })
  },

  async declineTask(id: number, comment: string): Promise<Task> {
    await delay(300)
    return this.updateTask(id, { status: 'On Hold' })
  }
}