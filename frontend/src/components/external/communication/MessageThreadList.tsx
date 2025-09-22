import React from 'react'
import { MessageThread } from '../../../types/external'
import { formatDate } from '../../../utils/formatters'

interface MessageThreadListProps {
  threads: MessageThread[]
  selectedThreadId: number | null
  onSelectThread: (threadId: number) => void
}

export const MessageThreadList: React.FC<MessageThreadListProps> = ({
  threads,
  selectedThreadId,
  onSelectThread
}) => {
  if (threads.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-4xl mb-2">📭</div>
        <p>No messages yet</p>
        <p className="text-sm">Start a new conversation</p>
      </div>
    )
  }

  const sortedThreads = [...threads].sort((a, b) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  )

  return (
    <div className="divide-y divide-gray-200">
      {sortedThreads.map((thread) => {
        const isSelected = thread.id === selectedThreadId
        const hasUnread = thread.unreadCount > 0
        
        return (
          <button
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className={`text-sm font-medium truncate ${
                hasUnread ? 'text-gray-900' : 'text-gray-700'
              }`}>
                {thread.subject}
              </h4>
              {hasUnread && (
                <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {thread.unreadCount}
                </span>
              )}
            </div>
            
            <p className={`text-xs mb-2 line-clamp-2 ${
              hasUnread ? 'text-gray-700' : 'text-gray-500'
            }`}>
              {thread.messages[thread.messages.length - 1]?.content || 'No messages'}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {formatDate(thread.lastMessageAt)}
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400">
                  {thread.participants.length} participants
                </span>
                {hasUnread && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}