export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalInventoryValue: number;
  lowStockItems: number;
  totalSuppliers: number;
  activeSuppliers: number;
  pendingInvoices: number;
  overdueInvoices: number;
  customerSatisfaction: number;
  projectsOnTime: number;
  projectsOverBudget: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
  category?: string;
  [key: string]: any;
}

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ProjectStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface TaskProgressData {
  project: string;
  completed: number;
  total: number;
  percentage: number;
}

export interface InventoryData {
  category: string;
  value: number;
  items: number;
}

export interface CustomerSatisfactionData {
  month: string;
  rating: number;
  responses: number;
}

export interface ReportFilter {
  dateRange: {
    start: Date;
    end: Date;
  };
  projectIds?: number[];
  categories?: string[];
  status?: string[];
  userIds?: number[];
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  filters: ReportFilter;
  chartType: ChartType;
  dataSource: string;
  columns: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type ReportType = 
  | 'project-summary'
  | 'financial-overview'
  | 'task-progress'
  | 'inventory-status'
  | 'customer-satisfaction'
  | 'supplier-performance'
  | 'revenue-analysis'
  | 'custom';

export type ChartType = 
  | 'line'
  | 'bar'
  | 'pie'
  | 'area'
  | 'scatter'
  | 'radar'
  | 'treemap'
  | 'funnel';

export type ExportFormat = 'pdf' | 'excel' | 'csv';

export interface ScheduledReport {
  id: string;
  reportId: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  recipients: string[];
  format: ExportFormat;
  nextRun: Date;
  lastRun?: Date;
  isActive: boolean;
  createdBy: number;
  createdAt: Date;
}

export interface ReportExportOptions {
  format: ExportFormat;
  includeCharts: boolean;
  includeRawData: boolean;
  fileName?: string;
}

export interface DrillDownData {
  level: number;
  parentId?: string;
  data: ChartData[];
  breadcrumb: string[];
}

export interface AnalyticsInsight {
  id: string;
  title: string;
  description: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
  severity: 'low' | 'medium' | 'high';
  value: number;
  change: number;
  changeType: 'increase' | 'decrease';
  recommendation?: string;
}