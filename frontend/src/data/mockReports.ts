import { 
  DashboardMetrics, 
  RevenueData, 
  ProjectStatusData, 
  TaskProgressData,
  InventoryData,
  CustomerSatisfactionData,
  AnalyticsInsight,
  ScheduledReport
} from '../types/reports';

export const mockDashboardMetrics: DashboardMetrics = {
  totalProjects: 45,
  activeProjects: 12,
  completedProjects: 28,
  totalRevenue: 2450000,
  monthlyRevenue: 185000,
  totalTasks: 234,
  completedTasks: 189,
  overdueTasks: 8,
  totalInventoryValue: 450000,
  lowStockItems: 15,
  totalSuppliers: 28,
  activeSuppliers: 22,
  pendingInvoices: 12,
  overdueInvoices: 3,
  customerSatisfaction: 4.2,
  projectsOnTime: 85,
  projectsOverBudget: 15
};

export const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 180000, expenses: 120000, profit: 60000 },
  { month: 'Feb', revenue: 195000, expenses: 125000, profit: 70000 },
  { month: 'Mar', revenue: 210000, expenses: 135000, profit: 75000 },
  { month: 'Apr', revenue: 185000, expenses: 130000, profit: 55000 },
  { month: 'May', revenue: 225000, expenses: 140000, profit: 85000 },
  { month: 'Jun', revenue: 240000, expenses: 145000, profit: 95000 },
  { month: 'Jul', revenue: 220000, expenses: 138000, profit: 82000 },
  { month: 'Aug', revenue: 235000, expenses: 142000, profit: 93000 },
  { month: 'Sep', revenue: 250000, expenses: 148000, profit: 102000 },
  { month: 'Oct', revenue: 245000, expenses: 150000, profit: 95000 },
  { month: 'Nov', revenue: 260000, expenses: 155000, profit: 105000 },
  { month: 'Dec', revenue: 275000, expenses: 160000, profit: 115000 }
];

export const mockProjectStatusData: ProjectStatusData[] = [
  { status: 'Completed', count: 28, percentage: 62.2 },
  { status: 'In Progress', count: 12, percentage: 26.7 },
  { status: 'Planning', count: 3, percentage: 6.7 },
  { status: 'On Hold', count: 2, percentage: 4.4 }
];

export const mockTaskProgressData: TaskProgressData[] = [
  { project: 'Water Treatment Plant A', completed: 45, total: 50, percentage: 90 },
  { project: 'Sewerage System B', completed: 32, total: 40, percentage: 80 },
  { project: 'Environmental Cleanup C', completed: 28, total: 35, percentage: 80 },
  { project: 'Water Pipeline D', completed: 15, total: 25, percentage: 60 },
  { project: 'Waste Management E', completed: 20, total: 30, percentage: 67 }
];

export const mockInventoryData: InventoryData[] = [
  { category: 'Pipes & Fittings', value: 125000, items: 450 },
  { category: 'Pumps & Motors', value: 95000, items: 85 },
  { category: 'Valves & Controls', value: 75000, items: 220 },
  { category: 'Safety Equipment', value: 45000, items: 180 },
  { category: 'Tools & Machinery', value: 85000, items: 65 },
  { category: 'Construction Materials', value: 25000, items: 320 }
];

export const mockCustomerSatisfactionData: CustomerSatisfactionData[] = [
  { month: 'Jan', rating: 4.1, responses: 25 },
  { month: 'Feb', rating: 4.0, responses: 28 },
  { month: 'Mar', rating: 4.2, responses: 32 },
  { month: 'Apr', rating: 4.3, responses: 30 },
  { month: 'May', rating: 4.1, responses: 35 },
  { month: 'Jun', rating: 4.4, responses: 38 },
  { month: 'Jul', rating: 4.2, responses: 33 },
  { month: 'Aug', rating: 4.3, responses: 40 },
  { month: 'Sep', rating: 4.5, responses: 42 },
  { month: 'Oct', rating: 4.2, responses: 38 },
  { month: 'Nov', rating: 4.4, responses: 45 },
  { month: 'Dec', rating: 4.3, responses: 48 }
];

export const mockAnalyticsInsights: AnalyticsInsight[] = [
  {
    id: '1',
    title: 'Revenue Growth Trend',
    description: 'Monthly revenue has increased by 15% over the last quarter',
    type: 'trend',
    severity: 'medium',
    value: 275000,
    change: 15,
    changeType: 'increase',
    recommendation: 'Continue current sales strategies and consider expanding team'
  },
  {
    id: '2',
    title: 'Project Delivery Performance',
    description: '85% of projects are being delivered on time',
    type: 'opportunity',
    severity: 'low',
    value: 85,
    change: 5,
    changeType: 'increase',
    recommendation: 'Implement best practices from on-time projects across all teams'
  },
  {
    id: '3',
    title: 'Inventory Stock Alert',
    description: '15 items are below minimum stock levels',
    type: 'risk',
    severity: 'high',
    value: 15,
    change: 3,
    changeType: 'increase',
    recommendation: 'Immediate reorder required for critical items'
  },
  {
    id: '4',
    title: 'Customer Satisfaction Improvement',
    description: 'Customer satisfaction has improved to 4.3/5.0',
    type: 'trend',
    severity: 'low',
    value: 4.3,
    change: 0.2,
    changeType: 'increase',
    recommendation: 'Continue focus on customer service excellence'
  }
];

export const mockScheduledReports: ScheduledReport[] = [
  {
    id: '1',
    reportId: 'monthly-financial',
    name: 'Monthly Financial Summary',
    frequency: 'monthly',
    recipients: ['director@starlight.com', 'finance@starlight.com'],
    format: 'pdf',
    nextRun: new Date('2024-02-01'),
    lastRun: new Date('2024-01-01'),
    isActive: true,
    createdBy: 1,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2',
    reportId: 'weekly-project-status',
    name: 'Weekly Project Status',
    frequency: 'weekly',
    recipients: ['pm@starlight.com', 'director@starlight.com'],
    format: 'excel',
    nextRun: new Date('2024-01-15'),
    lastRun: new Date('2024-01-08'),
    isActive: true,
    createdBy: 1,
    createdAt: new Date('2024-01-01')
  },
  {
    id: '3',
    reportId: 'daily-inventory',
    name: 'Daily Inventory Status',
    frequency: 'daily',
    recipients: ['inventory@starlight.com'],
    format: 'csv',
    nextRun: new Date('2024-01-10'),
    lastRun: new Date('2024-01-09'),
    isActive: false,
    createdBy: 1,
    createdAt: new Date('2024-01-01')
  }
];