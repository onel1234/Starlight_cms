import { 
  DashboardMetrics, 
  RevenueData, 
  ProjectStatusData, 
  TaskProgressData,
  InventoryData,
  CustomerSatisfactionData,
  AnalyticsInsight,
  ScheduledReport,
  ReportConfig,
  ReportFilter,
  ReportExportOptions,
  ChartData
} from '../types/reports';
import {
  mockDashboardMetrics,
  mockRevenueData,
  mockProjectStatusData,
  mockTaskProgressData,
  mockInventoryData,
  mockCustomerSatisfactionData,
  mockAnalyticsInsights,
  mockScheduledReports
} from '../data/mockReports';

class MockReportsService {
  // Dashboard Metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    await this.delay(500);
    return mockDashboardMetrics;
  }

  // Chart Data
  async getRevenueData(filter?: ReportFilter): Promise<RevenueData[]> {
    await this.delay(300);
    return mockRevenueData;
  }

  async getProjectStatusData(filter?: ReportFilter): Promise<ProjectStatusData[]> {
    await this.delay(300);
    return mockProjectStatusData;
  }

  async getTaskProgressData(filter?: ReportFilter): Promise<TaskProgressData[]> {
    await this.delay(300);
    return mockTaskProgressData;
  }

  async getInventoryData(filter?: ReportFilter): Promise<InventoryData[]> {
    await this.delay(300);
    return mockInventoryData;
  }

  async getCustomerSatisfactionData(filter?: ReportFilter): Promise<CustomerSatisfactionData[]> {
    await this.delay(300);
    return mockCustomerSatisfactionData;
  }

  // Analytics Insights
  async getAnalyticsInsights(): Promise<AnalyticsInsight[]> {
    await this.delay(400);
    return mockAnalyticsInsights;
  }

  // Scheduled Reports
  async getScheduledReports(): Promise<ScheduledReport[]> {
    await this.delay(300);
    return mockScheduledReports;
  }

  async createScheduledReport(report: Omit<ScheduledReport, 'id' | 'createdAt'>): Promise<ScheduledReport> {
    await this.delay(500);
    const newReport: ScheduledReport = {
      ...report,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    return newReport;
  }

  async updateScheduledReport(id: string, updates: Partial<ScheduledReport>): Promise<ScheduledReport> {
    await this.delay(500);
    const report = mockScheduledReports.find(r => r.id === id);
    if (!report) throw new Error('Report not found');
    return { ...report, ...updates };
  }

  async deleteScheduledReport(id: string): Promise<void> {
    await this.delay(300);
    // In real implementation, would delete from database
  }

  // Report Generation
  async generateReport(config: ReportConfig): Promise<ChartData[]> {
    await this.delay(1000);
    
    // Mock report generation based on type
    switch (config.type) {
      case 'project-summary':
        return mockProjectStatusData.map(item => ({
          name: item.status,
          value: item.count
        }));
      
      case 'financial-overview':
        return mockRevenueData.map(item => ({
          name: item.month,
          value: item.revenue,
          expenses: item.expenses,
          profit: item.profit
        }));
      
      case 'task-progress':
        return mockTaskProgressData.map(item => ({
          name: item.project,
          value: item.percentage,
          completed: item.completed,
          total: item.total
        }));
      
      case 'inventory-status':
        return mockInventoryData.map(item => ({
          name: item.category,
          value: item.value,
          items: item.items
        }));
      
      case 'customer-satisfaction':
        return mockCustomerSatisfactionData.map(item => ({
          name: item.month,
          value: item.rating,
          responses: item.responses
        }));
      
      default:
        return [];
    }
  }

  // Export Functions
  async exportReport(config: ReportConfig, options: ReportExportOptions): Promise<Blob> {
    await this.delay(2000);
    
    // Mock export - in real implementation would generate actual files
    const mockData = `Report: ${config.name}\nGenerated: ${new Date().toISOString()}\nFormat: ${options.format}`;
    
    switch (options.format) {
      case 'pdf':
        return new Blob([mockData], { type: 'application/pdf' });
      case 'excel':
        return new Blob([mockData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      case 'csv':
        return new Blob([mockData], { type: 'text/csv' });
      default:
        return new Blob([mockData], { type: 'text/plain' });
    }
  }

  // Drill-down functionality
  async getDrillDownData(parentId: string, level: number): Promise<ChartData[]> {
    await this.delay(500);
    
    // Mock drill-down data
    if (level === 1) {
      return [
        { name: 'Q1', value: 585000 },
        { name: 'Q2', value: 650000 },
        { name: 'Q3', value: 705000 },
        { name: 'Q4', value: 780000 }
      ];
    } else if (level === 2) {
      return [
        { name: 'Jan', value: 180000 },
        { name: 'Feb', value: 195000 },
        { name: 'Mar', value: 210000 }
      ];
    }
    
    return [];
  }

  // Custom report builder
  async getAvailableDataSources(): Promise<string[]> {
    await this.delay(200);
    return [
      'projects',
      'tasks',
      'inventory',
      'financial',
      'customers',
      'suppliers',
      'users'
    ];
  }

  async getDataSourceColumns(dataSource: string): Promise<string[]> {
    await this.delay(200);
    
    const columnMap: Record<string, string[]> = {
      projects: ['id', 'name', 'status', 'budget', 'actual_cost', 'start_date', 'end_date', 'client_id'],
      tasks: ['id', 'title', 'status', 'priority', 'assigned_to', 'due_date', 'completion_percentage'],
      inventory: ['id', 'name', 'category', 'stock_quantity', 'unit_price', 'supplier_id'],
      financial: ['id', 'type', 'amount', 'status', 'date', 'project_id'],
      customers: ['id', 'name', 'email', 'company', 'total_projects', 'satisfaction_rating'],
      suppliers: ['id', 'company_name', 'rating', 'total_orders', 'performance_score'],
      users: ['id', 'email', 'role', 'status', 'created_at', 'last_login']
    };
    
    return columnMap[dataSource] || [];
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const reportsService = new MockReportsService();