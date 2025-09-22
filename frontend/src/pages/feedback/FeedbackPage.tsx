import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { FeedbackForm } from '../../components/feedback/FeedbackForm'
import { FeedbackAnalytics } from '../../components/feedback/FeedbackAnalytics'
import { FeedbackCard } from '../../components/feedback/FeedbackCard'
import { useAuth } from '../../hooks/useAuth'
import { useFeedback } from '../../hooks/useFeedback'

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth()
  const { data: feedback, isLoading: loading } = useFeedback()
  const [activeTab, setActiveTab] = useState<'submit' | 'view' | 'analytics'>('submit')

  if (!user) return null

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Feedback Management</h1>
        <p className="text-gray-600">Submit and manage project feedback</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('submit')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'submit'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Submit Feedback
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            View Feedback
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'submit' && (
        <div className="max-w-2xl">
          <FeedbackForm isModal={false} />
        </div>
      )}

      {activeTab === 'view' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">Loading feedback...</div>
          ) : !feedback || feedback.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No feedback available</div>
          ) : (
            feedback.map((item) => (
              <FeedbackCard key={item.id} feedback={item} />
            ))
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <FeedbackAnalytics />
      )}
    </div>
  )
}