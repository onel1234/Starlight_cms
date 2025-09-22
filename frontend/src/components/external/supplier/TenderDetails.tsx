import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTenderDetails } from '../../../hooks/useExternal'
import { LoadingSpinner } from '../../ui/LoadingSpinner'
import { formatters } from '../../../utils/formatters'

export const TenderDetails: React.FC = () => {
    const { tenderId } = useParams<{ tenderId: string }>()
    const { data: tender, isLoading, error } = useTenderDetails(Number(tenderId))

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    if (error || !tender) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-medium">Error Loading Tender</h3>
                <p className="text-red-600 mt-2">Unable to load tender details. Please try again later.</p>
            </div>
        )
    }

    const getUrgencyLevel = (deadline: Date) => {
        const now = new Date()
        const daysUntilDeadline = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilDeadline < 0) return { level: 'expired', color: 'text-red-600', label: 'Expired' }
        if (daysUntilDeadline <= 3) return { level: 'urgent', color: 'text-red-600', label: 'Urgent' }
        if (daysUntilDeadline <= 7) return { level: 'soon', color: 'text-yellow-600', label: 'Due Soon' }
        return { level: 'normal', color: 'text-green-600', label: 'Open' }
    }

    const urgency = getUrgencyLevel(tender.submissionDeadline)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <Link
                            to="/supplier/tenders"
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                            ← Back to Tenders
                        </Link>
                    </div>

                    <div className="flex items-center space-x-3 mb-2">
                        <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {tender.category}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgency.color} bg-opacity-10`}>
                            {urgency.label}
                        </span>
                    </div>

                    <p className="text-gray-600">{tender.description}</p>
                </div>

                {tender.status === 'Open' && urgency.level !== 'expired' && (
                    <Link
                        to={`/supplier/tenders/${tender.id}/quote`}
                        className="ml-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Submit Quotation
                    </Link>
                )}
            </div>

            {/* Key Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Tender Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <span className="block text-sm font-medium text-gray-700">Submission Deadline</span>
                        <div className={`text-lg font-semibold ${urgency.color} mt-1`}>
                            {formatters.date(tender.submissionDeadline)}
                        </div>
                    </div>

                    <div>
                        <span className="block text-sm font-medium text-gray-700">Status</span>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                            {tender.status}
                        </div>
                    </div>

                    {tender.estimatedValue && (
                        <div>
                            <span className="block text-sm font-medium text-gray-700">Estimated Value</span>
                            <div className="text-lg font-semibold text-gray-900 mt-1">
                                {formatters.currency(tender.estimatedValue)}
                            </div>
                        </div>
                    )}

                    <div>
                        <span className="block text-sm font-medium text-gray-700">Contact Person</span>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                            {tender.contactPerson}
                        </div>
                        <div className="text-sm text-gray-600">
                            {tender.contactEmail}
                        </div>
                    </div>
                </div>
            </div>
            {/* Requirements */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-2">
                    {tender.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2 mt-1">✓</span>
                            <span className="text-gray-700">{requirement}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Documents */}
            {tender.documents.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Tender Documents</h2>
                    <div className="space-y-3">
                        {tender.documents.map(document => (
                            <div key={document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <div className="font-medium text-gray-900">{document.name}</div>
                                        {document.description && (
                                            <div className="text-sm text-gray-600">{document.description}</div>
                                        )}
                                        {document.required && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                                                Required
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => window.open(document.url, '_blank')}
                                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                                >
                                    <span className="mr-2">📥</span>
                                    Download
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Link
                    to="/supplier/tenders"
                    className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Back to Tenders
                </Link>

                {tender.status === 'Open' && urgency.level !== 'expired' && (
                    <Link
                        to={`/supplier/tenders/${tender.id}/quote`}
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Submit Quotation
                    </Link>
                )}
            </div>
        </div>
    )
}