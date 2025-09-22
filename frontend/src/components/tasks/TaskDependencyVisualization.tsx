import { useState, useEffect } from 'react'
import { X, Plus, Trash2, ArrowRight } from 'lucide-react'
import { Task } from '../../types/project'
import { TaskDependency } from '../../services/mockTaskService'
import { useTaskDependencies, useAddTaskDependency, useRemoveTaskDependency } from '../../hooks/useTasks'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'

interface TaskDependencyVisualizationProps {
  task: Task
  allTasks: Task[]
  isOpen: boolean
  onClose: () => void
}

export function TaskDependencyVisualization({ 
  task, 
  allTasks, 
  isOpen, 
  onClose 
}: TaskDependencyVisualizationProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null)
  
  const { data: dependencies = [], isLoading } = useTaskDependencies(task.id)
  const addDependencyMutation = useAddTaskDependency()
  const removeDependencyMutation = useRemoveTaskDependency()

  const availableTasks = allTasks.filter(t => 
    t.id !== task.id && 
    t.projectId === task.projectId &&
    !dependencies.some(d => d.dependsOnTaskId === t.id)
  )

  const dependentTasks = dependencies.map(dep => 
    allTasks.find(t => t.id === dep.dependsOnTaskId)
  ).filter(Boolean) as Task[]

  const handleAddDependency = () => {
    if (selectedTaskId) {
      addDependencyMutation.mutate({
        taskId: task.id,
        dependsOnTaskId: selectedTaskId
      })
      setSelectedTaskId(null)
    }
  }

  const handleRemoveDependency = (dependencyId: number) => {
    removeDependencyMutation.mutate(dependencyId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Task Dependencies - {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Task */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Current Task</h3>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
            </div>
          </div>

          {/* Add New Dependency */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Add Dependency</h3>
            <div className="flex items-center gap-3">
              <select
                value={selectedTaskId || ''}
                onChange={(e) => setSelectedTaskId(e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a task this depends on...</option>
                {availableTasks.map((availableTask) => (
                  <option key={availableTask.id} value={availableTask.id}>
                    {availableTask.title} ({availableTask.status})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddDependency}
                disabled={!selectedTaskId || addDependencyMutation.isPending}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This task will be blocked until the selected dependency is completed.
            </p>
          </div>

          {/* Dependencies Visualization */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Dependencies</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading dependencies...</p>
              </div>
            ) : dependentTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No dependencies found.</p>
                <p className="text-sm mt-1">This task can be started immediately.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dependencies.map((dependency) => {
                  const dependentTask = allTasks.find(t => t.id === dependency.dependsOnTaskId)
                  if (!dependentTask) return null

                  return (
                    <div key={dependency.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                      {/* Dependent Task */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{dependentTask.title}</h4>
                          <div className="flex items-center gap-2">
                            <TaskStatusBadge status={dependentTask.status} />
                            <TaskPriorityBadge priority={dependentTask.priority} />
                          </div>
                        </div>
                        {dependentTask.description && (
                          <p className="text-sm text-gray-600">{dependentTask.description}</p>
                        )}
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center text-gray-400">
                        <ArrowRight className="h-5 w-5" />
                      </div>

                      {/* Current Task (simplified) */}
                      <div className="flex-1">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <h4 className="font-medium text-gray-700">{task.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">
                            {dependentTask.status === 'Completed' 
                              ? 'Can proceed' 
                              : 'Waiting for dependency'
                            }
                          </p>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveDependency(dependency.id)}
                        disabled={removeDependencyMutation.isPending}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                        title="Remove dependency"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Dependency Rules */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Dependency Rules</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Tasks cannot start until all their dependencies are completed</li>
              <li>• Circular dependencies are not allowed</li>
              <li>• Dependencies can only be created within the same project</li>
              <li>• Removing a dependency will allow the task to start immediately</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}