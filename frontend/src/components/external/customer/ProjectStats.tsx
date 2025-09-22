import React from 'react'
import { CustomerProject } from '../../../types/external'
import { formatCurrency } from '../../../utils/formatters'

interface ProjectStatsProps {
  projects: CustomerProject[]
}

export const ProjectStats: React.FC<ProjectStatsProps> = ({ projects }) => {
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status === 'In Progress').length
  const completedProjects = projects.filter(p => p.status === 'Completed').length
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
  const totalSpent = projects.reduce((sum, p) => sum + p.actualCost, 0)

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects,
      icon: '📊',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: '🚧',
      color: 'bg-orange-50 text-orange-700'
    },
    {
      label: 'Completed Projects',
      value: completedProjects,
      icon: '✅',
      color: 'bg-green-50 text-green-700'
    },
    {
      label: 'Total Budget',
      value: formatCurrency(totalBudget),
      icon: '💰',
      color: 'bg-purple-50 text-purple-700'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${stat.color} mr-4`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}