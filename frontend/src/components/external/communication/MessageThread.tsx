import React, { useState, useRef, useEffect } from 'react'
import { MessageThread as MessageThreadType, ExternalMessage } from '../../../types/external'
import { useThreadMessages, useSendMessage, useMarkMessageAsRead } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { formatDate } from '../../../utils/formatters'

interface MessageThreadProps {
  thread: MessageThreadType
  currentUserId: number
}

export const MessageThread: React.FC<MessageThreadProps> = ({ thread, currentUserId }) => {
  const [newMessage, setNewMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { data: messages, isLoading } = useThreadMessages(thread.id)
  const sendMessage = useSendMessage()
  const markAsRead = useMarkMessageAsRead()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mark unread messages as read when thread is opened
    const unreadMessages = messages?.filter(m => 
      m.receiverId === currentUserId && !m.readAt
    ) || []
    
    unreadMessages.forEach(message => {
      markAsRead.mutate(message.id)
    })
  }, [messages, currentUserId, markAsRead])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    // For simplicity, send to the first other participant
    const receiverId = thread.participants.find(id => id !== currentUserId) || 0

    sendMessage.mutate({
      senderId: currentUserId,
      receiverId,
      subject: `Re: ${thread.subject}`,
      content: newMessage.trim(),
      threadId: thread.id,
      type: 'inquiry'
    }, {
      onSuccess: () => {
        setNewMessage('')
      }
    })
  }

  const getMessageTypeIcon = (type: ExternalMessage['type']) => {
    switch (type) {
      case 'inquiry':
        return '❓'
      case 'update':
        return '📢'
      case 'notification':
        return '🔔'
      case 'support':
        return '🆘'
      default:
        return '💬'
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Thread Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900">{thread.subject}</h3>
        <p className="text-sm text-gray-600">
          {thread.participants.length} participants • Last message {formatDate(thread.lastMessageAt)}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages?.map((message) => {
          const isOwnMessage = message.senderId === currentUserId
          
          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isOwnMessage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm">{getMessageTypeIcon(message.type)}</span>
                  <span className={`text-xs ${
                    isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatDate(message.sentAt)}
                  </span>
                </div>
                
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className={`text-xs p-2 rounded ${
                          isOwnMessage ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      >
                        📎 {attachment.name}
                      </div>
                    ))}
                  </div>
                )}
                
                {isOwnMessage && (
                  <div className={`text-xs mt-1 ${
                    message.readAt ? 'text-blue-200' : 'text-blue-300'
                  }`}>
                    {message.readAt ? '✓✓ Read' : '✓ Sent'}
                  </div>
                )}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sendMessage.isPending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sendMessage.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendMessage.isPending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}