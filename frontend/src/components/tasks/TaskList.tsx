import { useState } from 'react'
import { Plus, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { Task, CreateTaskData, UpdateTaskData } from '../../types/project'
import { TaskFilters as TaskFiltersType } from '../../services/mockTaskService'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useStartTimeLog, useStopTimeLog } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import { TaskFilters } from './TaskFilters'
import { TaskCard } from './TaskCard'
import { TaskForm } from './TaskForm'
import { TaskDependencyVisualization } from './TaskDependencyVisualization'
import { TimeLoggingInterface } from './TimeLoggingInterface'
import { TaskApprovalWorkflow } from './TaskApprovalWorkflow'

type ViewMode = 'grid' | 'list'

export function TaskList() {
  const [filters, setFilters] = useState<TaskFiltersType>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showDependencies, setShowDependencies] = useState<Task | null>(null)
  const [showTimeLogging, setShowTimeLogging] = useState<Task | null>(null)
  const [showApprovalWorkflow, setShowApprovalWorkflow] = useState<Task | null>(null)
  const [activeTimers, setActiveTimers] = useState<Set<number>>(new Set())

  const { user } = useAuth()
  const { data: tasksResponse, isLoading, error } = useTasks(filters)
  const updateTaskMutation = useUpdateTask()
  const deleteTaskMutation = useDeleteTask()
  const startTimeLogMutation = useStartTimeLog()
  const stopTimeLogMutation = useStopTimeLog()
  const createTaskMutation = useCreateTask()

  const handleCreateTask = () => {
    setSelectedTask(null)
    setShowTaskForm(true)
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setShowTaskForm(true)
  }

  const handleDeleteTask = (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTaskMutation.mutate(id)
    }
  }

  const handleUpdateProgress = (id: number, progress: number) => {
    updateTaskMutation.mutate({
      id,
      data: { completionPercentage: progress }
    })
  }

  const handleStartTimer = (taskId: number) => {
    if (!user) return
    
    startTimeLogMutation.mutate({
      taskId,
      userId: user.id
    })
    setActiveTimers(prev => new Set([...prev, taskId]))
  }

  const handleStopTimer = (taskId: number) => {
    // In a real app, we'd get the active time log ID from the API
    // For now, we'll simulate stopping the timer
    stopTimeLogMutation.mutate(1) // Mock ID
    setActiveTimers(prev => {
      const newSet = new Set(prev)
      newSet.delete(taskId)
      return newSet
    })
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const canCreateTasks = user?.role !== 'Customer' && user?.role !== 'Supplier'

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <p className="text-lg font-medium">Error loading tasks</p>
          <p className="text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Tasks</h1>
          <p className="mt-1 text-sm text-secondary-600">
            Manage and track project tasks and assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Create Task Button */}
          {canCreateTasks && (
            <button
              onClick={handleCreateTask}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onFiltersChange={setFilters} />

      {/* Tasks Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      ) : !tasksResponse?.tasks.length ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">
              {Object.keys(filters).some(key => filters[key as keyof TaskFiltersType] && key !== 'page' && key !== 'limit')
                ? 'Try adjusting your filters to see more tasks.'
                : 'Create your first task to get started.'
              }
            </p>
          </div>
          {canCreateTasks && (
            <button
              onClick={handleCreateTask}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Create Task
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {tasksResponse.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={canCreateTasks ? handleEditTask : undefined}
                onDelete={canCreateTasks ? handleDeleteTask : undefined}
                onUpdateProgress={handleUpdateProgress}
                onStartTimer={handleStartTimer}
                onStopTimer={handleStopTimer}
                onViewDependencies={setShowDependencies}
                onViewTimeLogs={setShowTimeLogging}
                onViewApprovalWorkflow={setShowApprovalWorkflow}
                isTimerRunning={activeTimers.has(task.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {tasksResponse.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((tasksResponse.page - 1) * tasksResponse.limit) + 1} to{' '}
                {Math.min(tasksResponse.page * tasksResponse.limit, tasksResponse.total)} of{' '}
                {tasksResponse.total} tasks
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(tasksResponse.page - 1)}
                  disabled={tasksResponse.page === 1}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-900">
                  {tasksResponse.page} of {tasksResponse.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(tasksResponse.page + 1)}
                  disabled={tasksResponse.page === tasksResponse.totalPages}
                  className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <TaskForm
        task={selectedTask || undefined}
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false)
          setSelectedTask(null)
        }}
        onSubmit={(data) => {
          if (selectedTask) {
            updateTaskMutation.mutate({
              id: selectedTask.id,
              data: data as UpdateTaskData
            })
          } else {
            createTaskMutation.mutate(data as CreateTaskData)
          }
          setShowTaskForm(false)
          setSelectedTask(null)
        }}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      {showDependencies && (
        <TaskDependencyVisualization
          task={showDependencies}
          allTasks={tasksResponse?.tasks || []}
          isOpen={true}
          onClose={() => setShowDependencies(null)}
        />
      )}

      {showTimeLogging && (
        <TimeLoggingInterface
          task={showTimeLogging}
          isOpen={true}
          onClose={() => setShowTimeLogging(null)}
        />
      )}

      {showApprovalWorkflow && (
        <TaskApprovalWorkflow
          task={showApprovalWorkflow}
          isOpen={true}
          onClose={() => setShowApprovalWorkflow(null)}
        />
      )}
    </div>
  )
}