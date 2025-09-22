export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  message: string
  status: number
  details?: any
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
}

export interface DashboardMetrics {
  projects: {
    total: number
    active: number
    completed: number
    overdue: number
  }
  tasks: {
    total: number
    pending: number
    inProgress: number
    completed: number
  }
  inventory: {
    totalProducts: number
    lowStockItems: number
    totalValue: number
  }
  financial: {
    totalRevenue: number
    pendingInvoices: number
    overduePayments: number
    monthlyRevenue: Array<{
      month: string
      revenue: number
    }>
  }
}

export interface ReportData {
  id: string
  title: string
  type: 'inventory' | 'sales' | 'projects' | 'feedback' | 'financial'
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  data: any
  generatedAt: Date
  generatedBy: number
}