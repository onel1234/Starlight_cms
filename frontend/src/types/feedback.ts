import { User } from './auth'
import { Project } from './project'

export type FeedbackCategory = 'Service Quality' | 'Communication' | 'Timeline' | 'Budget' | 'General'
export type FeedbackPriority = 'Low' | 'Medium' | 'High' | 'Critical'
export type FeedbackStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'

export interface Feedback {
  id: number
  customerId: number
  projectId?: number
  category: FeedbackCategory
  priority: FeedbackPriority
  status: FeedbackStatus
  title: string
  description: string
  rating?: number // 1-5 scale
  responseText?: string
  respondedBy?: number
  respondedAt?: Date
  createdAt: Date
  updatedAt: Date
  customer?: User
  project?: Project
  responder?: User
}

export interface CreateFeedbackData {
  projectId?: number
  category: FeedbackCategory
  priority: FeedbackPriority
  title: string
  description: string
  rating?: number
}

export interface UpdateFeedbackData extends Partial<CreateFeedbackData> {
  status?: FeedbackStatus
  responseText?: string
}

export interface FeedbackAnalytics {
  totalFeedback: number
  averageRating: number
  categoryBreakdown: Record<FeedbackCategory, number>
  priorityBreakdown: Record<FeedbackPriority, number>
  statusBreakdown: Record<FeedbackStatus, number>
  monthlyTrends: Array<{
    month: string
    count: number
    averageRating: number
  }>
}