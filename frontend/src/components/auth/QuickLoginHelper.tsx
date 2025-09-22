import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { testCredentials } from '../../data/mockUsers'

export const QuickLoginHelper: React.FC = () => {
  const { login } = useAuth()

  const handleQuickLogin = async (email: string, password: string, userType: string) => {
    try {
      await login(email, password)
      console.log(`Logged in as ${userType}`)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Login (Demo)</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
        
        {/* Internal Staff */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Internal Staff</h4>
          <button
            onClick={() => handleQuickLogin(testCredentials.director.email, testCredentials.director.password, 'Director')}
            className="w-full text-left px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
          >
            Director
          </button>
          <button
            onClick={() => handleQuickLogin(testCredentials.projectManager.email, testCredentials.projectManager.password, 'Project Manager')}
            className="w-full text-left px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-blue-800"
          >
            Project Manager
          </button>
        </div>

        {/* Customers */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Customers</h4>
          <button
            onClick={() => handleQuickLogin(testCredentials.customer1.email, testCredentials.customer1.password, 'Customer 1')}
            className="w-full text-left px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-800"
          >
            Anderson Industries
          </button>
          <button
            onClick={() => handleQuickLogin(testCredentials.customer2.email, testCredentials.customer2.password, 'Customer 2')}
            className="w-full text-left px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-800"
          >
            Rodriguez Manufacturing
          </button>
          <button
            onClick={() => handleQuickLogin(testCredentials.customer3.email, testCredentials.customer3.password, 'Customer 3')}
            className="w-full text-left px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-green-800"
          >
            Chen Water Solutions
          </button>
        </div>

        {/* Suppliers */}
        <div className="space-y-1">
          <h4 className="font-medium text-gray-700">Suppliers</h4>
          <button
            onClick={() => handleQuickLogin(testCredentials.supplier1.email, testCredentials.supplier1.password, 'Supplier 1')}
            className="w-full text-left px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-purple-800"
          >
            Thompson Equipment
          </button>
          <button
            onClick={() => handleQuickLogin(testCredentials.supplier2.email, testCredentials.supplier2.password, 'Supplier 2')}
            className="w-full text-left px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-purple-800"
          >
            Martinez Steel
          </button>
          <button
            onClick={() => handleQuickLogin(testCredentials.supplier3.email, testCredentials.supplier3.password, 'Supplier 3')}
            className="w-full text-left px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-purple-800"
          >
            Wilson Concrete
          </button>
          <button
            onClick={() => handleQuickLogin(testCredentials.supplier4.email, testCredentials.supplier4.password, 'Supplier 4')}
            className="w-full text-left px-2 py-1 bg-purple-100 hover:bg-purple-200 rounded text-purple-800"
          >
            Davis Filtration
          </button>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p><strong>Password for all accounts:</strong> password123</p>
        <p>Click any button above to quickly login as that user type.</p>
      </div>
    </div>
  )
}