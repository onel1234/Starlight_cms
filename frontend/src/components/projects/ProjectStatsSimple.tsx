import { useMemo } from 'react'
import { Project, ProjectStatus } from '../../types/project'
import { formatCurrency } from '../../utils/formatters'

interface ProjectStatsProps {
  projects: Project[]
}

const COLORS = {
  'Planning': '#60A5FA',
  'In Progress': '#34D399',
  'On Hold': '#FBBF24',
  'Completed': '#10B981',
  'Closed': '#9CA3AF'
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const stats = useMemo(() => {
    const statusCounts = projects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1
      return acc
    }, {} as Record<ProjectStatus, number>)

    const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0)
    const totalActualCost = projects.reduce((sum, project) => sum + project.actualCost, 0)
    const averageBudget = projects.length > 0 ? totalBudget / projects.length : 0

    const budgetUtilization = totalBudget > 0 ? (totalActualCost / totalBudget) * 100 : 0

    const overBudgetProjects = projects.filter(p => p.actualCost > p.budget).length
    const onTimeProjects = projects.filter(p => {
      const now = new Date()
      const endDate = new Date(p.endDate)
      return p.status === 'Completed' || endDate >= now
    }).length

    return {
      statusCounts,
      totalProjects: projects.length,
      totalBudget,
      totalActualCost,
      averageBudget,
      budgetUtilization,
      overBudgetProjects,
      onTimeProjects
    }
  }, [projects])

  const statusData = Object.entries(stats.statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    color: COLORS[status as ProjectStatus]
  }))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Projects</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalProjects}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Total Budget</p>
              <p className="text-2xl font-bold text-secondary-900">{formatCurrency(stats.totalBudget)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <div className="w-6 h-6 bg-green-600 rounded-full"></div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-secondary-500">
              Avg: {formatCurrency(stats.averageBudget)}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">Budget Utilization</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.budgetUtilization.toFixed(1)}%</p>
            </div>
            <div className={`p-3 rounded-full ${
              stats.budgetUtilization > 100 ? 'bg-red-100' : 
              stats.budgetUtilization > 80 ? 'bg-yellow-100' : 'bg-green-100'
            }`}>
              <div className={`w-6 h-6 rounded-full ${
                stats.budgetUtilization > 100 ? 'bg-red-600' : 
                stats.budgetUtilization > 80 ? 'bg-yellow-600' : 'bg-green-600'
              }`}></div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-secondary-500">
              {formatCurrency(stats.totalActualCost)} spent
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary-600">On Track</p>
              <p className="text-2xl font-bold text-secondary-900">
                {stats.totalProjects > 0 ? Math.round((stats.onTimeProjects / stats.totalProjects) * 100) : 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-secondary-500">
              {stats.overBudgetProjects} over budget
            </p>
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Project Status Distribution</h3>
          <div className="space-y-4">
            {statusData.map((status) => (
              <div key={status.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium text-secondary-700">{status.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-secondary-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: status.color,
                        width: `${stats.totalProjects > 0 ? (status.value / stats.totalProjects) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-secondary-900 w-8 text-right">
                    {status.value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual Cost */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">Budget vs Actual Cost</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-secondary-700">Total Budget</span>
                <span className="text-sm font-semibold text-secondary-900">
                  {formatCurrency(stats.totalBudget)}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-secondary-700">Actual Cost</span>
                <span className="text-sm font-semibold text-secondary-900">
                  {formatCurrency(stats.totalActualCost)}
                </span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-full" 
                  style={{ 
                    width: `${stats.totalBudget > 0 ? Math.min((stats.totalActualCost / stats.totalBudget) * 100, 100) : 0}%` 
                  }} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-secondary-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-secondary-700">Utilization</span>
                <span className={`text-sm font-semibold ${
                  stats.budgetUtilization > 100 ? 'text-red-600' : 
                  stats.budgetUtilization > 80 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {stats.budgetUtilization.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Project Performance Table */}
      <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
        <div className="p-6 border-b border-secondary-200">
          <h3 className="text-lg font-semibold text-secondary-900">Project Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-secondary-200">
            <thead className="bg-secondary-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actual Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-secondary-200">
              {projects.slice(0, 10).map((project) => {
                const variance = project.actualCost - project.budget
                const variancePercent = project.budget > 0 ? (variance / project.budget) * 100 : 0
                const isOverBudget = variance > 0
                
                return (
                  <tr key={project.id} className="hover:bg-secondary-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-secondary-900">{project.name}</div>
                      <div className="text-sm text-secondary-500">{project.projectType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'On Hold' ? 'bg-yellow-100 text-yellow-800' :
                        project.status === 'Planning' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {formatCurrency(project.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                      {formatCurrency(project.actualCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={isOverBudget ? 'text-red-600' : 'text-green-600'}>
                        {isOverBudget ? '+' : ''}{formatCurrency(variance)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              isOverBudget ? 'bg-red-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(Math.abs(variancePercent), 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          isOverBudget ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {variancePercent.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}