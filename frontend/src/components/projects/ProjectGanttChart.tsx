import { useMemo } from 'react'
import { Project, Task } from '../../types/project'
import { formatDate } from '../../utils/formatters'

interface ProjectGanttChartProps {
  projects: Project[]
  tasks?: Task[]
  viewMode?: 'month' | 'week' | 'day'
  onTaskClick?: (project: Project) => void
}

export function ProjectGanttChart({ 
  projects, 
  tasks = [], 
  viewMode = 'month',
  onTaskClick
}: ProjectGanttChartProps) {
  const timelineData = useMemo(() => {
    if (projects.length === 0) return { projects: [], startDate: new Date(), endDate: new Date(), totalDays: 0 }

    const allDates = projects.flatMap(p => [new Date(p.startDate), new Date(p.endDate)])
    const startDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const endDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const projectsWithPosition = projects.map(project => {
      const projectStart = new Date(project.startDate)
      const projectEnd = new Date(project.endDate)
      const startOffset = Math.ceil((projectStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const duration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
      
      return {
        ...project,
        startOffset,
        duration,
        widthPercent: (duration / totalDays) * 100,
        leftPercent: (startOffset / totalDays) * 100
      }
    })

    return { projects: projectsWithPosition, startDate, endDate, totalDays }
  }, [projects])

  const getStatusColor = (status: string) => {
    const colors = {
      'Planning': 'bg-blue-500',
      'In Progress': 'bg-green-500',
      'On Hold': 'bg-yellow-500',
      'Completed': 'bg-emerald-500',
      'Closed': 'bg-gray-500'
    }
    return colors[status as keyof typeof colors] || 'bg-blue-500'
  }

  const getStatusBgColor = (status: string) => {
    const colors = {
      'Planning': 'bg-blue-100',
      'In Progress': 'bg-green-100',
      'On Hold': 'bg-yellow-100',
      'Completed': 'bg-emerald-100',
      'Closed': 'bg-gray-100'
    }
    return colors[status as keyof typeof colors] || 'bg-blue-100'
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-secondary-50 rounded-lg border border-secondary-200">
        <div className="text-center">
          <p className="text-secondary-600">No projects to display</p>
          <p className="text-sm text-secondary-500 mt-1">Create a project to see the timeline</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-secondary-200 overflow-hidden">
      <div className="p-4 border-b border-secondary-200">
        <h3 className="text-lg font-semibold text-secondary-900">Project Timeline</h3>
        <p className="text-sm text-secondary-600 mt-1">
          Timeline showing project schedules and durations
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-4">
          {/* Timeline Header */}
          <div className="flex items-center mb-4 text-sm text-secondary-600">
            <div className="w-48 flex-shrink-0">Project</div>
            <div className="flex-1 flex justify-between px-4">
              <span>{formatDate(timelineData.startDate)}</span>
              <span>{formatDate(timelineData.endDate)}</span>
            </div>
            <div className="w-24 text-right">Duration</div>
          </div>

          {/* Timeline Bars */}
          <div className="space-y-3">
            {timelineData.projects.map((project) => (
              <div key={project.id} className="flex items-center">
                {/* Project Name */}
                <div className="w-48 flex-shrink-0 pr-4">
                  <div className="text-sm font-medium text-secondary-900 truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-secondary-500">
                    {project.projectType}
                  </div>
                </div>

                {/* Timeline Bar Container */}
                <div className="flex-1 relative h-8 bg-secondary-100 rounded-lg mx-4">
                  {/* Project Bar */}
                  <div
                    className={`absolute top-1 bottom-1 rounded-md cursor-pointer transition-all hover:opacity-80 ${getStatusColor(project.status)} ${getStatusBgColor(project.status)} border-l-4 ${getStatusColor(project.status).replace('bg-', 'border-')}`}
                    style={{
                      left: `${project.leftPercent}%`,
                      width: `${Math.max(project.widthPercent, 2)}%`
                    }}
                    onClick={() => onTaskClick?.(project)}
                    title={`${project.name} (${formatDate(project.startDate)} - ${formatDate(project.endDate)})`}
                  >
                    <div className="px-2 py-1 text-xs font-medium text-white truncate">
                      {project.status}
                    </div>
                  </div>

                  {/* Progress Indicator */}
                  {project.status === 'In Progress' && (
                    <div
                      className="absolute top-1 bottom-1 bg-green-600 rounded-md opacity-60"
                      style={{
                        left: `${project.leftPercent}%`,
                        width: `${(project.widthPercent * 0.5)}%` // Assuming 50% progress for in-progress projects
                      }}
                    />
                  )}
                </div>

                {/* Duration */}
                <div className="w-24 text-right text-sm text-secondary-600">
                  {project.duration} days
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-secondary-200">
            <div className="flex flex-wrap gap-4 text-xs">
              {Object.entries({
                'Planning': 'bg-blue-500',
                'In Progress': 'bg-green-500',
                'On Hold': 'bg-yellow-500',
                'Completed': 'bg-emerald-500',
                'Closed': 'bg-gray-500'
              }).map(([status, color]) => (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${color}`} />
                  <span className="text-secondary-600">{status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}