import React from 'react'
import { TimelineEvent } from '../../../types/external'
import { formatDate } from '../../../utils/formatters'

interface ProjectTimelineProps {
  timeline: TimelineEvent[]
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ timeline }) => {
  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return '🎯'
      case 'task':
        return '✅'
      case 'meeting':
        return '👥'
      case 'delivery':
        return '🚚'
      case 'payment':
        return '💰'
      default:
        return '📋'
    }
  }

  const getEventColor = (status: TimelineEvent['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'upcoming':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'overdue':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const sortedTimeline = [...timeline].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Timeline</h3>
      
      {sortedTimeline.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No timeline events available
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTimeline.map((event, index) => (
            <div key={event.id} className="flex items-start space-x-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getEventColor(event.status)}`}>
                  <span className="text-lg">{getEventIcon(event.type)}</span>
                </div>
                {index < sortedTimeline.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-300 mt-2" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0 pb-8">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                  <span className="text-xs text-gray-500">{formatDate(event.date)}</span>
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                )}
                
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getEventColor(event.status)}`}>
                    {event.status}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">{event.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}