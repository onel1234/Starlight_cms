import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useFinancialAnalytics } from '../../hooks/useFinancial';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useToast } from '../../contexts/ToastContext';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

type ReportType = 'revenue' | 'expenses' | 'profit' | 'payments' | 'invoices' | 'custom';
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';

export const FinancialReporting: React.FC = () => {
  const { success } = useToast();
  const { data: analytics, isLoading } = useFinancialAnalytics();
  
  const [selectedReport, setSelectedReport] = useState<ReportType>('revenue');
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [customDateRange, setCustomDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    { id: 'revenue' as ReportType, name: 'Revenue Analysis', icon: CurrencyDollarIcon },
    { id: 'expenses' as ReportType, name: 'Expense Tracking', icon: ArrowTrendingDownIcon },
    { id: 'profit' as ReportType, name: 'Profit & Loss', icon: ArrowTrendingUpIcon },
    { id: 'payments' as ReportType, name: 'Payment Status', icon: ChartBarIcon },
    { id: 'invoices' as ReportType, name: 'Invoice Analytics', icon: DocumentArrowDownIcon },
    { id: 'custom' as ReportType, name: 'Custom Report', icon: CalendarIcon }
  ];

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    success(`Report exported as ${format.toUpperCase()}`);
  };

  const generateCustomReport = () => {
    success('Custom report generated successfully');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!analytics) {
    return <div>No analytics data available</div>;
  }

  const renderRevenueChart = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                ${analytics.netProfit.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {analytics.profitMargin}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Monthly Revenue vs Expenses
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={analytics.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stackId="1" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.6}
              name="Revenue"
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stackId="2" 
              stroke="#EF4444" 
              fill="#EF4444" 
              fillOpacity={0.6}
              name="Expenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderPaymentStatusChart = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Payment Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.paymentStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {analytics.paymentStatus.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Payment Status Summary
          </h3>
          <div className="space-y-4">
            {analytics.paymentStatus.map((status, index) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-900 dark:text-white">{status.status}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    ${status.amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {status.count} invoices
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Outstanding vs Overdue Amounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Outstanding Invoices
                </p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  ${analytics.outstandingInvoices.toLocaleString()}
                </p>
              </div>
              <CalendarIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          
          <div className="p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Overdue Invoices
                </p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-100">
                  ${analytics.overdueInvoices.toLocaleString()}
                </p>
              </div>
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfitLossChart = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Profit & Loss Trend
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analytics.monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10B981" 
              strokeWidth={3}
              name="Revenue"
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#EF4444" 
              strokeWidth={3}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Total Revenue
          </h4>
          <p className="text-3xl font-bold text-green-600">
            ${analytics.totalRevenue.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            +12.5% from last period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Total Expenses
          </h4>
          <p className="text-3xl font-bold text-red-600">
            ${analytics.totalExpenses.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            +8.3% from last period
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">
            Net Profit
          </h4>
          <p className="text-3xl font-bold text-blue-600">
            ${analytics.netProfit.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Margin: {analytics.profitMargin}%
          </p>
        </div>
      </div>
    </div>
  );

  const renderCustomReportBuilder = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Custom Report Builder
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Report Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Financial Summary</option>
                <option>Revenue Analysis</option>
                <option>Expense Breakdown</option>
                <option>Payment Status</option>
                <option>Customer Analysis</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={customDateRange.start}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="date"
                  value={customDateRange.end}
                  onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filters
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include pending payments</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Group by customer</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Include tax breakdown</span>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chart Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Bar Chart</option>
                <option>Line Chart</option>
                <option>Pie Chart</option>
                <option>Area Chart</option>
                <option>Table Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grouping
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>

            <button
              onClick={generateCustomReport}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (selectedReport) {
      case 'revenue':
      case 'expenses':
        return renderRevenueChart();
      case 'profit':
        return renderProfitLossChart();
      case 'payments':
      case 'invoices':
        return renderPaymentStatusChart();
      case 'custom':
        return renderCustomReportBuilder();
      default:
        return renderRevenueChart();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Financial Reporting & Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive financial reports with charts and analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleExportReport('pdf')}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={() => handleExportReport('excel')}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button
            onClick={() => handleExportReport('csv')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedReport === type.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  selectedReport === type.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedReport === type.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                }`}>
                  {type.name}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Range Selection */}
      {selectedReport !== 'custom' && (
        <div className="flex space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="custom">Custom range</option>
          </select>
          
          {timeRange === 'custom' && (
            <div className="flex space-x-2">
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
        </div>
      )}

      {/* Report Content */}
      <motion.div
        key={selectedReport}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderContent()}
      </motion.div>
    </div>
  );
};