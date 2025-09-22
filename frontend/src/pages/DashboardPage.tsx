import { motion } from 'framer-motion'
import { 
  FolderIcon, 
  CheckSquareIcon, 
  PackageIcon, 
  DollarSignIcon,
  TrendingUpIcon,
  AlertTriangleIcon
} from 'lucide-react'

const stats = [
  {
    name: 'Active Projects',
    value: '12',
    change: '+2.1%',
    changeType: 'positive',
    icon: FolderIcon,
  },
  {
    name: 'Pending Tasks',
    value: '48',
    change: '-4.3%',
    changeType: 'negative',
    icon: CheckSquareIcon,
  },
  {
    name: 'Low Stock Items',
    value: '7',
    change: '+1.2%',
    changeType: 'positive',
    icon: PackageIcon,
  },
  {
    name: 'Monthly Revenue',
    value: '$124,500',
    change: '+12.5%',
    changeType: 'positive',
    icon: DollarSignIcon,
  },
]

const recentActivities = [
  {
    id: 1,
    type: 'project',
    message: 'New project "Water Treatment Plant" created',
    time: '2 hours ago',
  },
  {
    id: 2,
    type: 'task',
    message: 'Task "Site Survey" completed by John Doe',
    time: '4 hours ago',
  },
  {
    id: 3,
    type: 'inventory',
    message: 'Low stock alert for PVC Pipes',
    time: '6 hours ago',
  },
  {
    id: 4,
    type: 'financial',
    message: 'Invoice #INV-2024-001 sent to client',
    time: '1 day ago',
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p className="mt-1 text-sm text-secondary-600">
          Welcome back! Here's what's happening with your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-secondary-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <TrendingUpIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      ) : (
                        <AlertTriangleIcon className="h-4 w-4 flex-shrink-0 self-center" />
                      )}
                      <span className="sr-only">
                        {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                      </span>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-2 w-2 bg-primary-600 rounded-full mt-2"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-secondary-900">{activity.message}</p>
                  <p className="text-xs text-secondary-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="btn-primary text-center py-3">
              New Project
            </button>
            <button className="btn-secondary text-center py-3">
              Add Task
            </button>
            <button className="btn-secondary text-center py-3">
              Create Invoice
            </button>
            <button className="btn-secondary text-center py-3">
              Generate Report
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}