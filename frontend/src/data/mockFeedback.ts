import { Feedback, FeedbackAnalytics } from '../types/feedback'

export const mockFeedback: Feedback[] = [
  {
    id: 1,
    customerId: 7,
    projectId: 1,
    category: 'Service Quality',
    priority: 'High',
    status: 'Resolved',
    title: 'Excellent project execution',
    description: 'The team delivered exceptional quality work on our water treatment facility. Very professional and timely.',
    rating: 5,
    responseText: 'Thank you for your positive feedback! We are glad you are satisfied with our work.',
    respondedBy: 5,
    respondedAt: new Date('2024-01-20T10:30:00Z'),
    createdAt: new Date('2024-01-18T14:20:00Z'),
    updatedAt: new Date('2024-01-20T10:30:00Z')
  },
  {
    id: 2,
    customerId: 7,
    projectId: 2,
    category: 'Timeline',
    priority: 'Medium',
    status: 'In Progress',
    title: 'Slight delay in project completion',
    description: 'The project is running about a week behind schedule. Would appreciate an updated timeline.',
    rating: 3,
    responseText: 'We acknowledge the delay and are working to minimize further impact. Updated timeline will be shared by tomorrow.',
    respondedBy: 2,
    respondedAt: new Date('2024-01-22T09:15:00Z'),
    createdAt: new Date('2024-01-21T16:45:00Z'),
    updatedAt: new Date('2024-01-22T09:15:00Z')
  },
  {
    id: 3,
    customerId: 7,
    category: 'Communication',
    priority: 'Low',
    status: 'Open',
    title: 'Request for weekly progress updates',
    description: 'Would like to receive more frequent updates on project progress. Current monthly updates are not sufficient.',
    rating: 4,
    createdAt: new Date('2024-01-23T11:30:00Z'),
    updatedAt: new Date('2024-01-23T11:30:00Z')
  },
  {
    id: 4,
    customerId: 8,
    projectId: 3,
    category: 'Budget',
    priority: 'Critical',
    status: 'Resolved',
    title: 'Unexpected cost increase',
    description: 'There was an unexpected 15% increase in project costs due to material price changes. Need clarification on approval process.',
    rating: 2,
    responseText: 'We have reviewed the cost increase and provided detailed breakdown. Additional costs were due to unforeseen site conditions as documented in change order #3.',
    respondedBy: 1,
    respondedAt: new Date('2024-01-19T14:20:00Z'),
    createdAt: new Date('2024-01-17T09:10:00Z'),
    updatedAt: new Date('2024-01-19T14:20:00Z')
  },
  {
    id: 5,
    customerId: 9,
    category: 'General',
    priority: 'Medium',
    status: 'Open',
    title: 'Suggestion for improvement',
    description: 'Consider implementing a mobile app for real-time project updates and communication.',
    rating: 4,
    createdAt: new Date('2024-01-24T13:45:00Z'),
    updatedAt: new Date('2024-01-24T13:45:00Z')
  }
]

export const mockFeedbackAnalytics: FeedbackAnalytics = {
  totalFeedback: 5,
  averageRating: 3.6,
  categoryBreakdown: {
    'Service Quality': 1,
    'Communication': 1,
    'Timeline': 1,
    'Budget': 1,
    'General': 1
  },
  priorityBreakdown: {
    'Low': 1,
    'Medium': 2,
    'High': 1,
    'Critical': 1
  },
  statusBreakdown: {
    'Open': 2,
    'In Progress': 1,
    'Resolved': 2,
    'Closed': 0
  },
  monthlyTrends: [
    { month: '2023-11', count: 3, averageRating: 3.7 },
    { month: '2023-12', count: 4, averageRating: 3.5 },
    { month: '2024-01', count: 5, averageRating: 3.6 }
  ]
}