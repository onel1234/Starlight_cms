import { useState, useEffect } from 'react'
import { X, Play, Pause, Clock, Calendar, User } from 'lucide-react'
import { Task } from '../../types/project'
import { TimeLog } from '../../services/mockTaskService'
import { useTimeLogs, useStartTimeLog, useStopTimeLog } from '../../hooks/useTasks'
import { useAuth } from '../../hooks/useAuth'
import { formatDate, formatDuration, formatTime } from '../../utils/formatters'

interface TimeLoggingInterfaceProps {
  task: Task
  isOpen: boolean
  onClose: () => void
}

export function TimeLoggingInterface({ task, isOpen, onClose }: TimeLoggingInterfaceProps) {
  const [description, setDescription] = useState('')
  const [currentTimer, setCurrentTimer] = useState<TimeLog | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  const { user } = useAuth()
  const { data: timeLogs = [], isLoading } = useTimeLogs(task.id)
  const startTimeLogMutation = useStartTimeLog()
  const stopTimeLogMutation = useStopTimeLog()

  // Find active timer for current user
  useEffect(() => {
    const activeTimer = timeLogs.find(log => 
      log.userId === user?.id && !log.endTime
    )
    setCurrentTimer(activeTimer || null)
  }, [timeLogs, user?.id])

  // Update elapsed time for active timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (currentTimer) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - new Date(currentTimer.startTime).getTime()) / 1000)
        setElapsedTime(elapsed)
      }, 1000)
    } else {
      setElapsedTime(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentTimer])

  const handleStartTimer = () => {
    if (!user) return

    startTimeLogMutation.mutate({
      taskId: task.id,
      userId: user.id,
      description: description.trim() || undefined
    })
    setDescription('')
  }

  const handleStopTimer = () => {
    if (currentTimer) {
      stopTimeLogMutation.mutate(currentTimer.id)
    }
  }

  const totalLoggedTime = timeLogs
    .filter(log => log.endTime)
    .reduce((total, log) => total + (log.duration || 0), 0)

  const formatElapsedTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Time Tracking - {task.title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Timer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-blue-900">Current Session</h3>
              <div className="text-2xl font-mono font-bold text-blue-900">
                {formatElapsedTime(elapsedTime)}
              </div>
            </div>

            {currentTimer ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-blue-700">
                  <span>Started: {formatTime(currentTimer.startTime)}</span>
                  {currentTimer.description && (
                    <span>• {currentTimer.description}</span>
                  )}
                </div>
                <button
                  onClick={handleStopTimer}
                  disabled={stopTimeLogMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <Pause className="h-4 w-4" />
                  Stop Timer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-blue-900 mb-2">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleStartTimer}
                  disabled={startTimeLogMutation.isPending || task.status === 'Completed'}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <Play className="h-4 w-4" />
                  Start Timer
                </button>
              </div>
            )}
          </div>

          {/* Time Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Total Logged</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatDuration(totalLoggedTime)}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Estimated</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {task.estimatedHours ? `${task.estimatedHours}h` : 'N/A'}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Progress</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {task.completionPercentage}%
              </div>
            </div>
          </div>

          {/* Time Logs History */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Time Log History</h3>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading time logs...</p>
              </div>
            ) : timeLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No time logs recorded yet.</p>
                <p className="text-sm mt-1">Start a timer to begin tracking your work.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeLogs
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-medium text-gray-900">
                            {formatDate(log.startTime)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(log.startTime)} - {log.endTime ? formatTime(log.endTime) : 'In Progress'}
                          </span>
                        </div>
                        {log.description && (
                          <p className="text-sm text-gray-600">{log.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {log.duration ? formatDuration(log.duration) : formatElapsedTime(elapsedTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.endTime ? 'Completed' : 'Active'}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
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