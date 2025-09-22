import React, { useState } from 'react'
import { testCredentials } from '../../data/mockUsers'

interface LoginCredentialsCardProps {
    onCredentialSelect?: (email: string, password: string) => void
}

export const LoginCredentialsCard: React.FC<LoginCredentialsCardProps> = ({
    onCredentialSelect
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [copiedCredential, setCopiedCredential] = useState<string | null>(null)

    const categories = [
        { id: 'all', label: 'All Users', icon: '👥' },
        { id: 'internal', label: 'Internal Staff', icon: '🏢' },
        { id: 'customers', label: 'Customers', icon: '🏗️' },
        { id: 'suppliers', label: 'Suppliers', icon: '🚚' }
    ]

    const credentialGroups = {
        internal: [
            {
                role: 'Director',
                name: 'John Smith',
                email: testCredentials.director.email,
                password: testCredentials.director.password,
                description: 'Full system access, all features',
                color: 'bg-purple-100 text-purple-800 border-purple-200'
            },
            {
                role: 'Project Manager',
                name: 'Sarah Johnson',
                email: testCredentials.projectManager.email,
                password: testCredentials.projectManager.password,
                description: 'Project management and team coordination',
                color: 'bg-blue-100 text-blue-800 border-blue-200'
            }
        ],
        customers: [
            {
                role: 'Customer',
                name: 'Michael Anderson (Anderson Industries)',
                email: testCredentials.customer1.email,
                password: testCredentials.customer1.password,
                description: 'Water Treatment Plant project owner',
                color: 'bg-green-100 text-green-800 border-green-200'
            },
            {
                role: 'Customer',
                name: 'Emily Rodriguez (Rodriguez Manufacturing)',
                email: testCredentials.customer2.email,
                password: testCredentials.customer2.password,
                description: 'Manufacturing facility projects',
                color: 'bg-green-100 text-green-800 border-green-200'
            },
            {
                role: 'Customer',
                name: 'David Chen (Chen Water Solutions)',
                email: testCredentials.customer3.email,
                password: testCredentials.customer3.password,
                description: 'Sewerage system upgrade project',
                color: 'bg-green-100 text-green-800 border-green-200'
            }
        ],
        suppliers: [
            {
                role: 'Supplier',
                name: 'Robert Thompson (Thompson Equipment)',
                email: testCredentials.supplier1.email,
                password: testCredentials.supplier1.password,
                description: 'Equipment and machinery supplier',
                color: 'bg-orange-100 text-orange-800 border-orange-200'
            },
            {
                role: 'Supplier',
                name: 'Lisa Martinez (Martinez Steel & Materials)',
                email: testCredentials.supplier2.email,
                password: testCredentials.supplier2.password,
                description: 'Steel and construction materials',
                color: 'bg-orange-100 text-orange-800 border-orange-200'
            },
            {
                role: 'Supplier',
                name: 'James Wilson (Wilson Concrete)',
                email: testCredentials.supplier3.email,
                password: testCredentials.supplier3.password,
                description: 'Concrete and foundation materials',
                color: 'bg-orange-100 text-orange-800 border-orange-200'
            },
            {
                role: 'Supplier',
                name: 'Amanda Davis (Davis Filtration)',
                email: testCredentials.supplier4.email,
                password: testCredentials.supplier4.password,
                description: 'Water filtration systems',
                color: 'bg-orange-100 text-orange-800 border-orange-200'
            }
        ]
    }

    const getFilteredCredentials = () => {
        if (selectedCategory === 'all') {
            return [
                ...credentialGroups.internal,
                ...credentialGroups.customers,
                ...credentialGroups.suppliers
            ]
        }
        return credentialGroups[selectedCategory as keyof typeof credentialGroups] || []
    }

    const handleCopyCredentials = async (email: string, password: string, name: string) => {
        const credentialText = `Email: ${email}\nPassword: ${password}`

        try {
            await navigator.clipboard.writeText(credentialText)
            setCopiedCredential(name)
            setTimeout(() => setCopiedCredential(null), 2000)
        } catch (err) {
            console.error('Failed to copy credentials:', err)
        }
    }

    const handleQuickLogin = (email: string, password: string) => {
        if (onCredentialSelect) {
            onCredentialSelect(email, password)
        }
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Test Login Credentials</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            Quick access to demo accounts for testing different user roles
                        </p>
                    </div>
                    <div className="text-2xl">🔑</div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === category.id
                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <span className="mr-2">{category.icon}</span>
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Credentials List */}
            <div className="px-6 py-4">
                <div className="space-y-4">
                    {getFilteredCredentials().map((credential, index) => (
                        <div
                            key={index}
                            className={`border rounded-lg p-4 transition-all hover:shadow-md ${credential.color}`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-50">
                                            {credential.role}
                                        </span>
                                    </div>

                                    <h4 className="font-medium text-gray-900 mb-1">
                                        {credential.name}
                                    </h4>

                                    <p className="text-sm text-gray-600 mb-3">
                                        {credential.description}
                                    </p>

                                    <div className="space-y-1 text-sm">
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-16">Email:</span>
                                            <code className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                                                {credential.email}
                                            </code>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium text-gray-700 w-16">Password:</span>
                                            <code className="bg-white bg-opacity-50 px-2 py-1 rounded text-xs">
                                                {credential.password}
                                            </code>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col space-y-2 ml-4">
                                    <button
                                        onClick={() => handleQuickLogin(credential.email, credential.password)}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        Quick Login
                                    </button>

                                    <button
                                        onClick={() => handleCopyCredentials(credential.email, credential.password, credential.name)}
                                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                    >
                                        {copiedCredential === credential.name ? (
                                            <>
                                                <span className="mr-1">✓</span>
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-1">📋</span>
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                        <span className="font-medium">Note:</span> All passwords are "password123" for demo purposes
                    </div>
                    <div className="text-gray-500">
                        {getFilteredCredentials().length} account{getFilteredCredentials().length !== 1 ? 's' : ''} available
                    </div>
                </div>
            </div>
        </div>
    )
}
