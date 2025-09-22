import React from 'react'
import { Link } from 'react-router-dom'
import { LoginCredentialsCard } from '../../components/auth/LoginCredentialsCard'

export const CredentialsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Star Light CMS - Demo Credentials
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Test accounts for exploring different user roles and portal experiences
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Go to Login Page
          </Link>
        </div>

        {/* Credentials Card */}
        <LoginCredentialsCard />

        {/* Portal Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Internal Portal */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🏢</div>
              <h3 className="text-lg font-semibold text-gray-900">Internal Portal</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Full construction management system for internal staff
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>Access:</strong> <code>/</code></div>
              <div><strong>Features:</strong> Projects, Tasks, Inventory, Financial, Reports</div>
              <div><strong>Roles:</strong> Director, Project Manager, QS, Sales Manager</div>
            </div>
          </div>

          {/* Customer Portal */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🏗️</div>
              <h3 className="text-lg font-semibold text-gray-900">Customer Portal</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Project tracking and communication for construction clients
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>Access:</strong> <code>/customer</code></div>
              <div><strong>Features:</strong> Project Progress, Documents, Feedback, Messages</div>
              <div><strong>Projects:</strong> Water Treatment, Sewerage System</div>
            </div>
          </div>

          {/* Supplier Portal */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <div className="text-2xl mr-3">🚚</div>
              <h3 className="text-lg font-semibold text-gray-900">Supplier Portal</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Tender management and order tracking for suppliers
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>Access:</strong> <code>/supplier</code></div>
              <div><strong>Features:</strong> Tenders, Quotations, Orders, Messages</div>
              <div><strong>Specialties:</strong> Equipment, Steel, Concrete, Filtration</div>
            </div>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">🚀 Quick Start Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">1. Choose a User Type</h4>
              <p className="text-blue-700">
                Select from Internal Staff, Customers, or Suppliers based on what you want to explore
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">2. Login with Test Credentials</h4>
              <p className="text-blue-700">
                Use the "Quick Login" buttons or copy credentials to the login form
              </p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">3. Explore Portal Features</h4>
              <p className="text-blue-700">
                Navigate through different sections to see role-specific functionality
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This is a demo system with mock data. All credentials use "password123" for simplicity.
          </p>
        </div>
      </div>
    </div>
  )
}