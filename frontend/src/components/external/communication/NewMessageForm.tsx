import React, { useState } from 'react'
import { useSendMessage } from '../../../hooks/useExternal'

interface NewMessageFormProps {
  currentUserId: number
  onClose: () => void
  onSent: () => void
}

export const NewMessageForm: React.FC<NewMessageFormProps> = ({
  currentUserId,
  onClose,
  onSent
}) => {
  const [recipient, setRecipient] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [messageType, setMessageType] = useState<'inquiry' | 'update' | 'support'>('inquiry')

  const sendMessage = useSendMessage()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!recipient || !subject.trim() || !content.trim()) {
      return
    }

    sendMessage.mutate({
      senderId: currentUserId,
      receiverId: parseInt(recipient),
      subject: subject.trim(),
      content: content.trim(),
      type: messageType
    }, {
      onSuccess: () => {
        onSent()
      }
    })
  }

  // Mock recipients - in real app, this would come from an API
  const availableRecipients = [
    { id: 2, name: 'Project Manager', role: 'Project Manager' },
    { id: 3, name: 'Sales Manager', role: 'Sales Manager' },
    { id: 4, name: 'Customer Success Manager', role: 'Customer Success Manager' },
    { id: 5, name: 'Procurement Manager', role: 'Procurement Manager' }
  ]

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Form */}
      <div className="flex-1 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Recipient */}
          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-2">
              Send to *
            </label>
            <select
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select recipient</option>
              {availableRecipients.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.role})
                </option>
              ))}
            </select>
          </div>

          {/* Message Type */}
          <div>
            <label htmlFor="messageType" className="block text-sm font-medium text-gray-700 mb-2">
              Message Type
            </label>
            <select
              id="messageType"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="inquiry">Inquiry</option>
              <option value="update">Update</option>
              <option value="support">Support Request</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter message subject"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your message here..."
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {content.length}/1000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!recipient || !subject.trim() || !content.trim() || sendMessage.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendMessage.isPending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}