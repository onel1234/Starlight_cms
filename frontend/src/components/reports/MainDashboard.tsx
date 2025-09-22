import { 
  useDashboardMetrics, 
  useAnalyticsInsights,
  useRevenueData,
  useProjectStatusData,
  useTaskProgressData,
  useInventoryData,
  useCustomerSatisfactionData
} from '../../hooks/useReports';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import {
  RevenueChart,
  ProjectStatusChart,
  TaskProgressChart,
  InventoryChart,
  CustomerSatisfactionChart
} from './ChartComponents';
import { 
  ChartBarIcon, 
  CurrencyDollarIcon, 
  ClipboardDocumentListIcon,
  CubeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, change, changeType, icon, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {changeType === 'increase' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

interface InsightCardProps {
  insight: {
    title: string;
    description: string;
    type: 'trend' | 'anomaly' | 'opportunity' | 'risk';
    severity: 'low' | 'medium' | 'high';
    recommendation?: string;
  };
}

function InsightCard({ insight }: InsightCardProps) {
  const getInsightColor = (type: string, severity: string) => {
    if (type === 'risk') return 'border-red-200 bg-red-50';
    if (type === 'opportunity') return 'border-green-200 bg-green-50';
    if (severity === 'high') return 'border-orange-200 bg-orange-50';
    return 'border-blue-200 bg-blue-50';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'opportunity':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'trend':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />;
      default:
        return <ChartBarIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border rounded-lg p-4 ${getInsightColor(insight.type, insight.severity)}`}
    >
      <div className="flex items-start space-x-3">
        {getInsightIcon(insight.type)}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{insight.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
          {insight.recommendation && (
            <p className="text-sm text-gray-700 mt-2 font-medium">
              💡 {insight.recommendation}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function MainDashboard() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: insights, isLoading: insightsLoading } = useAnalyticsInsights();
  
  // Chart data hooks
  const { data: revenueData, isLoading: revenueLoading } = useRevenueData();
  const { data: projectStatusData, isLoading: projectStatusLoading } = useProjectStatusData();
  const { data: taskProgressData, isLoading: taskProgressLoading } = useTaskProgressData();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryData();
  const { data: customerSatisfactionData, isLoading: customerSatisfactionLoading } = useCustomerSatisfactionData();

  if (metricsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load dashboard metrics</p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          change={12}
          changeType="increase"
          icon={<CurrencyDollarIcon className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Active Projects"
          value={metrics.activeProjects}
          change={8}
          changeType="increase"
          icon={<ChartBarIcon className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        
        <MetricCard
          title="Completed Tasks"
          value={`${metrics.completedTasks}/${metrics.totalTasks}`}
          change={5}
          changeType="increase"
          icon={<ClipboardDocumentListIcon className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
        
        <MetricCard
          title="Inventory Value"
          value={formatCurrency(metrics.totalInventoryValue)}
          change={3}
          changeType="decrease"
          icon={<CubeIcon className="h-6 w-6 text-white" />}
          color="bg-orange-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Customer Satisfaction"
          value={`${metrics.customerSatisfaction}/5.0`}
          change={2}
          changeType="increase"
          icon={<UsersIcon className="h-6 w-6 text-white" />}
          color="bg-pink-500"
        />
        
        <MetricCard
          title="Projects On Time"
          value={`${metrics.projectsOnTime}%`}
          change={7}
          changeType="increase"
          icon={<CheckCircleIcon className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        
        <MetricCard
          title="Overdue Tasks"
          value={metrics.overdueTasks}
          change={15}
          changeType="decrease"
          icon={<ExclamationTriangleIcon className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
        
        <MetricCard
          title="Low Stock Items"
          value={metrics.lowStockItems}
          change={20}
          changeType="increase"
          icon={<CubeIcon className="h-6 w-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Analytics Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Analytics Insights</h3>
          <span className="text-sm text-gray-500">Real-time analysis</span>
        </div>
        
        {insightsLoading ? (
          <div className="flex items-center justify-center h-32">
            <LoadingSpinner />
          </div>
        ) : insights && insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No insights available</p>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          {revenueLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : revenueData ? (
            <RevenueChart data={revenueData} height={300} />
          ) : (
            <p className="text-gray-500 text-center py-8">No revenue data available</p>
          )}
        </motion.div>

        {/* Project Status Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Status Distribution</h3>
          {projectStatusLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : projectStatusData ? (
            <ProjectStatusChart data={projectStatusData} height={300} />
          ) : (
            <p className="text-gray-500 text-center py-8">No project status data available</p>
          )}
        </motion.div>

        {/* Task Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Progress by Project</h3>
          {taskProgressLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : taskProgressData ? (
            <TaskProgressChart data={taskProgressData} height={300} />
          ) : (
            <p className="text-gray-500 text-center py-8">No task progress data available</p>
          )}
        </motion.div>

        {/* Customer Satisfaction Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Satisfaction Trend</h3>
          {customerSatisfactionLoading ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : customerSatisfactionData ? (
            <CustomerSatisfactionChart data={customerSatisfactionData} height={300} />
          ) : (
            <p className="text-gray-500 text-center py-8">No customer satisfaction data available</p>
          )}
        </motion.div>
      </div>

      {/* Inventory Chart - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Value Distribution</h3>
        {inventoryLoading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : inventoryData ? (
          <InventoryChart data={inventoryData} height={400} />
        ) : (
          <p className="text-gray-500 text-center py-8">No inventory data available</p>
        )}
      </motion.div>
    </div>
  );
}