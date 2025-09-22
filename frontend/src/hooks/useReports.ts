import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService } from '../services/mockReportsService';
import { 
  ReportConfig, 
  ReportFilter, 
  ReportExportOptions, 
  ScheduledReport 
} from '../types/reports';

// Dashboard Metrics
export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: () => reportsService.getDashboardMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Chart Data Hooks
export const useRevenueData = (filter?: ReportFilter) => {
  return useQuery({
    queryKey: ['revenue-data', filter],
    queryFn: () => reportsService.getRevenueData(filter),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProjectStatusData = (filter?: ReportFilter) => {
  return useQuery({
    queryKey: ['project-status-data', filter],
    queryFn: () => reportsService.getProjectStatusData(filter),
    staleTime: 10 * 60 * 1000,
  });
};

export const useTaskProgressData = (filter?: ReportFilter) => {
  return useQuery({
    queryKey: ['task-progress-data', filter],
    queryFn: () => reportsService.getTaskProgressData(filter),
    staleTime: 10 * 60 * 1000,
  });
};

export const useInventoryData = (filter?: ReportFilter) => {
  return useQuery({
    queryKey: ['inventory-data', filter],
    queryFn: () => reportsService.getInventoryData(filter),
    staleTime: 10 * 60 * 1000,
  });
};

export const useCustomerSatisfactionData = (filter?: ReportFilter) => {
  return useQuery({
    queryKey: ['customer-satisfaction-data', filter],
    queryFn: () => reportsService.getCustomerSatisfactionData(filter),
    staleTime: 10 * 60 * 1000,
  });
};

// Analytics Insights
export const useAnalyticsInsights = () => {
  return useQuery({
    queryKey: ['analytics-insights'],
    queryFn: () => reportsService.getAnalyticsInsights(),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Scheduled Reports
export const useScheduledReports = () => {
  return useQuery({
    queryKey: ['scheduled-reports'],
    queryFn: () => reportsService.getScheduledReports(),
  });
};

export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (report: Omit<ScheduledReport, 'id' | 'createdAt'>) =>
      reportsService.createScheduledReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
};

export const useUpdateScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ScheduledReport> }) =>
      reportsService.updateScheduledReport(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
};

export const useDeleteScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => reportsService.deleteScheduledReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-reports'] });
    },
  });
};

// Report Generation
export const useGenerateReport = () => {
  return useMutation({
    mutationFn: (config: ReportConfig) => reportsService.generateReport(config),
  });
};

// Export Functions
export const useExportReport = () => {
  return useMutation({
    mutationFn: ({ config, options }: { config: ReportConfig; options: ReportExportOptions }) =>
      reportsService.exportReport(config, options),
  });
};

// Drill-down
export const useDrillDownData = (parentId: string, level: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['drill-down-data', parentId, level],
    queryFn: () => reportsService.getDrillDownData(parentId, level),
    enabled,
  });
};

// Custom Report Builder
export const useDataSources = () => {
  return useQuery({
    queryKey: ['data-sources'],
    queryFn: () => reportsService.getAvailableDataSources(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};

export const useDataSourceColumns = (dataSource: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['data-source-columns', dataSource],
    queryFn: () => reportsService.getDataSourceColumns(dataSource),
    enabled,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
};