import { 
  Feedback, 
  FeedbackAnalytics, 
  CreateFeedbackData, 
  UpdateFeedbackData 
} from '../types/feedback'
import { mockFeedback, mockFeedbackAnalytics } from '../data/mockFeedback'

class MockFeedbackService {
  private feedback: Feedback[] = [...mockFeedback]
  private nextId = Math.max(...this.feedback.map(f => f.id)) + 1

  async getFeedback(): Promise<Feedback[]> {
    await this.delay()
    return this.feedback
  }

  async getFeedbackById(id: number): Promise<Feedback | null> {
    await this.delay()
    return this.feedback.find(f => f.id === id) || null
  }

  async getFeedbackByCustomer(customerId: number): Promise<Feedback[]> {
    await this.delay()
    return this.feedback.filter(f => f.customerId === customerId)
  }

  async getFeedbackByProject(projectId: number): Promise<Feedback[]> {
    await this.delay()
    return this.feedback.filter(f => f.projectId === projectId)
  }

  async createFeedback(data: CreateFeedbackData): Promise<Feedback> {
    await this.delay()
    const newFeedback: Feedback = {
      id: this.nextId++,
      customerId: 7, // Mock current customer user
      ...data,
      status: 'Open',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    this.feedback.push(newFeedback)
    return newFeedback
  }

  async updateFeedback(id: number, data: UpdateFeedbackData): Promise<Feedback | null> {
    await this.delay()
    const index = this.feedback.findIndex(f => f.id === id)
    if (index === -1) return null

    this.feedback[index] = {
      ...this.feedback[index],
      ...data,
      updatedAt: new Date()
    }

    return this.feedback[index]
  }

  async respondToFeedback(id: number, responseText: string): Promise<Feedback | null> {
    await this.delay()
    const index = this.feedback.findIndex(f => f.id === id)
    if (index === -1) return null

    this.feedback[index] = {
      ...this.feedback[index],
      responseText,
      respondedBy: 5, // Mock current staff user
      respondedAt: new Date(),
      status: 'In Progress',
      updatedAt: new Date()
    }

    return this.feedback[index]
  }

  async deleteFeedback(id: number): Promise<boolean> {
    await this.delay()
    const index = this.feedback.findIndex(f => f.id === id)
    if (index === -1) return false

    this.feedback.splice(index, 1)
    return true
  }

  async getFeedbackAnalytics(): Promise<FeedbackAnalytics> {
    await this.delay()
    
    // Calculate real-time analytics from current feedback
    const totalFeedback = this.feedback.length
    const ratingsWithValues = this.feedback.filter(f => f.rating !== undefined)
    const averageRating = ratingsWithValues.length > 0 
      ? ratingsWithValues.reduce((sum, f) => sum + (f.rating || 0), 0) / ratingsWithValues.length 
      : 0

    const categoryBreakdown = this.feedback.reduce((acc, f) => {
      acc[f.category] = (acc[f.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const priorityBreakdown = this.feedback.reduce((acc, f) => {
      acc[f.priority] = (acc[f.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusBreakdown = this.feedback.reduce((acc, f) => {
      acc[f.status] = (acc[f.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalFeedback,
      averageRating: Math.round(averageRating * 10) / 10,
      categoryBreakdown: categoryBreakdown as any,
      priorityBreakdown: priorityBreakdown as any,
      statusBreakdown: statusBreakdown as any,
      monthlyTrends: mockFeedbackAnalytics.monthlyTrends
    }
  }

  async searchFeedback(query: string): Promise<Feedback[]> {
    await this.delay()
    const lowercaseQuery = query.toLowerCase()
    return this.feedback.filter(f => 
      f.title.toLowerCase().includes(lowercaseQuery) ||
      f.description.toLowerCase().includes(lowercaseQuery) ||
      f.category.toLowerCase().includes(lowercaseQuery)
    )
  }

  private delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

export const mockFeedbackService = new MockFeedbackService()