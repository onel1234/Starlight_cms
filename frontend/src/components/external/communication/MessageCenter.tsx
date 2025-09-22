import React, { useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { useMessageThreads } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { MessageThreadList } from './MessageThreadList'
import { MessageThread } from './MessageThread'
import { NewMessageForm } from './NewMessageForm'

export const MessageCenter: React.FC = () => {
  const { user } = useAuth()
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null)
  const [showNewMessage, setShowNewMessage] = useState(false)

  const { data: threads, isLoading, error } = useMessageThreads(user?.id || 0)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Messages</h3>
        <p className="text-red-600 mt-2">Unable to load your messages. Please try again later.</p>
      </div>
    )
  }

  const selectedThread = threads?.find(t => t.id === selectedThreadId)

  return (
    <div className="h-[calc(100vh-200px)] flex bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Sidebar - Thread List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
            <button
              onClick={() => setShowNewMessage(true)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              New Message
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <MessageThreadList
            threads={threads || []}
            selectedThreadId={selectedThreadId}
            onSelectThread={setSelectedThreadId}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <MessageThread
            thread={selectedThread}
            currentUserId={user?.id || 0}
          />
        ) : showNewMessage ? (
          <NewMessageForm
            currentUserId={user?.id || 0}
            onClose={() => setShowNewMessage(false)}
            onSent={() => {
              setShowNewMessage(false)
              // Optionally select the new thread
            }}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a message thread to start communicating</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}